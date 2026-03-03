import { Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-muted/50 border-t border-border mt-20">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Star className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">خطوة</span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            منصة رقمية داعمة للأطفال ذوي الاحتياجات الخاصة وأسرهم. نسعى لتقديم بيئة آمنة وتفاعلية للتعلم والنمو.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">روابط سريعة</h4>
          <div className="space-y-2">
            <Link to="/kids" className="block text-sm text-muted-foreground hover:text-primary transition-colors">ركن الأطفال</Link>
            <Link to="/library" className="block text-sm text-muted-foreground hover:text-primary transition-colors">مكتبة الإعاقات</Link>
            <Link to="/specialists" className="block text-sm text-muted-foreground hover:text-primary transition-colors">المتخصصون</Link>
            <Link to="/community" className="block text-sm text-muted-foreground hover:text-primary transition-colors">مجتمع الدعم</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4">تواصل معنا</h4>
          <p className="text-sm text-muted-foreground">البريد: info@khatwa.com</p>
          <p className="text-sm text-muted-foreground">الهاتف: +966 50 000 0000</p>
        </div>
      </div>
      <div className="border-t border-border mt-8 pt-6 text-center">
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
          صُنع بـ <Heart className="w-4 h-4 text-destructive" /> لكل طفل مميز
        </p>
        <p className="text-xs text-muted-foreground mt-1">⚠️ هذا مشروع تعليمي تجريبي ولا يقدم خدمات طبية فعلية</p>
      </div>
    </div>
  </footer>
);

export default Footer;
