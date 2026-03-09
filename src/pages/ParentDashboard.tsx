import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { TrendingUp, Award, Lightbulb, MessageSquare, User, Plus, Baby, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Child {
  id: string;
  name: string;
  birth_date: string | null;
  condition: string;
  notes: string | null;
}

const tips = [
  "خصص 15 دقيقة يومياً للعب مع طفلك ألعاب تعليمية",
  "امدح طفلك على المحاولة وليس فقط على النتيجة",
  "استخدم الصور والرسوم لتوضيح الروتين اليومي",
  "وفر بيئة هادئة أثناء وقت التعلم",
];

const suggestedActivities = [
  { title: "لعبة الذاكرة", emoji: "🧠", time: "10 دقائق" },
  { title: "تلوين الحروف", emoji: "🎨", time: "15 دقيقة" },
  { title: "قصة قبل النوم", emoji: "📖", time: "10 دقائق" },
  { title: "حركة وتمارين", emoji: "🤸", time: "20 دقيقة" },
];

const ParentDashboard = () => {
  const { user, profile, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddChild, setShowAddChild] = useState(false);
  const [childName, setChildName] = useState("");
  const [childBirthDate, setChildBirthDate] = useState("");
  const [childCondition, setChildCondition] = useState<string>("adhd");
  const [childNotes, setChildNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchChildren = async () => {
      const { data, error } = await supabase
        .from("children")
        .select("*")
        .eq("parent_id", user.id)
        .order("created_at");
      if (!error) setChildren(data || []);
      setLoading(false);
    };
    fetchChildren();
  }, [user]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name: childName,
      birth_date: childBirthDate || null,
      condition: childCondition as any,
      notes: childNotes || null,
    });
    if (error) {
      toast.error("خطأ في إضافة الطفل");
    } else {
      toast.success("تمت إضافة بيانات الطفل!");
      setChildName("");
      setChildBirthDate("");
      setChildNotes("");
      setShowAddChild(false);
      // Refresh
      const { data } = await supabase.from("children").select("*").eq("parent_id", user.id).order("created_at");
      setChildren(data || []);
    }
    setSubmitting(false);
  };

  const handleDeleteChild = async (id: string) => {
    const { error } = await supabase.from("children").delete().eq("id", id);
    if (!error) {
      setChildren(children.filter((c) => c.id !== id));
      toast.success("تم حذف بيانات الطفل");
    }
  };

  const conditionLabel = (c: string) => {
    switch (c) {
      case "adhd": return "اضطراب فرط الحركة وتشتت الانتباه";
      case "down_syndrome": return "متلازمة داون";
      default: return c;
    }
  };

  const conditionEmoji = (c: string) => (c === "adhd" ? "⚡" : "💛");

  if (authLoading || loading) {
    return <Layout><div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">جاري التحميل...</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">مرحباً، {profile?.full_name || "ولي الأمر"} 👋</h1>
            <p className="text-muted-foreground">لوحة تحكم ولي الأمر</p>
          </div>
        </div>

        {/* Children */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">أطفالي</h2>
            </div>
            <Button variant="outline" className="rounded-xl gap-2" onClick={() => setShowAddChild(true)}>
              <Plus className="w-4 h-4" />
              إضافة طفل
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-border bg-muted/30 text-center">
              <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لم تضف أي أطفال بعد</p>
              <Button className="mt-4 rounded-xl" onClick={() => setShowAddChild(true)}>إضافة طفل</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <div key={child.id} className="bg-gradient-warm rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{conditionEmoji(child.condition)}</span>
                      <div>
                        <h3 className="text-xl font-bold">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">{conditionLabel(child.condition)}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteChild(child.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {child.birth_date && (
                    <p className="text-xs text-muted-foreground mt-1">تاريخ الميلاد: {child.birth_date}</p>
                  )}
                  {child.notes && (
                    <p className="text-sm text-muted-foreground mt-2 bg-card/50 rounded-xl p-3">{child.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add child modal */}
        {showAddChild && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
            <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-6">إضافة طفل</h3>
              <form onSubmit={handleAddChild} className="space-y-4">
                <Input placeholder="اسم الطفل" value={childName} onChange={(e) => setChildName(e.target.value)} required className="rounded-xl" />
                <Input type="date" value={childBirthDate} onChange={(e) => setChildBirthDate(e.target.value)} className="rounded-xl" />
                <div>
                  <p className="text-sm font-medium mb-2">نوع الحالة:</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setChildCondition("adhd")}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        childCondition === "adhd" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      ⚡ فرط الحركة
                    </button>
                    <button
                      type="button"
                      onClick={() => setChildCondition("down_syndrome")}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        childCondition === "down_syndrome" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      💛 متلازمة داون
                    </button>
                  </div>
                </div>
                <Textarea placeholder="ملاحظات عن حالة الطفل..." value={childNotes} onChange={(e) => setChildNotes(e.target.value)} className="rounded-xl" rows={3} />
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1 rounded-xl btn-bounce" disabled={submitting}>
                    {submitting ? "جاري الإضافة..." : "إضافة الطفل"}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowAddChild(false)}>إلغاء</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily tips */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-accent-foreground" />
              <h3 className="text-lg font-bold">نصائح اليوم</h3>
            </div>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested activities */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-secondary" />
              <h3 className="text-lg font-bold">أنشطة مقترحة</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {suggestedActivities.map((a) => (
                <div key={a.title} className="p-3 rounded-xl border border-border text-center">
                  <div className="text-2xl mb-1">{a.emoji}</div>
                  <h4 className="font-bold text-xs mb-1">{a.title}</h4>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
