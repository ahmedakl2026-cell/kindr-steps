import Layout from "@/components/Layout";
import {
  BookOpen,
  ChevronLeft,
  Info,
  Stethoscope,
  Apple,
  Ruler,
  ClipboardList,
  Users,
  School,
  Globe,
  Brain,
  Activity,
  Tv,
  Sparkles,
  Zap,
  Images,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityManager } from "@/components/admin/ActivityManager";

type Section = { icon: any; title: string; content: string };

type Disability = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  accent: string;
  layout: "cards" | "timeline";
  definition: string;
  sections: Section[];
};

const asdSections: Section[] = [
  { icon: Stethoscope, title: "الأسباب", content: "ترتبط أسباب اضطراب طيف التوحد بعدة عوامل متداخلة، تشمل العوامل الوراثية التي تلعب دورًا رئيسيًا، واضطرابات نمو وظائف الدماغ، بالإضافة إلى بعض العوامل البيئية مثل التعرض لمشكلات أثناء الحمل أو الولادة، مما يؤدي إلى خلل في تطور الجهاز العصبي." },
  { icon: Apple, title: "التغذية والفيتامينات", content: "تلعب التغذية دورًا مهمًا في تحسين الحالة العامة للطفل، حيث يُنصح باتباع نظام غذائي متوازن يحتوي على البروتينات والفيتامينات والمعادن، مع تقليل السكريات والمواد الحافظة. ومن أهم الفيتامينات والعناصر المفيدة: فيتامين D للعظام والمناعة، فيتامين B6 لتحسين وظائف المخ، فيتامين B12 لدعم الجهاز العصبي، أحماض أوميجا 3 لتحسين الانتباه، الحديد لتحسين التركيز، والكالسيوم لصحة العظام. كما قد يُستخدم نظام غذائي خالٍ من الجلوتين والكازين لبعض الحالات تحت إشراف طبي." },
  { icon: Ruler, title: "المقاييس", content: "يتم تشخيص الحالة باستخدام أدوات مقننة مثل مقياس CARS، ومقياس GARS، واختبار ADOS، والتي تساعد في تحديد شدة التوحد ووضع خطة علاج مناسبة لكل طفل." },
  { icon: ClipboardList, title: "اختبارات مساعدة", content: "تشمل اختبارات الذكاء مثل مقياس ستانفورد بينيه، والذي يعتمد أحيانًا على صور وأنشطة لقياس القدرات العقلية، بالإضافة إلى اختبار السلوك التكيفي مثل مقياس فاينلاند، والذي يقيس قدرة الطفل على الاعتماد على نفسه، والتواصل، والمهارات الاجتماعية." },
  { icon: Users, title: "دور الأسرة", content: "تُعد الأسرة العنصر الأهم في رعاية الطفل، حيث تبدأ بالاكتشاف المبكر للأعراض، ثم تقبل الطفل ودعمه نفسيًا، وتوفير بيئة آمنة ومستقرة خالية من الضغوط. كما تقوم الأسرة بالالتزام بالجلسات العلاجية، وتنفيذ الإرشادات داخل المنزل، وتدريب الطفل على مهارات الحياة اليومية مثل الأكل واللبس والنظافة." },
  { icon: School, title: "دور المدرسة والمعلمات", content: "تلعب المدرسة دورًا مهمًا في دمج الطفل، حيث تقوم المعلمات باستخدام استراتيجيات تعليمية مناسبة مثل التبسيط، والتكرار، واستخدام الوسائل البصرية. كما يجب على المعلمة التحلي بالصبر، وتقديم التعليم خطوة بخطوة، وتعزيز السلوك الإيجابي باستمرار." },
  { icon: Globe, title: "دور المجتمع", content: "يتمثل دور المجتمع في نشر الوعي بطبيعة التوحد، وتقليل التنمر، وتوفير مراكز متخصصة للعلاج والتأهيل، ودعم الأسر نفسيًا وماديًا، بالإضافة إلى توفير فرص دمج حقيقية للأطفال في الأنشطة المختلفة." },
  { icon: Brain, title: "العلاج السلوكي", content: "يعتمد العلاج السلوكي على أساليب علمية مثل تحليل السلوك التطبيقي (ABA)، والذي يقوم على تقسيم المهارات إلى خطوات صغيرة وتعزيز السلوك الصحيح. كما يشمل التعزيز الإيجابي، والنمذجة، وتشكيل السلوك، والتدريب على المهارات الاجتماعية." },
  { icon: Activity, title: "الأنشطة المقترحة", content: "ألعاب التركيب (البازل والمكعبات) لتنمية التركيز وحل المشكلات، التلوين والرسم للتعبير عن الذات، تقليد الأصوات والكلام، اللعب الحسي مثل الرمل والعجينة والماء، الأغاني المصحوبة بالحركات، أنشطة التصنيف، اللعب التخيلي، والاعتماد على روتين يومي ثابت." },
  { icon: Tv, title: "وسائل الإعلام", content: "تلعب وسائل الإعلام دورًا كبيرًا في نشر الوعي، من خلال تقديم برامج توعوية، وعرض قصص نجاح، وتقديم إرشادات للأسر والمعلمين، مما يساعد في تحسين نظرة المجتمع للأطفال المصابين بالتوحد." },
];

