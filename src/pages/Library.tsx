import Layout from "@/components/Layout";
import { BookOpen, ChevronLeft, FileText, Info, Stethoscope, Apple, Ruler, ClipboardList, Users, School, Globe, Brain, Activity, Tv } from "lucide-react";
import { useState } from "react";

type Section = { icon: any; title: string; content: string };

type Disability = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  definition: string;
  sections: Section[];
};

const disabilities: Disability[] = [
  {
    id: "asd",
    title: "اضطراب طيف التوحد",
    emoji: "🧩",
    color: "bg-khatwa-light-green",
    definition:
      "يُعد اضطراب طيف التوحد أحد الاضطرابات النمائية الشاملة التي تظهر في مرحلة الطفولة المبكرة، ويؤثر بشكل واضح على مهارات التواصل اللفظي وغير اللفظي، والتفاعل الاجتماعي، وأنماط السلوك، كما يتميز بوجود سلوكيات نمطية متكررة، وتختلف شدته من حالة لأخرى.",
    sections: [
      {
        icon: Stethoscope,
        title: "الأسباب",
        content:
          "ترتبط أسباب اضطراب طيف التوحد بعدة عوامل متداخلة، تشمل العوامل الوراثية التي تلعب دورًا رئيسيًا، واضطرابات نمو وظائف الدماغ، بالإضافة إلى بعض العوامل البيئية مثل التعرض لمشكلات أثناء الحمل أو الولادة، مما يؤدي إلى خلل في تطور الجهاز العصبي.",
      },
      {
        icon: Apple,
        title: "التغذية والفيتامينات",
        content:
          "تلعب التغذية دورًا مهمًا في تحسين الحالة العامة للطفل، حيث يُنصح باتباع نظام غذائي متوازن يحتوي على البروتينات والفيتامينات والمعادن، مع تقليل السكريات والمواد الحافظة. ومن أهم الفيتامينات والعناصر المفيدة: فيتامين D للعظام والمناعة، فيتامين B6 لتحسين وظائف المخ، فيتامين B12 لدعم الجهاز العصبي، أحماض أوميجا 3 لتحسين الانتباه، الحديد لتحسين التركيز، والكالسيوم لصحة العظام. كما قد يُستخدم نظام غذائي خالٍ من الجلوتين والكازين لبعض الحالات تحت إشراف طبي.",
      },
      {
        icon: Ruler,
        title: "المقاييس",
        content:
          "يتم تشخيص الحالة باستخدام أدوات مقننة مثل مقياس CARS، ومقياس GARS، واختبار ADOS، والتي تساعد في تحديد شدة التوحد ووضع خطة علاج مناسبة لكل طفل.",
      },
      {
        icon: ClipboardList,
        title: "اختبارات مساعدة",
        content:
          "تشمل اختبارات الذكاء مثل مقياس ستانفورد بينيه، والذي يعتمد أحيانًا على صور وأنشطة لقياس القدرات العقلية، بالإضافة إلى اختبار السلوك التكيفي مثل مقياس فاينلاند، والذي يقيس قدرة الطفل على الاعتماد على نفسه، والتواصل، والمهارات الاجتماعية.",
      },
      {
        icon: Users,
        title: "دور الأسرة",
        content:
          "تُعد الأسرة العنصر الأهم في رعاية الطفل، حيث تبدأ بالاكتشاف المبكر للأعراض، ثم تقبل الطفل ودعمه نفسيًا، وتوفير بيئة آمنة ومستقرة خالية من الضغوط. كما تقوم الأسرة بالالتزام بالجلسات العلاجية، وتنفيذ الإرشادات داخل المنزل، وتدريب الطفل على مهارات الحياة اليومية مثل الأكل واللبس والنظافة. كما يشمل دور الأسرة الرعاية الغذائية من خلال تقديم طعام صحي متوازن، وملاحظة الأطعمة التي تؤثر على سلوك الطفل، وتنظيم مواعيد الوجبات، وتشجيع الطفل على تجربة أطعمة جديدة دون إجبار.",
      },
      {
        icon: School,
        title: "دور المدرسة والمعلمات وتفاعل الزملاء",
        content:
          "تلعب المدرسة دورًا مهمًا في دمج الطفل، حيث تقوم المعلمات باستخدام استراتيجيات تعليمية مناسبة مثل التبسيط، والتكرار، واستخدام الوسائل البصرية. كما يجب على المعلمة التحلي بالصبر، وتقديم التعليم خطوة بخطوة، وتعزيز السلوك الإيجابي باستمرار. أما الزملاء، فيجب توعيتهم بكيفية التعامل مع الطفل، وتشجيعهم على التفاعل معه بشكل إيجابي، ومشاركته في الأنشطة مما يساعد على تنمية مهاراته الاجتماعية وتقليل العزلة.",
      },
      {
        icon: Globe,
        title: "دور المجتمع",
        content:
          "يتمثل دور المجتمع في نشر الوعي بطبيعة التوحد، وتقليل التنمر، وتوفير مراكز متخصصة للعلاج والتأهيل، ودعم الأسر نفسيًا وماديًا، بالإضافة إلى توفير فرص دمج حقيقية للأطفال في الأنشطة المختلفة.",
      },
      {
        icon: Brain,
        title: "العلاج السلوكي",
        content:
          "يعتمد العلاج السلوكي على أساليب علمية مثل تحليل السلوك التطبيقي (ABA)، والذي يقوم على تقسيم المهارات إلى خطوات صغيرة وتعزيز السلوك الصحيح. كما يشمل التعزيز الإيجابي، والنمذجة، وتشكيل السلوك، والتدريب على المهارات الاجتماعية، بهدف تحسين التواصل وتقليل السلوكيات غير المرغوبة.",
      },
      {
        icon: Activity,
        title: "الأنشطة",
        content:
          "تشمل الأنشطة المناسبة لأطفال التوحد: ألعاب التركيب (البازل والمكعبات) لتنمية التركيز وحل المشكلات، التلوين والرسم للتعبير عن الذات وتهدئة الأعصاب، تقليد الأصوات والكلام لتحسين مهارات التواصل، اللعب الحسي مثل الرمل والعجينة والماء لتنظيم الإحساس، الأغاني المصحوبة بالحركات لتنمية التفاعل والانتباه، أنشطة التصنيف لتنمية الفهم والتركيز، اللعب التخيلي لتنمية المهارات الاجتماعية، والاعتماد على روتين يومي ثابت لتحقيق الاستقرار النفسي والسلوكي للطفل.",
      },
      {
        icon: Tv,
        title: "وسائل التواصل الاجتماعي والإعلام",
        content:
          "تلعب وسائل الإعلام دورًا كبيرًا في نشر الوعي، من خلال تقديم برامج توعوية، وعرض قصص نجاح، وتقديم إرشادات للأسر والمعلمين، مما يساعد في تحسين نظرة المجتمع للأطفال المصابين بالتوحد.",
      },
    ],
  },
  {
    id: "adhd",
    title: "اضطراب فرط الحركة وتشتت الانتباه (ADHD)",
    emoji: "⚡",
    color: "bg-khatwa-light-yellow",
    definition:
      "يُعد اضطراب فرط الحركة وتشتت الانتباه من الاضطرابات السلوكية العصبية التي تظهر في الطفولة، ويتميز بفرط النشاط، والاندفاعية، وضعف التركيز، مما يؤثر على الأداء الدراسي والعلاقات الاجتماعية.",
    sections: [
      {
        icon: Stethoscope,
        title: "الأسباب",
        content:
          "تشمل الأسباب العوامل الوراثية، واضطرابات في كيمياء المخ، وبعض العوامل البيئية مثل التوتر الأسري أو التعرض لمشكلات أثناء الحمل، مما يؤدي إلى ضعف التحكم في الانتباه والسلوك.",
      },
      {
        icon: Apple,
        title: "التغذية والفيتامينات",
        content:
          "تُعد التغذية عاملاً مهمًا في تحسين حالة الطفل، حيث يُنصح بتناول غذاء متوازن غني بالبروتينات، وأحماض أوميجا 3، والحديد، والزنك، وفيتامين B، وفيتامين D، مع تقليل السكريات والمواد الحافظة. كما يجب تنظيم مواعيد الوجبات والاهتمام بتناول الإفطار يوميًا لتحسين التركيز.",
      },
      {
        icon: Ruler,
        title: "المقاييس",
        content:
          "يتم التشخيص باستخدام مقياس كونرز (Conners Rating Scale)، ومقياس ADHD Rating Scale، والتي تساعد في تقييم شدة الأعراض بدقة.",
      },
      {
        icon: ClipboardList,
        title: "اختبارات مساعدة",
        content:
          "تشمل اختبارات الذكاء مثل ستانفورد بينيه لقياس القدرات العقلية، واختبار السلوك التكيفي الذي يقيس مهارات الطفل في الحياة اليومية والتفاعل الاجتماعي.",
      },
      {
        icon: Users,
        title: "دور الأسرة",
        content:
          "تقوم الأسرة بدور كبير في تنظيم حياة الطفل من خلال وضع روتين يومي ثابت، واستخدام التعزيز الإيجابي، وتقسيم المهام، ومتابعة السلوك بشكل مستمر. كما تهتم الأسرة بالرعاية الغذائية من خلال تقديم طعام صحي، وتقليل السكريات، وتشجيع الطفل على العادات الغذائية السليمة.",
      },
      {
        icon: School,
        title: "دور المدرسة والمعلمات وتفاعل الزملاء",
        content:
          "تسهم المدرسة في دعم الطفل من خلال تقليل المشتتات داخل الفصل، واستخدام طرق تدريس مرنة، وإعطاء فترات راحة قصيرة. كما يجب على المعلمة التعامل بصبر، واستخدام التعزيز الإيجابي، وتنويع الأنشطة. أما الزملاء، فيجب توعيتهم لتقبل الطفل ومساعدته، وتشجيعه على المشاركة، مما يعزز ثقته بنفسه ويحسن تفاعله الاجتماعي.",
      },
      {
        icon: Globe,
        title: "دور المجتمع",
        content:
          "يتمثل دور المجتمع في نشر الوعي، وتوفير خدمات علاجية وتأهيلية، ودعم دمج الأطفال في المدارس والأنشطة، وتقديم الدعم للأسر.",
      },
      {
        icon: Brain,
        title: "العلاج السلوكي",
        content:
          "يشمل العلاج السلوكي استخدام نظام المكافآت، وجدول تعديل السلوك، وتنظيم البيئة، والتدريب على ضبط النفس، وتقسيم المهام، مما يساعد على تحسين التركيز وتقليل الاندفاعية.",
      },
      {
        icon: Activity,
        title: "الأنشطة",
        content:
          "ألعاب الحركة كالجري ونط الحبل لتفريغ الطاقة، ألعاب التركيز مثل البازل، لعبة ركز 5 دقائق، التلوين والعجينة، التصنيف والترتيب، ألعاب الذاكرة، الأغاني الحركية، وتمارين التهدئة والتنفس العميق.",
      },
      {
        icon: Tv,
        title: "وسائل التواصل الاجتماعي والإعلام",
        content:
          "تُسهم وسائل الإعلام في توعية المجتمع من خلال تقديم محتوى تثقيفي، وعرض برامج إرشادية، ونشر معلومات تساعد الأسر والمعلمين على التعامل الصحيح مع الأطفال.",
      },
    ],
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
                <p className="text-sm text-muted-foreground line-clamp-3">{d.definition}</p>
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
              <h2 className="text-3xl font-extrabold mb-3 flex items-center gap-3">
                <Info className="w-7 h-7 text-primary" />
                {selected.title}
              </h2>
              <p className="text-foreground/80 leading-relaxed text-lg">{selected.definition}</p>
            </div>

            <div className="space-y-6">
              {selected.sections.map((s, i) => (
                <SectionCard key={i} icon={s.icon} title={s.title} content={s.content} />
              ))}
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

const SectionCard = ({ icon: Icon, title, content }: { icon: any; title: string; content: string }) => (
  <div className="p-6 rounded-2xl border border-border bg-card">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <p className="text-muted-foreground leading-relaxed">{content}</p>
  </div>
);

export default Library;
