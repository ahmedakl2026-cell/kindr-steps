import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowRight, User } from "lucide-react";

interface Conversation {
  id: string;
  parent_id: string;
  specialist_id: string;
  updated_at: string;
  other_name: string;
  other_role: string;
  last_message?: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

const Messages = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const specialistUserId = searchParams.get("specialist");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadConversations();
  }, [user]);

  // Auto-create conversation if coming from specialist page
  useEffect(() => {
    if (specialistUserId && user && role === "parent") {
      createOrOpenConversation(specialistUserId);
    }
  }, [specialistUserId, user, role]);

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);

    const { data: convos } = await supabase
      .from("conversations")
      .select("*")
      .or(`parent_id.eq.${user.id},specialist_id.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (!convos || convos.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Get other user profiles
    const otherIds = convos.map((c) =>
      c.parent_id === user.id ? c.specialist_id : c.parent_id
    );

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", otherIds);

    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", otherIds);

    // Get last messages and unread counts
    const enriched: Conversation[] = await Promise.all(
      convos.map(async (c) => {
        const otherId = c.parent_id === user.id ? c.specialist_id : c.parent_id;
        const prof = profiles?.find((p) => p.user_id === otherId);
        const roleData = roles?.find((r) => r.user_id === otherId);

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .eq("is_read", false)
          .neq("sender_id", user.id);

        return {
          ...c,
          other_name: prof?.full_name || "مستخدم",
          other_role: roleData?.role === "specialist" ? "متخصص" : roleData?.role === "parent" ? "ولي أمر" : "مدير",
          last_message: lastMsg?.content,
          unread_count: count || 0,
        };
      })
    );

    setConversations(enriched);
    setLoading(false);
  };

  const createOrOpenConversation = async (specialistId: string) => {
    if (!user) return;

    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("parent_id", user.id)
      .eq("specialist_id", specialistId)
      .maybeSingle();

    if (existing) {
      setActiveConversation(existing.id);
      loadMessages(existing.id);
      return;
    }

    // Create new conversation
    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({ parent_id: user.id, specialist_id: specialistId })
      .select()
      .single();

    if (newConvo) {
      await loadConversations();
      setActiveConversation(newConvo.id);
      loadMessages(newConvo.id);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    // Mark as read
    if (user) {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .eq("is_read", false);
    }

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const openConversation = (id: string) => {
    setActiveConversation(id);
    loadMessages(id);
  };

  // Realtime subscription
  useEffect(() => {
    if (!activeConversation) return;

    const channel = supabase
      .channel(`messages-${activeConversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversation}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          // Mark as read if not sender
          if (user && newMsg.sender_id !== user.id) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id);
          }
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user || sending) return;
    setSending(true);

    await supabase.from("messages").insert({
      conversation_id: activeConversation,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    // Update conversation timestamp
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", activeConversation);

    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeConvo = conversations.find((c) => c.id === activeConversation);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return d.toLocaleDateString("ar-EG", { weekday: "short" });
    return d.toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <MessageCircle className="w-7 h-7 text-primary" />
          الرسائل
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-220px)] min-h-[500px]">
          {/* Conversations List */}
          <div className={`md:col-span-1 bg-card rounded-2xl border border-border overflow-hidden ${activeConversation ? "hidden md:block" : ""}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">المحادثات</h2>
            </div>
            <ScrollArea className="h-[calc(100%-60px)]">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد محادثات بعد</p>
                  {role === "parent" && (
                    <p className="text-sm mt-2">يمكنك بدء محادثة من صفحة المتخصصين</p>
                  )}
                </div>
              ) : (
                conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => openConversation(convo.id)}
                    className={`w-full p-4 text-right flex items-start gap-3 border-b border-border/50 transition-colors hover:bg-muted/50 ${
                      activeConversation === convo.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground text-sm truncate">{convo.other_name}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(convo.updated_at)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground truncate">
                          {convo.last_message || "ابدأ المحادثة..."}
                        </span>
                        {convo.unread_count > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                            {convo.unread_count}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/70">{convo.other_role}</span>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={`md:col-span-2 bg-card rounded-2xl border border-border overflow-hidden flex flex-col ${!activeConversation ? "hidden md:flex" : ""}`}>
            {activeConversation && activeConvo ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <button
                    className="md:hidden p-1 rounded-lg hover:bg-muted"
                    onClick={() => setActiveConversation(null)}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{activeConvo.other_name}</p>
                    <p className="text-xs text-muted-foreground">{activeConvo.other_role}</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-8">ابدأ المحادثة بإرسال رسالة</p>
                    )}
                    {messages.map((msg) => {
                      const isMine = msg.sender_id === user.id;
                      return (
                        <div key={msg.id} className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
                          <div
                            className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                              isMine
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted text-foreground rounded-bl-sm"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t border-border flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك..."
                    className="rounded-xl text-right"
                    dir="rtl"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    size="icon"
                    className="rounded-xl shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>اختر محادثة للبدء</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
