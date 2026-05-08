import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Heart, MessageCircle, Trash2, Sparkles, AlertCircle, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  title: string | null;
  problem: string | null;
  how_helped: string | null;
  result: string | null;
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
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [howHelped, setHowHelped] = useState("");
  const [result, setResult] = useState("");

  const fetchPosts = async () => {
    if (!user) return;
    const { data: postsData, error } = await supabase
      .from("community_posts")
      .select("id, title, problem, how_helped, result, content, created_at, author_id")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("خطأ في تحميل المنشورات");
      setLoading(false);
      return;
    }
    const enriched = await Promise.all(
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
    let finalPosts = enriched;
    if (finalPosts.length === 0) {
      finalPosts = [
        {
          id: "mock-post-1", title: "تحسن ملحوظ في تواصل طفلي", problem: "كان طفلي (مصاب بالتوحد) يواجه صعوبة كبيرة في التعبير عن احتياجاته الأساسية، مما كان يسبب له نوبات غضب مستمرة.", how_helped: "استخدمت بطاقات التواصل البصري الموجودة في ركن الأنشطة، وتواصلت مع د. أحمد محمود الذي وجهني لبعض التمارين اليومية.", result: "أصبح طفلي الآن قادراً على طلب الماء والطعام باستخدام البطاقات، وقلت نوبات الغضب بنسبة كبيرة ولله الحمد.", content: "", created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-1", author_name: "أم يوسف", likes_count: 15, comments_count: 4, is_liked: false
        },
        {
          id: "mock-post-2", title: "تجربتي مع فرط الحركة بالمدرسة", problem: "كانت ابنتي تعاني من تشتت الانتباه داخل الفصل، والمعلمة كانت تشتكي دائماً من حركتها الزائدة وعدم جلوسها في مكانها.", how_helped: "قرأت مقالات (مكتبة الإعاقات) عن فرط الحركة، وحجزت استشارة مع أ. سارة كمال. طبقنا استراتيجيات (المكافآت والمهام القصيرة).", result: "تحسن أداؤها الأكاديمي، وأصبحت المعلمة تمدح تركيزها. أنا فخورة جداً بتقدمها.", content: "", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-2", author_name: "أم ليان", likes_count: 32, comments_count: 8, is_liked: true
        },
        {
          id: "mock-post-3", title: "تطوير المهارات الحركية الدقيقة", problem: "طفلي (متلازمة داون) كان يجد صعوبة في الإمساك بالقلم بشكل صحيح واستخدام المقص.", how_helped: "من خلال معرض الأنشطة، بدأت بتطبيق ألعاب العجين والصلصال وتصنيف الأزرار يومياً.", result: "أصبح قادراً على مسك القلم بوضعية صحيحة وبدأ في تلوين الرسومات بدقة أفضل.", content: "", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-3", author_name: "أبو خالد", likes_count: 8, comments_count: 1, is_liked: false
        },
        {
          id: "mock-post-4", title: "التغلب على الخوف من الأصوات المرتفعة", problem: "ابني كان ينهار بالبكاء عند سماع صوت المكنسة الكهربائية أو الخلاط.", how_helped: "نصحني الأخصائي بتعريضه التدريجي للأصوات مع ربطها بمعززات إيجابية.", result: "لم يعد يبكي، بل أصبح يساعدني في تشغيل المكنسة كجزء من اللعب.", content: "", created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-4", author_name: "أم فهد", likes_count: 22, comments_count: 5, is_liked: true
        },
        {
          id: "mock-post-5", title: "تعديل سلوك العض والضرب", problem: "ابنتي كانت تلجأ للعض والضرب عندما لا تستطيع التعبير عما تريد.", how_helped: "استخدمنا استراتيجية (القصص الاجتماعية) المتاحة في المكتبة لتعليمها بدائل مقبولة للتعبير عن الغضب.", result: "توقفت عن العض تقريباً، وبدأت تستخدم كلمات بسيطة للتعبير عن مشاعرها.", content: "", created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-5", author_name: "أم سارة", likes_count: 45, comments_count: 12, is_liked: false
        },
        {
          id: "mock-post-6", title: "الاستقلالية في ارتداء الملابس", problem: "صعوبة في تعلم ارتداء الملابس وربط الحذاء بسبب ضعف العضلات الدقيقة.", how_helped: "تدربنا على أنشطة (لوحات المهارات اليومية) وتجزئة المهمة لخطوات صغيرة مدعمة بصور.", result: "أصبح يرتدي قميصه وبنطاله بنفسه دون مساعدة، ونحن نعمل الآن على ربط الحذاء.", content: "", created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-6", author_name: "أبو تركي", likes_count: 11, comments_count: 2, is_liked: false
        },
        {
          id: "mock-post-7", title: "الاندماج مع الأطفال في الحديقة", problem: "كان يرفض اللعب مع أقرانه وينعزل بمفرده في زاوية الحديقة.", how_helped: "توجيهات أخصائي السلوك ساعدتنا في تعليمه كيفية (المبادرة باللعب) باستخدام تبادل الأدوار.", result: "اليوم لعب لأول مرة مع طفلين آخرين في لعبة المراجيح وشاركهم الضحك.", content: "", created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-7", author_name: "أم عبدالرحمن", likes_count: 67, comments_count: 15, is_liked: true
        },
        {
          id: "mock-post-8", title: "تحسن جودة النوم", problem: "معاناة شديدة مع الأرق وصعوبة الدخول في النوم، واستيقاظ متكرر.", how_helped: "تطبيق روتين بصري صارم قبل النوم وتقليل المشتتات الحسية كما هو مذكور في قسم التوحد بالمكتبة.", result: "أصبح ينام بشكل أسرع واستمرارية نومه تحسنت بشكل كبير مما انعكس على مزاجه نهاراً.", content: "", created_at: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-8", author_name: "أبو حور", likes_count: 29, comments_count: 6, is_liked: false
        },
        {
          id: "mock-post-9", title: "نطق الكلمة الأولى!", problem: "تأخر شديد في النطق، حتى عمر 4 سنوات لم ينطق أي كلمة واضحة.", how_helped: "جلسات التخاطب المستمرة وتمارين النفخ والمضغ الموصى بها.", result: "أخيراً.. اليوم نطق كلمة (ماما) بوضوح لأول مرة! شعور لا يوصف.", content: "", created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-9", author_name: "أم ديم", likes_count: 150, comments_count: 45, is_liked: true
        },
        {
          id: "mock-post-10", title: "اتباع التعليمات المتسلسلة", problem: "ينسى التعليمات المكونة من خطوتين أو أكثر (مثل: هات الحذاء والبس معطفك).", how_helped: "استخدام الألعاب التعليمية في ركن الأطفال التي تتطلب ذاكرة وتتبع خطوات.", result: "تطورت ذاكرته العاملة وأصبح يستجيب للتعليمات المزدوجة بتركيز أعلى.", content: "", created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), author_id: "mock-author-10", author_name: "أم ماجد", likes_count: 18, comments_count: 3, is_liked: false
        }
      ];
    }

    setPosts(finalPosts);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPosts();
  }, [user]);

  const handlePost = async () => {
    if (!user) return;
    if (!title.trim() || !problem.trim() || !howHelped.trim() || !result.trim()) {
      toast.error("الرجاء تعبئة جميع الحقول");
      return;
    }
    setPosting(true);
    const content = `${problem.trim()}\n\n${howHelped.trim()}\n\n${result.trim()}`;
    const { error } = await supabase.from("community_posts").insert({
      author_id: user.id,
      title: title.trim(),
      problem: problem.trim(),
      how_helped: howHelped.trim(),
      result: result.trim(),
      content,
    });
    if (error) {
      toast.error("خطأ في نشر التجربة");
    } else {
      toast.success("تم نشر تجربتك!");
      setTitle("");
      setProblem("");
      setHowHelped("");
      setResult("");
      setOpen(false);
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
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            مجتمع الدعم
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">قصص وتجارب حقيقية</h1>
          <p className="text-muted-foreground text-lg">
            شارك تجربتك وكيف ساعدتك المنصة في رحلتك مع طفلك
          </p>
        </div>

        {/* New post CTA */}
        {user && (
          <div className="flex justify-center mb-10">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-2xl gap-2 btn-bounce">
                  <Sparkles className="w-5 h-5" />
                  شارك تجربتك
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>اكتب قصتك</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>عنوان القصة</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="عنوان موجز يلخّص تجربتك"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" /> ما هي المشكلة؟
                    </Label>
                    <Textarea
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      placeholder="وصف التحدي الذي واجهته مع طفلك"
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> كيف ساعدتك المنصة؟
                    </Label>
                    <Textarea
                      value={howHelped}
                      onChange={(e) => setHowHelped(e.target.value)}
                      placeholder="ما الأدوات أو المتخصصين الذين استخدمتهم"
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary" /> النتيجة
                    </Label>
                    <Textarea
                      value={result}
                      onChange={(e) => setResult(e.target.value)}
                      placeholder="ما الذي تغيّر بعد ذلك؟"
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                  <Button onClick={handlePost} disabled={posting} className="w-full rounded-xl gap-2 btn-bounce">
                    <Send className="w-4 h-4" />
                    {posting ? "جاري النشر..." : "نشر القصة"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جاري تحميل القصص...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 rounded-3xl bg-muted/40 border border-dashed border-border">
            <Heart className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد قصص بعد. كن أول من يشارك تجربته!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-3xl border border-border bg-card overflow-hidden card-hover"
              >
                {/* Header */}
                <header className="flex items-center gap-3 p-5 border-b border-border bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg">
                    😊
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{post.author_name}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                  </div>
                  {(post.author_id === user?.id || role === "admin") && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </header>

                {/* Body */}
                <div className="p-6">
                  {post.title && (
                    <h2 className="text-xl md:text-2xl font-extrabold mb-5 leading-snug">
                      {post.title}
                    </h2>
                  )}

                  {post.problem || post.how_helped || post.result ? (
                    <div className="space-y-4">
                      {post.problem && (
                        <StorySection
                          icon={AlertCircle}
                          label="المشكلة"
                          color="bg-destructive/10 text-destructive"
                          text={post.problem}
                        />
                      )}
                      {post.how_helped && (
                        <StorySection
                          icon={Sparkles}
                          label="كيف ساعدتني المنصة"
                          color="bg-primary/10 text-primary"
                          text={post.how_helped}
                        />
                      )}
                      {post.result && (
                        <StorySection
                          icon={CheckCircle2}
                          label="النتيجة"
                          color="bg-secondary/15 text-secondary"
                          text={post.result}
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <footer className="flex items-center gap-5 px-6 py-3 border-t border-border bg-muted/20">
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
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

const StorySection = ({
  icon: Icon,
  label,
  color,
  text,
}: {
  icon: any;
  label: string;
  color: string;
  text: string;
}) => (
  <div className="flex gap-3">
    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1">
      <p className="font-bold text-sm mb-1">{label}</p>
      <p className="text-foreground/80 leading-relaxed text-sm">{text}</p>
    </div>
  </div>
);

export default Community;