const adhdSections: Section[] = [
  { icon: Stethoscope, title: "الأسباب", content: "تشمل الأسباب العوامل الوراثية، واضطرابات في كيمياء المخ، وبعض العوامل البيئية مثل التوتر الأسري أو التعرض لمشكلات أثناء الحمل، مما يؤدي إلى ضعف التحكم في الانتباه والسلوك." },
  { icon: Apple, title: "التغذية والفيتامينات", content: "تُعد التغذية عاملاً مهمًا في تحسين حالة الطفل، حيث يُنصح بتناول غذاء متوازن غني بالبروتينات، وأحماض أوميجا 3، والحديد، والزنك، وفيتامين B، وفيتامين D، مع تقليل السكريات والمواد الحافظة. كما يجب تنظيم مواعيد الوجبات والاهتمام بتناول الإفطار يوميًا لتحسين التركيز." },
  { icon: Ruler, title: "المقاييس", content: "يتم التشخيص باستخدام مقياس كونرز (Conners Rating Scale)، ومقياس ADHD Rating Scale، والتي تساعد في تقييم شدة الأعراض بدقة." },
  { icon: ClipboardList, title: "اختبارات مساعدة", content: "تشمل اختبارات الذكاء مثل ستانفورد بينيه لقياس القدرات العقلية، واختبار السلوك التكيفي الذي يقيس مهارات الطفل في الحياة اليومية والتفاعل الاجتماعي." },
  { icon: Users, title: "دور الأسرة", content: "تقوم الأسرة بدور كبير في تنظيم حياة الطفل من خلال وضع روتين يومي ثابت، واستخدام التعزيز الإيجابي، وتقسيم المهام، ومتابعة السلوك بشكل مستمر. كما تهتم الأسرة بالرعاية الغذائية من خلال تقديم طعام صحي، وتقليل السكريات." },
  { icon: School, title: "دور المدرسة والمعلمات", content: "تسهم المدرسة في دعم الطفل من خلال تقليل المشتتات داخل الفصل، واستخدام طرق تدريس مرنة، وإعطاء فترات راحة قصيرة. كما يجب على المعلمة التعامل بصبر، واستخدام التعزيز الإيجابي، وتنويع الأنشطة." },
  { icon: Globe, title: "دور المجتمع", content: "يتمثل دور المجتمع في نشر الوعي، وتوفير خدمات علاجية وتأهيلية، ودعم دمج الأطفال في المدارس والأنشطة، وتقديم الدعم للأسر." },
  { icon: Brain, title: "العلاج السلوكي", content: "يشمل العلاج السلوكي استخدام نظام المكافآت، وجدول تعديل السلوك، وتنظيم البيئة، والتدريب على ضبط النفس، وتقسيم المهام، مما يساعد على تحسين التركيز وتقليل الاندفاعية." },
  { icon: Activity, title: "الأنشطة المقترحة", content: "ألعاب الحركة كالجري ونط الحبل لتفريغ الطاقة، ألعاب التركيز مثل البازل، لعبة ركز 5 دقائق، التلوين والعجينة، التصنيف والترتيب، ألعاب الذاكرة، الأغاني الحركية، وتمارين التهدئة والتنفس العميق." },
  { icon: Tv, title: "وسائل الإعلام", content: "تُسهم وسائل الإعلام في توعية المجتمع من خلال تقديم محتوى تثقيفي، وعرض برامج إرشادية، ونشر معلومات تساعد الأسر والمعلمين على التعامل الصحيح مع الأطفال." },
];

