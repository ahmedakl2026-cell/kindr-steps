import Layout from "@/components/Layout";
import { BookOpen, ChevronLeft, AlertCircle, Lightbulb, Activity, FileText } from "lucide-react";
import { useState } from "react";

const disabilities = [
  {
    id: "autism",
    title: "اضطراب طيف التوحد",
    emoji: "🧩",
    color: "bg-khatwa-light-blue",
    definition: "اضطراب في النمو العصبي يؤثر على التواصل والتفاعل الاجتماعي والسلوك. يظهر عادة في السنوات الأولى من العمر.",
    signs: ["تأخر في النطق والكلام", "صعوبة في التواصل البصري", "تكرار حركات أو كلمات معينة", "حساسية مفرطة للأصوات أو الأضواء", "صعوبة في فهم مشاعر الآخرين"],
    tips: ["استخدام الجداول المرئية", "الروتين الثابت والمتوقع", "التواصل البسيط والواضح", "توفير بيئة هادئة", "الصبر والتشجيع المستمر"],
    activities: ["ألعاب التركيب والبناء", "الرسم والتلوين", "الموسيقى الهادئة", "اللعب بالماء والرمل", "القصص المصورة البسيطة"],
  },
  {
    id: "adhd",
    title: "اضطراب فرط الحركة وتشتت الانتباه",
    emoji: "⚡",
    color: "bg-khatwa-light-yellow",
    definition: "حالة عصبية تتميز بصعوبة التركيز، وفرط النشاط، والاندفاعية. تؤثر على الأداء الدراسي والاجتماعي.",
    signs: ["صعوبة في التركيز لفترات طويلة", "حركة مفرطة وعدم القدرة على الجلوس", "اندفاعية في القرارات", "نسيان متكرر", "صعوبة في تنظيم المهام"],
    tips: ["تقسيم المهام إلى خطوات صغيرة", "استخدام مؤقت للمهام", "توفير فترات راحة متكررة", "التعزيز الإيجابي الفوري", "تقليل المشتتات"],
    activities: ["الرياضة والحركة المنظمة", "ألعاب التوازن", "الأنشطة الإبداعية القصيرة", "ألعاب الذاكرة", "المشي في الطبيعة"],
  },
  {
    id: "down",
    title: "متلازمة داون",
    emoji: "💛",
    color: "bg-khatwa-light-green",
    definition: "حالة جينية ناتجة عن نسخة إضافية من الكروموسوم 21. تؤثر على النمو الجسدي والعقلي بدرجات متفاوتة.",
    signs: ["ملامح وجه مميزة", "تأخر في المراحل التنموية", "صعوبات في التعلم", "مرونة زائدة في المفاصل", "قصر القامة نسبياً"],
    tips: ["التدخل المبكر والتحفيز", "التعليم بالنمذجة والتقليد", "التكرار والصبر", "دمجهم مع أقرانهم", "الاحتفاء بالإنجازات الصغيرة"],
    activities: ["السباحة", "الرقص والموسيقى", "الأعمال اليدوية البسيطة", "ألعاب المحاكاة", "القراءة المشتركة"],
  },
  {
    id: "hearing",
    title: "الإعاقة السمعية",
    emoji: "👂",
    color: "bg-khatwa-light-blue",
    definition: "فقدان جزئي أو كلي لحاسة السمع. قد يكون خلقياً أو مكتسباً، ويؤثر على تطور اللغة والتواصل.",
    signs: ["عدم الاستجابة للأصوات", "تأخر في الكلام", "رفع صوت التلفاز بشكل ملحوظ", "طلب إعادة الكلام كثيراً", "صعوبة في متابعة المحادثات"],
    tips: ["التواصل وجهاً لوجه", "استخدام لغة الإشارة", "الاستعانة بالمعينات السمعية", "التحدث بوضوح وببطء", "استخدام الوسائل المرئية"],
    activities: ["لغة الإشارة التفاعلية", "الألعاب البصرية", "الفنون والرسم", "التمثيل والمسرح", "ألعاب الكمبيوتر التعليمية"],
  },
];

const Library = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = disabilities.find((d) => d.id === selectedId);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-khatwa-light-green text-secondary rounded-full px-4 py-2 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            مكتبة المعلومات
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">مكتبة الإعاقات</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            معلومات مبسطة وموثوقة لمساعدتك على فهم الإعاقات المختلفة وطرق التعامل معها
          </p>
        </div>

        {!selected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {disabilities.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`p-6 rounded-2xl ${d.color} border border-border text-right card-hover group`}
              >
                <div className="text-4xl mb-3">{d.emoji}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{d.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{d.definition}</p>
                <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
                  اقرأ المزيد
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 text-primary hover:underline mb-6 font-medium"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              العودة للقائمة
            </button>

            <div className={`p-8 rounded-3xl ${selected.color} mb-8`}>
              <div className="text-5xl mb-4">{selected.emoji}</div>
              <h2 className="text-3xl font-extrabold mb-3">{selected.title}</h2>
              <p className="text-foreground/80 leading-relaxed text-lg">{selected.definition}</p>
            </div>

            <div className="space-y-6">
              <Section icon={AlertCircle} title="العلامات المبكرة" items={selected.signs} color="text-destructive" />
              <Section icon={Lightbulb} title="طرق التعامل" items={selected.tips} color="text-primary" />
              <Section icon={Activity} title="أنشطة مناسبة" items={selected.activities} color="text-secondary" />
            </div>

            <div className="mt-8 p-6 rounded-2xl border border-border bg-card flex items-center gap-4">
              <FileText className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold mb-1">دليل PDF</h4>
                <p className="text-sm text-muted-foreground">حمّل الدليل الشامل عن {selected.title} (نموذج تجريبي)</p>
              </div>
              <button className="mr-auto bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors">
                تحميل
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

const Section = ({ icon: Icon, title, items, color }: { icon: any; title: string; items: string[]; color: string }) => (
  <div className="p-6 rounded-2xl border border-border bg-card">
    <div className="flex items-center gap-3 mb-4">
      <Icon className={`w-6 h-6 ${color}`} />
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-muted-foreground">
          <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${color.replace("text-", "bg-")}`} />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

export default Library;
