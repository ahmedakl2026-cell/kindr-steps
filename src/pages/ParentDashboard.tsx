import Layout from "@/components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { TrendingUp, Award, Lightbulb, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

const progressData = [
  { day: "السبت", points: 20 },
  { day: "الأحد", points: 35 },
  { day: "الاثنين", points: 15 },
  { day: "الثلاثاء", points: 40 },
  { day: "الأربعاء", points: 25 },
  { day: "الخميس", points: 50 },
  { day: "الجمعة", points: 30 },
];

const tips = [
  "خصص 15 دقيقة يومياً للعب مع طفلك ألعاب تعليمية",
  "امدح طفلك على المحاولة وليس فقط على النتيجة",
  "استخدم الصور والرسوم لتوضيح الروتين اليومي",
  "وفر بيئة هادئة أثناء وقت التعلم",
];

const suggestedActivities = [
  { title: "لعبة الذاكرة", emoji: "🧠", time: "10 دقائق" },
  { title: "تلوين الحروف", emoji: "🎨", time: "15 دقيقة" },
  { title: "قصة قبل النوم", emoji: "📖", time: "10 دقائق" },
  { title: "حركة وتمارين", emoji: "🤸", time: "20 دقيقة" },
];

const ParentDashboard = () => {
  const [question, setQuestion] = useState("");

  const handleSendQuestion = () => {
    if (!question.trim()) return;
    toast.success("تم إرسال سؤالك بنجاح! (نموذج تجريبي)");
    setQuestion("");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">مرحباً، أم أحمد 👋</h1>
            <p className="text-muted-foreground">لوحة تحكم ولي الأمر</p>
          </div>
        </div>

        {/* Child card */}
        <div className="bg-gradient-warm rounded-3xl p-6 md:p-8 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center text-3xl">👦</div>
            <div>
              <h2 className="text-xl font-bold">أحمد</h2>
              <p className="text-muted-foreground text-sm">7 سنوات • اضطراب طيف التوحد</p>
            </div>
            <div className="flex gap-4 mr-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">215</div>
                <div className="text-xs text-muted-foreground">نقطة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">12</div>
                <div className="text-xs text-muted-foreground">لعبة مكتملة</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress chart */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">تقدم الأسبوع</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="points" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily tips */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-accent-foreground" />
              <h3 className="text-lg font-bold">نصائح اليوم</h3>
            </div>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Suggested activities */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-secondary" />
            <h3 className="text-lg font-bold">أنشطة مقترحة لهذا الأسبوع</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedActivities.map((a) => (
              <div key={a.title} className="p-4 rounded-2xl border border-border bg-card text-center card-hover">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <h4 className="font-bold text-sm mb-1">{a.title}</h4>
                <span className="text-xs text-muted-foreground">{a.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ask a question */}
        <div className="mt-8 p-6 rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">اسأل متخصصاً</h3>
          </div>
          <Textarea
            placeholder="اكتب سؤالك هنا..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="rounded-xl mb-3"
            rows={3}
          />
          <Button className="rounded-xl btn-bounce" onClick={handleSendQuestion}>
            إرسال السؤال
          </Button>
          <p className="text-xs text-muted-foreground mt-2">⚠️ نموذج تجريبي - لا يتم إرسال الأسئلة فعلياً</p>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
