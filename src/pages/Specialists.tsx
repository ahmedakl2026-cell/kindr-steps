import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Calendar, CheckCircle, Star, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Specialist {
  id: string;
  user_id: string;
  specialty: string;
  bio: string | null;
  experience_years: number | null;
  conditions: string[];
  avatar_url: string | null;
  credentials: string | null;
  full_name: string;
}

const specialtyFilters = ["الكل", "نطق وتخاطب", "علاج وظيفي", "سلوك", "نفسي أطفال", "تعليم خاص"];

const Specialists = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [filter, setFilter] = useState("الكل");
  const [bookingFor, setBookingFor] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialists = async () => {
      const { data, error } = await supabase
        .from("specialists")
        .select("id, user_id, specialty, bio, experience_years, conditions, avatar_url, credentials")
        .eq("is_approved", true);

      if (error) {
        toast.error("خطأ في تحميل المتخصصين");
        setLoading(false);
        return;
      }

      // Get names
      const enriched = await Promise.all(
        (data || []).map(async (s) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", s.user_id)
            .maybeSingle();
          return { ...s, full_name: profile?.full_name || "متخصص" };
        })
      );

      setSpecialists(enriched);
      setLoading(false);
    };

    fetchSpecialists();
  }, []);

  const filtered =
    filter === "الكل" ? specialists : specialists.filter((s) => s.specialty.includes(filter));

  const bookingSpecialist = specialists.find((s) => s.id === bookingFor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("تم إرسال طلب الحجز بنجاح!");
    setTimeout(() => {
      setBookingFor(null);
      setSubmitted(false);
    }, 2000);
  };

  const conditionLabel = (c: string) => {
    switch (c) {
      case "adhd": return "⚡ فرط الحركة";
      case "down_syndrome": return "💛 متلازمة داون";
      case "autism": return "🧩 طيف التوحد";
      default: return c;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            فريق المتخصصين
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">المتخصصون</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            تعرّف على فريق المتخصصين واحجز استشارتك
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {specialtyFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">جاري تحميل المتخصصين...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">لا يوجد متخصصون حالياً في هذا التخصص</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {filtered.map((s) => (
              <div key={s.id} className="p-6 rounded-2xl border border-border bg-card card-hover flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  {s.avatar_url ? (
                    <img
                      src={s.avatar_url}
                      alt={s.full_name}
                      className="w-16 h-16 rounded-2xl object-cover bg-muted border border-border flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl flex-shrink-0">👨‍⚕️</div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold leading-tight">{s.full_name}</h3>
                    <p className="text-sm text-primary font-medium">{s.specialty}</p>
                    {s.experience_years && (
                      <p className="text-xs text-muted-foreground mt-1">خبرة {s.experience_years} سنوات</p>
                    )}
                  </div>
                </div>
                {s.bio && <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{s.bio}</p>}
                {s.credentials && (
                  <div className="mb-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-1 text-xs font-bold text-foreground mb-1">
                      <Star className="w-3 h-3 text-primary" />
                      الشهادات والمؤهلات
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{s.credentials}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mb-4">
                  {s.conditions.map((c) => (
                    <span key={c} className="text-xs bg-muted px-2 py-1 rounded-lg">{conditionLabel(c)}</span>
                  ))}
                </div>
                <div className="mt-auto"></div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl btn-bounce"
                    onClick={() => user ? setBookingFor(s.id) : toast.error("يرجى تسجيل الدخول أولاً")}
                  >
                    <Calendar className="w-4 h-4 ml-2" />
                    احجز استشارة
                  </Button>
                  {user && role === "parent" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl"
                      onClick={() => navigate(`/messages?specialist=${s.user_id}`)}
                      title="راسل"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking modal */}
        {bookingFor && bookingSpecialist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
            <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">تم الحجز!</h3>
                  <p className="text-muted-foreground">سيتم التواصل معك قريباً</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-1">حجز استشارة</h3>
                  <p className="text-sm text-muted-foreground mb-6">مع {bookingSpecialist.full_name} - {bookingSpecialist.specialty}</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="رقم الهاتف" type="tel" required className="rounded-xl" />
                    <Input type="date" required className="rounded-xl" />
                    <Textarea placeholder="وصف موجز للحالة" className="rounded-xl" rows={3} />
                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1 rounded-xl btn-bounce">إرسال الحجز</Button>
                      <Button type="button" variant="outline" className="rounded-xl" onClick={() => setBookingFor(null)}>إلغاء</Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Specialists;
