import { useState } from "react";
import Layout from "@/components/Layout";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const mockPosts = [
  {
    id: 1,
    author: "أم ياسر",
    avatar: "👩",
    content: "ابني ياسر بدأ ينطق كلمات جديدة بعد 3 أشهر من جلسات النطق. لا تفقدوا الأمل! كل خطوة تُحسب 💪",
    likes: 24,
    comments: 5,
    time: "منذ ساعتين",
  },
  {
    id: 2,
    author: "أبو ريم",
    avatar: "👨",
    content: "نصيحتي لكل أب وأم: الروتين اليومي ساعد ابنتي كثيراً. أصبحت أكثر هدوءاً واستقراراً. جربوا الجداول المرئية!",
    likes: 18,
    comments: 3,
    time: "منذ 5 ساعات",
  },
  {
    id: 3,
    author: "معلمة هدى",
    avatar: "👩‍🏫",
    content: "كمعلمة تعليم خاص، أؤكد أن الدمج مع الأطفال الآخرين مهم جداً. شاهدت تحسناً ملحوظاً في مهارات التواصل عند طلابي.",
    likes: 31,
    comments: 8,
    time: "أمس",
  },
];

const Community = () => {
  const [posts, setPosts] = useState(mockPosts);
  const [newPost, setNewPost] = useState("");
  const [authorName, setAuthorName] = useState("");

  const handlePost = () => {
    if (!newPost.trim() || !authorName.trim()) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    const post = {
      id: Date.now(),
      author: authorName,
      avatar: "😊",
      content: newPost,
      likes: 0,
      comments: 0,
      time: "الآن",
    };
    setPosts([post, ...posts]);
    setNewPost("");
    setAuthorName("");
    toast.success("تمت مشاركتك بنجاح!");
  };

  const handleLike = (id: number) => {
    setPosts(posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
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
          <p className="text-muted-foreground text-lg">شارك تجربتك وألهم غيرك (محتوى تجريبي)</p>
        </div>

        {/* New post */}
        <div className="p-6 rounded-2xl border border-border bg-card mb-8">
          <h3 className="font-bold mb-4">شارك تجربتك</h3>
          <Input placeholder="اسمك" value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="rounded-xl mb-3" />
          <Textarea placeholder="اكتب تجربتك أو نصيحتك..." value={newPost} onChange={(e) => setNewPost(e.target.value)} className="rounded-xl mb-3" rows={3} />
          <Button className="rounded-xl btn-bounce gap-2" onClick={handlePost}>
            <Send className="w-4 h-4" />
            نشر
          </Button>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="p-6 rounded-2xl border border-border bg-card card-hover">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{post.avatar}</span>
                <div>
                  <span className="font-bold text-sm">{post.author}</span>
                  <span className="text-xs text-muted-foreground mr-2">• {post.time}</span>
                </div>
              </div>
              <p className="text-foreground/80 leading-relaxed mb-4">{post.content}</p>
              <div className="flex items-center gap-4">
                <button onClick={() => handleLike(post.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors">
                  <Heart className="w-4 h-4" />
                  {post.likes}
                </button>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Community;
