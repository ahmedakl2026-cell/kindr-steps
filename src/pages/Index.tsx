import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  BookOpen,
  Users,
  Heart,
  Star,
  ArrowLeft,
  Shield,
  Smile,
  Sparkles,
  Compass,
  HeartHandshake,
} from "lucide-react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

const features = [
  {
    icon: Gamepad2,
    title: "ركن الأطفال",
    desc: "ألعاب تعليمية ممتعة ومعرض أنشطة تنمية المهارات",
    path: "/kids",
    color: "bg-khatwa-light-blue text-primary",
    badge: "ابدأ هنا",
  },
  {
    icon: BookOpen,
    title: "مكتبة الإعاقات",
    desc: "معلومات مبسطة وشاملة عن التوحد و ADHD وطرق الدعم",
    path: "/library",
    color: "bg-khatwa-light-green text-secondary",
    badge: "محتوى موثوق",
  },
  {
    icon: Users,
    title: "المتخصصون",
    desc: "تواصل مع أخصائيين متمرسين واحجز استشارتك بسهولة",
    path: "/specialists",
    color: "bg-khatwa-light-yellow text-accent-foreground",
    badge: "معتمدون",
  },
  {
    icon: Heart,
    title: "مجتمع الدعم",
    desc: "قصص حقيقية من أولياء أمور لإلهامك ودعمك في رحلتك",
    path: "/community",
    color: "bg-destructive/10 text-destructive",
    badge: "مجتمع نشط",
  },
];

const stats = [
  { icon: Smile, value: "500+", label: "طفل مستفيد" },
  { icon: Star, value: "50+", label: "نشاط تعليمي" },
  { icon: Shield, value: "30+", label: "متخصص معتمد" },
  { icon: Heart, value: "100%", label: "بيئة آمنة" },
];

const intro = [
  {
    icon: Compass,
    title: "اكتشف",
    desc: "تعرّف على نوع الإعاقة من خلال مكتبتنا المبسطة",
  },
  {
    icon: HeartHandshake,
    title: "تواصل",
    desc: "احجز استشارتك مع متخصصين مؤهلين خلال دقائق",
  },
  {
    icon: Sparkles,
    title: "طبّق",
    desc: "استخدم الأنشطة والألعاب لتنمية مهارات طفلك",
  },
];

const testimonials = [
  {
    name: "أم يوسف",
    role: "والدة طفل من ذوي طيف التوحد",
    emoji: "👩‍👦",
    title: "تواصل أفضل مع طفلي",
    story:
      "كنت أعاني في فهم احتياجات يوسف، ومن خلال مكتبة المعلومات والاستشارات على المنصة تعلمت كيف أتواصل معه بصبر وأسلوب مناسب. اليوم أصبح يعبّر عن مشاعره ويبتسم أكثر.",
    color: "bg-khatwa-light-blue",
  },
  {
    name: "أ. منى — معلمة تربية خاصة",
    role: "معلمة في مدرسة دمج",
    emoji: "👩‍🏫",
    title: "أنشطة عملية داخل الفصل",
    story:
      "ساعدتني الأنشطة المقترحة في معرض الأنشطة على إدارة الفصل بشكل أفضل، خاصة مع الأطفال ذوي فرط الحركة. أصبح طلابي أكثر تفاعلًا وتركيزًا خلال الحصة.",
    color: "bg-khatwa-light-green",
  },
  {
    name: "أبو ليان",
    role: "والد طفلة من ذوي فرط الحركة",
    emoji: "👨‍👧",
    title: "دعم نفسي وثقة بالنفس",
    story:
      "وجدت في مجتمع الدعم تجارب أسر مشابهة لتجربتي، وشعرت أنني لست وحدي. مع متابعة المتخصصين تحسّن أداء ليان الدراسي وزادت ثقتها بنفسها بشكل ملحوظ.",
    color: "bg-khatwa-light-yellow",
  },
];

