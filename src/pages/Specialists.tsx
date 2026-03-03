import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Filter, Calendar, CheckCircle, Star } from "lucide-react";
import { toast } from "sonner";

const specialistsList = [
  { id: 1, name: "د. سارة المحمد", specialty: "أخصائية نطق وتخاطب", rating: 4.9, exp: "12 سنة", avatar: "👩‍⚕️" },
  { id: 2, name: "د. أحمد العلي", specialty: "أخصائي علاج وظيفي", rating: 4.8, exp: "8 سنوات", avatar: "👨‍⚕️" },
  { id: 3, name: "د. نورة الخالد", specialty: "أخصائية سلوك", rating: 4.7, exp: "10 سنوات", avatar: "👩‍⚕️" },
  { id: 4, name: "د. خالد الراشد", specialty: "أخصائي نفسي أطفال", rating: 4.9, exp: "15 سنة", avatar: "👨‍⚕️" },
  { id: 5, name: "د. ريم السعيد", specialty: "أخصائية تعليم خاص", rating: 4.6, exp: "7 سنوات", avatar: "👩‍⚕️" },
  { id: 6, name: "د. فهد العمري", specialty: "أخصائي نطق وتخاطب", rating: 4.8, exp: "9 سنوات", avatar: "👨‍⚕️" },
];

const specialties = ["الكل", "نطق وتخاطب", "علاج وظيفي", "سلوك", "نفسي أطفال", "تعليم خاص"];

const Specialists = () => {
  const [filter, setFilter] = useState("الكل");
  const [bookingFor, setBookingFor] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const filtered = filter === "الكل" ? specialistsList : specialistsList.filter((s) => s.specialty.includes(filter));
  const bookingSpecialist = specialistsList.find((s) => s.id === bookingFor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("تم إرسال طلب الحجز بنجاح! (نموذج تجريبي)");
    setTimeout(() => {
      setBookingFor(null);
      setSubmitted(false);
    }, 2000);
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
            تعرّف على فريق المتخصصين واحجز استشارتك (بيانات تجريبية)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {specialties.map((s) => (
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

        {/* Specialists grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {filtered.map((s) => (
            <div key={s.id} className="p-6 rounded-2xl border border-border bg-card card-hover">
              <div className="text-4xl mb-3">{s.avatar}</div>
              <h3 className="text-lg font-bold mb-1">{s.name}</h3>
              <p className="text-sm text-primary font-medium mb-2">{s.specialty}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent-foreground" />
                  {s.rating}
                </span>
                <span>خبرة {s.exp}</span>
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl btn-bounce"
                onClick={() => setBookingFor(s.id)}
              >
                <Calendar className="w-4 h-4 ml-2" />
                احجز استشارة
              </Button>
            </div>
          ))}
        </div>

        {/* Booking modal */}
        {bookingFor && bookingSpecialist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
            <div className="bg-card rounded-3xl p-8 max-w-md w-full shadow-2xl">
              {submitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">تم الحجز!</h3>
                  <p className="text-muted-foreground">سيتم التواصل معك قريباً (نموذج تجريبي)</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-1">حجز استشارة</h3>
                  <p className="text-sm text-muted-foreground mb-6">مع {bookingSpecialist.name} - {bookingSpecialist.specialty}</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="الاسم الكامل" required className="rounded-xl" />
                    <Input placeholder="رقم الهاتف" type="tel" required className="rounded-xl" />
                    <Input type="date" required className="rounded-xl" />
                    <Textarea placeholder="وصف موجز للحالة" className="rounded-xl" rows={3} />
                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1 rounded-xl btn-bounce">إرسال الحجز</Button>
                      <Button type="button" variant="outline" className="rounded-xl" onClick={() => setBookingFor(null)}>إلغاء</Button>
                    </div>
                  </form>
                  <p className="text-xs text-muted-foreground text-center mt-4">⚠️ هذا نموذج تجريبي غير متصل فعلياً</p>
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
