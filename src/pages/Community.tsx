import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

const Community = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchPosts = async () => {
    if (!user) return;

    const { data: postsData, error } = await supabase
      .from("community_posts")
      .select("id, content, created_at, author_id")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("خطأ في تحميل المنشورات");
      setLoading(false);
      return;
    }

    // Get author names, likes, and comments counts
    const enrichedPosts = await Promise.all(
      (postsData || []).map(async (post) => {
        const [{ data: profile }, { count: likesCount }, { count: commentsCount }, { data: userLike }] =
          await Promise.all([
            supabase.from("profiles").select("full_name").eq("user_id", post.author_id).maybeSingle(),
            supabase.from("community_likes").select("*", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("community_comments").select("*", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("community_likes").select("id").eq("post_id", post.id).eq("user_id", user.id).maybeSingle(),
          ]);

        return {
          ...post,
          author_name: profile?.full_name || "مستخدم",
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          is_liked: !!userLike,
        };
      })
    );

    setPosts(enrichedPosts);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (role !== "parent" && role !== "specialist" && role !== "admin") {
      // User has no role yet, let them view but not post
    }
    fetchPosts();
  }, [user]);

  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from("community_posts").insert({
      author_id: user.id,
      content: newPost.trim(),
    });
    if (error) {
      toast.error("خطأ في نشر المنشور");
    } else {
      toast.success("تم نشر منشورك!");
      setNewPost("");
      fetchPosts();
    }
    setPosting(false);
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    if (isLiked) {
      await supabase.from("community_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    } else {
      await supabase.from("community_likes").insert({ post_id: postId, user_id: user.id });
    }
    fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    const { error } = await supabase.from("community_posts").delete().eq("id", postId);
    if (error) toast.error("خطأ في الحذف");
    else fetchPosts();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            مجتمع الدعم
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">قصص وتجارب ملهمة</h1>
          <p className="text-muted-foreground text-lg">شارك تجربتك وألهم غيرك</p>
        </div>

        {/* New post */}
        {user && (
          <div className="p-6 rounded-2xl border border-border bg-card mb-8">
            <h3 className="font-bold mb-4">شارك تجربتك</h3>
            <Textarea
              placeholder="اكتب تجربتك أو نصيحتك..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="rounded-xl mb-3"
              rows={3}
            />
            <Button className="rounded-xl btn-bounce gap-2" onClick={handlePost} disabled={posting}>
              <Send className="w-4 h-4" />
              {posting ? "جاري النشر..." : "نشر"}
            </Button>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جاري تحميل المنشورات...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">لا توجد منشورات بعد. كن أول من يشارك!</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="p-6 rounded-2xl border border-border bg-card card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">😊</span>
                  <div>
                    <span className="font-bold text-sm">{post.author_name}</span>
                    <span className="text-xs text-muted-foreground mr-2">• {timeAgo(post.created_at)}</span>
                  </div>
                  {(post.author_id === user?.id || role === "admin") && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="mr-auto text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-foreground/80 leading-relaxed mb-4">{post.content}</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id, post.is_liked)}
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      post.is_liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.is_liked ? "fill-current" : ""}`} />
                    {post.likes_count}
                  </button>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Community;