const Index = () => {
  const [logoRight, setLogoRight] = useState<string>("");
  const [logoLeft, setLogoLeft] = useState<string>("");
  const [headerTitle, setHeaderTitle] = useState<string>("منصة خطوة");

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["header_logo_right", "header_logo_left", "header_title"])
      .then(({ data }) => {
        const isFake = localStorage.getItem("fake_admin") === "true";
        (data || []).forEach((row: any) => {
          let val = row.value;
          if (isFake) {
             const mockVal = localStorage.getItem(`mock_setting_${row.key}`);
             if (mockVal !== null) val = mockVal;
          }
          if (row.key === "header_logo_right") setLogoRight(val || "");
          if (row.key === "header_logo_left") setLogoLeft(val || "");
          if (row.key === "header_title" && val) setHeaderTitle(val);
        });
        
        if (isFake) {
          const r = localStorage.getItem("mock_setting_header_logo_right");
          if (r !== null) setLogoRight(r);
          const l = localStorage.getItem("mock_setting_header_logo_left");
          if (l !== null) setLogoLeft(l);
          const t = localStorage.getItem("mock_setting_header_title");
          if (t !== null && t) setHeaderTitle(t);
        }
      });
  }, []);

  return (
  <Layout>
    {/* Header with 3 logo placeholders — dynamic, RTL: right, center, left */}
    <header className="container mx-auto px-4 pt-8" dir="rtl">
      <div className="max-w-6xl mx-auto bg-card border border-border rounded-3xl px-6 py-6 md:px-10 md:py-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          {/* RIGHT logo (first in RTL) */}
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoRight ? (
              <img src={logoRight} alt="الشعار الأول" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">الشعار الأول</span>
            )}
          </div>
          {/* CENTER title/logo */}
          <div className="flex-1 flex justify-center px-2">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {headerTitle.startsWith("data:image") || headerTitle.startsWith("http") ? (
                <img src={headerTitle} alt="شعار المنتصف" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-muted-foreground whitespace-nowrap">شعار المنتصف</span>
              )}
            </div>
          </div>
          {/* LEFT logo (last in RTL) */}
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoLeft ? (
              <img src={logoLeft} alt="الشعار الثاني" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">الشعار الثاني</span>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="bg-gradient-hero py-20 md:py-32 relative overflow-hidden">
      <div className="absolute top-10 right-10 text-7xl opacity-10 animate-float">🌟</div>
      <div className="absolute bottom-10 left-10 text-7xl opacity-10 animate-float">🎈</div>
      <div className="container mx-auto px-4 text-center relative">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
          <Star className="w-4 h-4" />
          منصة تعليمية داعمة
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          كل طفل يستحق <span className="text-gradient-primary">خطوة</span>
          <br />
          نحو مستقبل أفضل
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          منصة رقمية متكاملة تدعم الأطفال ذوي الاحتياجات الخاصة وأسرهم من خلال ألعاب
          تعليمية، مكتبة معلومات، واستشارات متخصصين
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/kids">
            <Button size="lg" className="rounded-2xl px-8 py-6 text-lg btn-bounce gap-2">
              ابدأ الرحلة
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/library">
            <Button size="lg" variant="outline" className="rounded-2xl px-8 py-6 text-lg btn-bounce">
              تعرف على المنصة
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Stats */}
    <section className="py-12 border-b border-border bg-card/40">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Brief intro: how it works */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-secondary/15 text-secondary rounded-full px-4 py-2 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            كيف تعمل المنصة
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">رحلتك معنا في 3 خطوات</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            بسيطة، واضحة، وفعّالة — صُممت لتلبية احتياجات كل أسرة
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {intro.map((step, i) => (
            <div
              key={step.title}
              className="relative p-6 rounded-2xl border border-border bg-card text-center card-hover"
            >
              <div className="absolute -top-4 right-6 w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold shadow-lg">
                {i + 1}
              </div>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                <step.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Quick navigation to main sections */}
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">استكشف أقسام المنصة</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            انتقل مباشرة إلى ما تحتاجه
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((f) => (
            <Link
              key={f.path}
              to={f.path}
              className="group p-6 rounded-2xl border border-border bg-card card-hover relative overflow-hidden"
            >
              <span className="absolute top-4 left-4 text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
                {f.badge}
              </span>
              <div
                className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-3">{f.desc}</p>
              <div className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                ادخل الآن
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* Support Community */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive rounded-full px-4 py-2 text-sm font-medium mb-4">
            <HeartHandshake className="w-4 h-4" />
            مجتمع الدعم
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">قصص نجاح من مجتمعنا</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            تجارب حقيقية تُظهر كيف ساعدت المنصة الأسر والمعلمين على دعم أطفالهم
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className={`relative p-6 rounded-3xl border border-border ${t.color} card-hover flex flex-col`}
            >
              <div className="text-5xl mb-4">{t.emoji}</div>
              <h3 className="text-xl font-bold mb-2">{t.title}</h3>
              <p className="text-foreground/80 text-sm leading-relaxed mb-5 flex-1">
                "{t.story}"
              </p>
              <div className="border-t border-border/60 pt-4">
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>


    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-warm rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">هل أنت مستعد للبدء؟</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            انضم إلى مئات الأسر التي تستخدم خطوة لدعم أطفالها
          </p>
          <Link to="/login">
            <Button size="lg" className="rounded-2xl px-10 py-6 text-lg btn-bounce">
              أنشئ حسابك الآن
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </Layout>
  );
};

export default Index;