const disabilities: Disability[] = [
  {
    id: "asd",
    title: "اضطراب طيف التوحد",
    emoji: "🧩",
    color: "bg-khatwa-light-green",
    accent: "secondary",
    layout: "cards",
    definition:
      "يُعد اضطراب طيف التوحد أحد الاضطرابات النمائية الشاملة التي تظهر في مرحلة الطفولة المبكرة، ويؤثر بشكل واضح على مهارات التواصل اللفظي وغير اللفظي، والتفاعل الاجتماعي، وأنماط السلوك.",
    sections: asdSections,
  },
  {
    id: "adhd",
    title: "اضطراب فرط الحركة وتشتت الانتباه",
    emoji: "⚡",
    color: "bg-khatwa-light-yellow",
    accent: "accent",
    layout: "timeline",
    definition:
      "يُعد اضطراب فرط الحركة وتشتت الانتباه من الاضطرابات السلوكية العصبية التي تظهر في الطفولة، ويتميز بفرط النشاط، والاندفاعية، وضعف التركيز، مما يؤثر على الأداء الدراسي والعلاقات الاجتماعية.",
    sections: adhdSections,
  },
];

// Group sections into thematic tabs
const groupSections = (sections: Section[]) => ({
  medical: sections.slice(0, 4), // الأسباب، التغذية، المقاييس، الاختبارات
  support: sections.slice(4, 7), // الأسرة، المدرسة، المجتمع
  treatment: sections.slice(7, 10), // العلاج، الأنشطة، الإعلام
});

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {disabilities.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={`relative overflow-hidden p-8 rounded-3xl ${d.color} border border-border text-right card-hover group`}
              >
                <div className="absolute -top-6 -left-6 text-9xl opacity-10 group-hover:opacity-20 transition-opacity">
                  {d.emoji}
                </div>
                <div className="relative">
                  <div className="text-5xl mb-4">{d.emoji}</div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 mb-4">
                    {d.definition}
                  </p>
                  <div className="inline-flex items-center gap-1 text-primary text-sm font-medium bg-card/70 px-4 py-2 rounded-full">
                    {d.layout === "cards" ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    اقرأ المزيد
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-2 text-primary hover:underline mb-6 font-medium"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
              العودة للقائمة
            </button>

            <div className={`p-8 rounded-3xl ${selected.color} mb-8`}>
              <div className="text-5xl mb-4">{selected.emoji}</div>
              <h2 className="text-3xl font-extrabold mb-3 flex items-center gap-3">
                <Info className="w-7 h-7 text-primary" />
                {selected.title}
              </h2>
              <p className="text-foreground/80 leading-relaxed text-lg">{selected.definition}</p>
            </div>

            {selected.layout === "cards" ? (
              <CardsLayout sections={selected.sections} />
            ) : (
              <TimelineLayout sections={selected.sections} />
            )}

            {/* Activities for this disability */}
            <DisabilityActivities disabilityId={selected.id} accentColor={selected.color} />
          </div>
        )}
      </div>
    </Layout>
  );
};

