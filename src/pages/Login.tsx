import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isRegister ? "تم إنشاء الحساب بنجاح! (نموذج تجريبي)" : "تم تسجيل الدخول بنجاح! (نموذج تجريبي)");
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
              <Star className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-extrabold">{isRegister ? "إنشاء حساب جديد" : "تسجيل الدخول"}</h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isRegister ? "أنشئ حسابك وابدأ رحلة طفلك" : "أهلاً بعودتك!"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 bg-card p-8 rounded-3xl border border-border">
            {isRegister && (
              <Input placeholder="الاسم الكامل" required className="rounded-xl" />
            )}
            <Input placeholder="البريد الإلكتروني" type="email" required className="rounded-xl" />
            <div className="relative">
              <Input
                placeholder="كلمة المرور"
                type={showPassword ? "text" : "password"}
                required
                className="rounded-xl pl-10"
              />
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button type="submit" className="w-full rounded-xl py-6 text-lg btn-bounce">
              {isRegister ? "إنشاء الحساب" : "دخول"}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-primary font-medium hover:underline">
              {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
            </button>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-4">⚠️ هذا نموذج تجريبي - لا يتم تخزين أي بيانات</p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
