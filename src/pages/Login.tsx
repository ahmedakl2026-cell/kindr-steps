import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"parent" | "specialist">("parent");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, role } = useAuth();

  // Redirect if already logged in
  if (user && role === "admin") {
    navigate("/admin");
    return null;
  } else if (user && role) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {

      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, account_type: accountType },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        toast.success("تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح!");
        // Check role for redirect
        const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id).maybeSingle();
        if (!roleData) {
          navigate("/setup-role");
        } else if (roleData.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ في تسجيل الدخول بـ Google");
    } finally {
      setLoading(false);
    }
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
              <>
                <Input
                  placeholder="الاسم الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="rounded-xl"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType("parent")}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors border ${
                      accountType === "parent"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    👨‍👩‍👦 ولي أمر
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("specialist")}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors border ${
                      accountType === "specialist"
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                    }`}
                  >
                    👨‍⚕️ متخصص
                  </button>
                </div>
              </>
            )}
            <Input
              placeholder="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl"
            />
            <div className="relative">
              <Input
                placeholder="كلمة المرور"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <Button type="submit" className="w-full rounded-xl py-6 text-lg btn-bounce" disabled={loading}>
              {loading ? "جاري التحميل..." : isRegister ? "إنشاء الحساب" : "دخول"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">أو</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl py-6 text-lg gap-2"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              تسجيل بحساب Google
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            {isRegister ? "لديك حساب بالفعل؟" : "ليس لديك حساب؟"}{" "}
            <button onClick={() => setIsRegister(!isRegister)} className="text-primary font-medium hover:underline">
              {isRegister ? "تسجيل الدخول" : "إنشاء حساب"}
            </button>
          </p>
          {isRegister && accountType === "specialist" && (
            <p className="text-xs text-muted-foreground text-center mt-4 bg-muted/50 p-3 rounded-xl">
              ℹ️ حسابات المتخصصين تحتاج موافقة الإدارة قبل أن تصبح مرئية للمستخدمين
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Login;
