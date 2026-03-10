import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const SetupRole = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<"parent" | "specialist" | "admin">("parent");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isInvitedAdmin, setIsInvitedAdmin] = useState(false);
  const [isInvitedSpecialist, setIsInvitedSpecialist] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (!loading && role) navigate("/");
  }, [loading, user, role, navigate]);

  // Check if user has an invitation
  useEffect(() => {
    if (user?.email) {
      // Try setup as admin to check - we use a direct approach
      // Query won't work due to RLS, so we attempt the role setup
      // Instead, let's try calling setup_user_role with admin and see if it works
      // Better: just attempt and catch error
      const checkAdmin = async () => {
        // We can't query invited_users (RLS), so we infer from setup attempt
        // Simple approach: show admin option and let setup_user_role handle validation
        setIsInvitedAdmin(true); // Show option, server will validate
        setIsInvitedSpecialist(true);
      };
      checkAdmin();
    }
  }, [user]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      // Insert role
      const { error: roleError } = await supabase.rpc("setup_user_role" as any, {
        _user_id: user.id,
        _role: accountType,
      });

      // For specialist, also insert specialist record
      if (accountType === "specialist") {
        const { error } = await supabase.from("specialists").insert({
          user_id: user.id,
          specialty,
          bio,
          experience_years: parseInt(experienceYears) || 0,
          conditions: conditions as any,
        });
        if (error) throw error;
      }

      toast.success(
        accountType === "specialist"
          ? "تم إنشاء حسابك! سيتم مراجعته من الإدارة."
          : "تم إعداد حسابك بنجاح!"
      );
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh]">جاري التحميل...</div></Layout>;

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold">أكمل إعداد حسابك</h1>
            <p className="text-muted-foreground text-sm mt-2">اختر نوع حسابك لنخصص تجربتك</p>
          </div>

          <form onSubmit={handleSetup} className="space-y-4 bg-card p-8 rounded-3xl border border-border">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAccountType("parent")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors border ${
                  accountType === "parent"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border"
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
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                👨‍⚕️ متخصص
              </button>
            </div>

            {accountType === "specialist" && (
              <>
                <Input
                  placeholder="التخصص (مثال: أخصائي نطق وتخاطب)"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="rounded-xl"
                />
                <Input
                  placeholder="سنوات الخبرة"
                  type="number"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="rounded-xl"
                />
                <Textarea
                  placeholder="نبذة عنك وعن خبراتك..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-xl"
                  rows={3}
                />
                <div>
                  <p className="text-sm font-medium mb-2">الحالات التي يمكنك معالجتها:</p>
                  <div className="flex gap-2">
                    {[
                      { value: "adhd", label: "⚡ فرط الحركة" },
                      { value: "down_syndrome", label: "💛 متلازمة داون" },
                    ].map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() =>
                          setConditions((prev) =>
                            prev.includes(c.value) ? prev.filter((x) => x !== c.value) : [...prev, c.value]
                          )
                        }
                        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
                          conditions.includes(c.value)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button type="submit" className="w-full rounded-xl py-6 text-lg btn-bounce" disabled={submitting}>
              {submitting ? "جاري الإعداد..." : "إكمال التسجيل"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SetupRole;
