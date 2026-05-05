import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
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
import { Star, Trophy, Smile, RotateCcw, ImagePlus, Trash2, Images, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const emojis = ["🐱", "🐶", "🌟", "🎈", "🌈", "🦋", "🐱", "🐶", "🌟", "🎈", "🌈", "🦋"];

const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface Activity {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
}

const KidsCorner = () => {
  const { user, role } = useAuth();
  const [cards, setCards] = useState(() =>
    shuffleArray(emojis.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })))
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [points, setPoints] = useState(0);
  const [matches, setMatches] = useState(0);
  const [calmMode, setCalmMode] = useState(false);

  // Gallery
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  const isAdmin = role === "admin";

  const fetchLikes = async (activityIds: string[]) => {
    if (activityIds.length === 0) return;
    const { data } = await supabase
      .from("activity_likes")
      .select("activity_id, user_id")
      .in("activity_id", activityIds);
    const counts: Record<string, number> = {};
    const mine = new Set<string>();
    (data || []).forEach((row: any) => {
      counts[row.activity_id] = (counts[row.activity_id] || 0) + 1;
      if (user && row.user_id === user.id) mine.add(row.activity_id);
    });
    setLikeCounts(counts);
    setLikedIds(mine);
  };

  const fetchActivities = async () => {
    setLoadingGallery(true);
    const { data, error } = await supabase
      .from("kids_activities")
      .select("id, title, description, image_url")
      .order("created_at", { ascending: false });
    if (error) toast.error("تعذر تحميل المعرض");
    else {
      setActivities(data || []);
      fetchLikes((data || []).map((a) => a.id));
    }
    setLoadingGallery(false);
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggleLike = async (activityId: string) => {
    if (!user) {
      toast.error("سجّل الدخول للإعجاب");
      return;
    }
    const isLiked = likedIds.has(activityId);
    // optimistic update
    const newLiked = new Set(likedIds);
    const newCounts = { ...likeCounts };
    if (isLiked) {
      newLiked.delete(activityId);
      newCounts[activityId] = Math.max(0, (newCounts[activityId] || 1) - 1);
    } else {
      newLiked.add(activityId);
      newCounts[activityId] = (newCounts[activityId] || 0) + 1;
    }
    setLikedIds(newLiked);
    setLikeCounts(newCounts);

    if (isLiked) {
      const { error } = await supabase
        .from("activity_likes")
        .delete()
        .eq("activity_id", activityId)
        .eq("user_id", user.id);
      if (error) {
        toast.error("تعذر إلغاء الإعجاب");
        fetchLikes(activities.map((a) => a.id));
      }
    } else {
      const { error } = await supabase
        .from("activity_likes")
        .insert({ activity_id: activityId, user_id: user.id });
      if (error) {
        toast.error("تعذر تسجيل الإعجاب");
        fetchLikes(activities.map((a) => a.id));
      }
    }
  };

  const handleFlip = (id: number) => {
    if (selected.length === 2) return;
    const card = cards[id];
    if (card.flipped || card.matched) return;
    const newCards = [...cards];
    newCards[id] = { ...newCards[id], flipped: true };
    const newSelected = [...selected, id];
    setCards(newCards);
    setSelected(newSelected);
    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (newCards[first].emoji === newCards[second].emoji) {
        setTimeout(() => {
          const matched = [...newCards];
          matched[first] = { ...matched[first], matched: true };
          matched[second] = { ...matched[second], matched: true };
          setCards(matched);
          setSelected([]);
          setPoints((p) => p + 10);
          setMatches((m) => m + 1);
        }, 500);
      } else {
        setTimeout(() => {
          const reset = [...newCards];
          reset[first] = { ...reset[first], flipped: false };
          reset[second] = { ...reset[second], flipped: false };
          setCards(reset);
          setSelected([]);
        }, 1000);
      }
    }
  };

  const resetGame = () => {
    setCards(shuffleArray(emojis.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }))));
    setSelected([]);
    setPoints(0);
    setMatches(0);
  };

  const allMatched = matches === emojis.length / 2;

  const handleUpload = async () => {
    if (!user || !file || !title.trim()) {
      toast.error("الرجاء إضافة عنوان وصورة");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("kids-activities")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) {
      toast.error("فشل رفع الصورة");
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from("kids-activities").getPublicUrl(path);
    const { error: insErr } = await supabase.from("kids_activities").insert({
      title: title.trim(),
      description: description.trim() || null,
      image_url: pub.publicUrl,
      created_by: user.id,
    });
    if (insErr) {
      toast.error("تعذر حفظ النشاط");
    } else {
      toast.success("تمت إضافة النشاط");
      setTitle("");
      setDescription("");
      setFile(null);
      setDialogOpen(false);
      fetchActivities();
    }
    setUploading(false);
  };

  const handleDelete = async (a: Activity) => {
    if (!confirm(`حذف النشاط "${a.title}"؟`)) return;
    const { error } = await supabase.from("kids_activities").delete().eq("id", a.id);
    if (error) toast.error("تعذر الحذف");
    else {
      toast.success("تم الحذف");
      fetchActivities();
    }
  };

  return (
    <Layout>
      <div className={`min-h-screen transition-colors duration-500 ${calmMode ? "bg-khatwa-light-blue" : ""}`}>
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-khatwa-light-yellow text-accent-foreground rounded-full px-4 py-2 text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              ركن الأطفال
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">هيا نلعب ونتعلم! 🎮</h1>
            <p className="text-muted-foreground text-lg">اقلب البطاقات وابحث عن الأزواج المتشابهة</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-card border border-border rounded-2xl px-5 py-3">
              <Trophy className="w-5 h-5 text-accent-foreground" />
              <span className="font-bold text-lg">{points}</span>
              <span className="text-sm text-muted-foreground">نقطة</span>
            </div>
            <Button variant="outline" className="rounded-2xl gap-2 btn-bounce" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
              لعبة جديدة
            </Button>
            <Button
              variant={calmMode ? "default" : "outline"}
              className="rounded-2xl gap-2 btn-bounce"
              onClick={() => setCalmMode(!calmMode)}
            >
              <Smile className="w-4 h-4" />
              وضع التهدئة
            </Button>
          </div>

          {/* Game */}
          {allMatched ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6 animate-float">🎉</div>
              <h2 className="text-3xl font-bold mb-4">أحسنت! لقد فزت!</h2>
              <p className="text-lg text-muted-foreground mb-6">حصلت على {points} نقطة</p>
              <Button size="lg" className="rounded-2xl btn-bounce" onClick={resetGame}>
                العب مرة أخرى
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 max-w-lg mx-auto">
              {cards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => handleFlip(i)}
                  className={`aspect-square rounded-2xl text-3xl md:text-4xl flex items-center justify-center transition-all duration-300 btn-bounce border-2 ${
                    card.matched
                      ? "bg-khatwa-light-green border-secondary scale-95 opacity-70"
                      : card.flipped
                      ? "bg-card border-primary shadow-lg scale-105"
                      : "bg-muted border-border hover:border-primary/50 hover:shadow-md cursor-pointer"
                  }`}
                >
                  {card.flipped || card.matched ? card.emoji : "❓"}
                </button>
              ))}
            </div>
          )}

          {/* Activities Gallery */}
          <section className="mt-20">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-3">
                  <Images className="w-4 h-4" />
                  معرض الأنشطة
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">صور وأنشطة ملهمة</h2>
                <p className="text-muted-foreground mt-1">استعرض أنشطة عملية مناسبة للأطفال</p>
              </div>
              {isAdmin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-2xl gap-2 btn-bounce">
                      <ImagePlus className="w-4 h-4" />
                      إضافة نشاط
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>إضافة نشاط جديد</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>العنوان</Label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="مثال: نشاط التلوين الحر"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>الوصف القصير</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="وصف موجز للنشاط وفائدته"
                          className="rounded-xl"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>الصورة</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="rounded-xl"
                        />
                      </div>
                      <Button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full rounded-xl btn-bounce"
                      >
                        {uploading ? "جاري الرفع..." : "نشر النشاط"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {loadingGallery ? (
              <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
            ) : activities.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-muted/40 border border-dashed border-border">
                <Images className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  لا توجد أنشطة بعد{isAdmin ? " — كن أول من يضيف نشاطًا" : ""}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
                {activities.map((a, idx) => {
                  const palettes = [
                    "from-khatwa-blue/80 via-khatwa-blue/40",
                    "from-khatwa-green/80 via-khatwa-green/40",
                    "from-khatwa-yellow/80 via-khatwa-yellow/40",
                    "from-primary/80 via-primary/40",
                  ];
                  const tint = palettes[idx % palettes.length];
                  return (
                    <article
                      key={a.id}
                      tabIndex={0}
                      className="group relative rounded-3xl overflow-hidden border-4 border-card shadow-md hover:shadow-2xl focus-within:shadow-2xl transition-all duration-500 hover:-translate-y-2 focus-within:-translate-y-2 cursor-pointer bg-card"
                    >
                      {/* Image */}
                      <div className="aspect-[4/5] overflow-hidden bg-muted">
                        <img
                          src={a.image_url}
                          alt={a.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-focus-within:scale-110"
                        />
                      </div>

                      {/* Permanent gradient for title legibility */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />

                      {/* Hover color tint */}
                      <div
                        className={`pointer-events-none absolute inset-0 bg-gradient-to-tr ${tint} to-transparent opacity-0 group-hover:opacity-90 group-focus-within:opacity-90 transition-opacity duration-500 mix-blend-multiply`}
                      />

                      {/* Title (always visible) */}
                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 transition-transform duration-500 group-hover:translate-y-[-4px]">
                        <h3
                          className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]"
                          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
                        >
                          {a.title}
                        </h3>
                        {/* Description revealed on hover */}
                        {a.description && (
                          <p className="mt-2 text-sm md:text-base text-white/95 leading-relaxed max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 group-focus-within:max-h-40 group-focus-within:opacity-100 overflow-hidden transition-all duration-500">
                            {a.description}
                          </p>
                        )}
                      </div>

                      {/* Playful badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center shadow-lg text-2xl rotate-[-8deg] group-hover:rotate-[8deg] transition-transform duration-500">
                        {["🎨", "🧩", "🌟", "🎈", "🦋", "🌈"][idx % 6]}
                      </div>

                      {/* Admin delete */}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(a);
                          }}
                          className="absolute top-4 left-4 bg-white/90 hover:bg-destructive hover:text-white text-destructive rounded-full w-10 h-10 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default KidsCorner;