/* Per-disability activities area: read-only for everyone, manageable by admin */
const DisabilityActivities = ({ disabilityId, accentColor }: { disabilityId: string; accentColor: string }) => {
  const { role } = useAuth();
  const [items, setItems] = useState<{ id: string; title: string; description: string | null; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("kids_activities")
      .select("id, title, description, image_url")
      .eq("disability", disabilityId)
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [disabilityId]);

  return (
    <section className="mt-12">
      <div className={`p-6 md:p-8 rounded-3xl ${accentColor} border border-border`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center">
            <Images className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold">الأنشطة الخاصة</h3>
            <p className="text-sm text-muted-foreground">صور وأنشطة مقترحة لهذه الفئة</p>
          </div>
        </div>

        {role === "admin" ? (
          <div className="bg-card rounded-2xl p-4 md:p-6">
            <ActivityManager
              disability={disabilityId}
              title="إدارة أنشطة هذه الإعاقة"
              emptyHint="لم تتم إضافة أنشطة بعد. اضغط على زر إضافة صورة."
            />
          </div>
        ) : loading ? (
          <p className="text-muted-foreground text-center py-6">جاري التحميل...</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">لا توجد أنشطة بعد</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((a) => (
              <div key={a.id} className="rounded-2xl overflow-hidden bg-card border border-border card-hover group">
                <div className="overflow-hidden">
                  <img src={a.image_url} alt={a.title} className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h4 className="font-bold mb-1">{a.title}</h4>
                  {a.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ASD: tabs + interactive cards layout */
const CardsLayout = ({ sections }: { sections: Section[] }) => {
  const grouped = groupSections(sections);

  const renderGrid = (items: Section[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {items.map((s, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-border bg-card card-hover group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{s.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Tabs defaultValue="medical" className="w-full">
      <TabsList className="grid w-full grid-cols-3 rounded-2xl h-auto p-1.5 bg-muted">
        <TabsTrigger value="medical" className="rounded-xl py-3">
          الجانب الطبي
        </TabsTrigger>
        <TabsTrigger value="support" className="rounded-xl py-3">
          الدعم الاجتماعي
        </TabsTrigger>
        <TabsTrigger value="treatment" className="rounded-xl py-3">
          العلاج والأنشطة
        </TabsTrigger>
      </TabsList>
      <TabsContent value="medical" className="mt-6">
        {renderGrid(grouped.medical)}
      </TabsContent>
      <TabsContent value="support" className="mt-6">
        {renderGrid(grouped.support)}
      </TabsContent>
      <TabsContent value="treatment" className="mt-6">
        {renderGrid(grouped.treatment)}
      </TabsContent>
    </Tabs>
  );
};

/* ADHD: step-by-step timeline + accordion details */
const TimelineLayout = ({ sections }: { sections: Section[] }) => (
  <div className="relative">
    {/* Vertical line on the right (RTL) */}
    <div className="absolute right-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-accent via-primary to-secondary opacity-30" />

    <Accordion type="single" collapsible defaultValue="step-0" className="space-y-4">
      {sections.map((s, i) => (
        <AccordionItem
          key={i}
          value={`step-${i}`}
          className="border-0 bg-card rounded-2xl border border-border overflow-hidden pr-16 relative"
        >
          {/* Step circle */}
          <div className="absolute right-0 top-4 w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary text-white flex items-center justify-center font-bold text-lg shadow-lg z-10">
            {i + 1}
          </div>
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/40 transition-colors">
            <div className="flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent-foreground flex items-center justify-center flex-shrink-0">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">{s.title}</h3>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-5 pb-5">
            <p className="text-muted-foreground leading-relaxed pr-13">{s.content}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

export default Library;
