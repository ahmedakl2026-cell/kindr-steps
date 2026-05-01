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
import { Star, Trophy, Smile, RotateCcw, ImagePlus, Trash2, Images } from "lucide-react";
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

  const isAdmin = role === "admin";

  const fetchActivities = async () => {
    setLoadingGallery(true);
    const { data, error } = await supabase
      .from("kids_activities")
      .select("id, title, description, image_url")
      .order("created_at", { ascending: false });
    if (error) toast.error("تعذر تحميل المعرض");
    else setActivities(data || []);
    setLoadingGallery(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.map((a) => (
                  <article
                    key={a.id}
                    className="group rounded-3xl overflow-hidden border border-border bg-card card-hover"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={a.image_url}
                        alt={a.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg leading-tight">{a.title}</h3>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(a)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {a.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {a.description}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default KidsCorner;
