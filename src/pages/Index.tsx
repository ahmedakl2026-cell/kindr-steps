import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gamepad2, BookOpen, Users, Heart, Star, ArrowLeft, Shield, Smile } from "lucide-react";
import Layout from "@/components/Layout";

const features = [
  {
    icon: Gamepad2,
    title: "ركن الأطفال",
    desc: "ألعاب تعليمية ممتعة مصممة خصيصاً لتنمية مهارات الأطفال",
    path: "/kids",
    color: "bg-khatwa-light-blue text-primary",
  },
  {
    icon: BookOpen,
    title: "مكتبة الإعاقات",
    desc: "معلومات مبسطة وشاملة حول الإعاقات المختلفة وطرق التعامل",
    path: "/library",
    color: "bg-khatwa-light-green text-secondary",
  },
  {
    icon: Users,
    title: "المتخصصون",
    desc: "تواصل مع أخصائيين متمرسين واحجز استشارتك بسهولة",
    path: "/specialists",
    color: "bg-khatwa-light-yellow text-accent-foreground",
  },
  {
    icon: Heart,
    title: "مجتمع الدعم",
    desc: "تجارب ملهمة من أولياء أمور ومعلمين لدعمك في رحلتك",
    path: "/community",
    color: "bg-destructive/10 text-destructive",
  },
];

const stats = [
  { icon: Smile, value: "500+", label: "طفل مستفيد" },
  { icon: Star, value: "50+", label: "لعبة تعليمية" },
  { icon: Shield, value: "30+", label: "متخصص" },
  { icon: Heart, value: "100%", label: "بيئة آمنة" },
];

const Index = () => (
  <Layout>
    {/* Hero */}
    <section className="bg-gradient-hero py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 text-sm font-medium mb-6">
          <Star className="w-4 h-4" />
          منصة تعليمية داعمة
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          كل طفل يستحق{" "}
          <span className="text-gradient-primary">خطوة</span>
          <br />
          نحو مستقبل أفضل
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          منصة رقمية متكاملة تدعم الأطفال ذوي الاحتياجات الخاصة وأسرهم من خلال ألعاب تعليمية، مكتبة معلومات، واستشارات متخصصين
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
    <section className="py-12 border-b border-border">
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

    {/* Features */}
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">ماذا تقدم خطوة؟</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            أدوات متنوعة صُممت بعناية لتلبية احتياجات كل فرد في الأسرة
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((f) => (
            <Link
              key={f.path}
              to={f.path}
              className="group p-6 rounded-2xl border border-border bg-card card-hover"
            >
              <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
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

export default Index;
