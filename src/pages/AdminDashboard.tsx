import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, UserPlus, Shield, Stethoscope, Trash2, Users, Baby, UserCheck } from "lucide-react";

interface SpecialistRow {
  id: string;
  user_id: string;
  specialty: string;
  bio: string | null;
  experience_years: number | null;
  conditions: string[];
  is_approved: boolean;
  created_at: string;
  profile?: { full_name: string; phone: string | null } | null;
}

interface InvitedRow {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, role, loading, profile } = useAuth();
  const navigate = useNavigate();
  const [specialists, setSpecialists] = useState<SpecialistRow[]>([]);
  const [invitations, setInvitations] = useState<InvitedRow[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("specialist");
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ users: 0, approvedSpecialists: 0, children: 0 });

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) navigate("/");
  }, [loading, user, role, navigate]);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name || "");
      setEditPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    if (role === "admin") {
      fetchSpecialists();
      fetchInvitations();
    }
  }, [role]);

  const fetchSpecialists = async () => {
    const { data } = await supabase
      .from("specialists")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch profiles for each specialist
      const userIds = data.map((s) => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .in("user_id", userIds);

      const merged = data.map((s) => ({
        ...s,
        profile: profiles?.find((p) => p.user_id === s.user_id) || null,
      }));
      setSpecialists(merged);
    }
  };

  const fetchInvitations = async () => {
    const { data } = await supabase
      .from("invited_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setInvitations(data as InvitedRow[]);
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("specialists")
      .update({ is_approved: true })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تمت الموافقة على المتخصص");
      fetchSpecialists();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("specialists")
      .update({ is_approved: false })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم رفض المتخصص");
      fetchSpecialists();
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const { error } = await supabase.from("invited_users").insert({
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole as any,
      invited_by: user!.id,
    });

    if (error) {
      if (error.code === "23505") toast.error("هذا البريد مدعو بالفعل لهذا الدور");
      else toast.error(error.message);
    } else {
      toast.success(`تمت دعوة ${inviteEmail} كـ ${inviteRole === "admin" ? "مدير" : "متخصص"}`);
      setInviteEmail("");
      fetchInvitations();
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    const { error } = await supabase.from("invited_users").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم حذف الدعوة");
      fetchInvitations();
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editName, phone: editPhone })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("تم تحديث الملف الشخصي");
  };

  const conditionLabel = (c: string) =>
    c === "adhd" ? "فرط الحركة" : c === "down_syndrome" ? "متلازمة داون" : c;

  const roleLabel = (r: string) =>
    r === "admin" ? "مدير" : r === "specialist" ? "متخصص" : "ولي أمر";

  if (loading) return <Layout><div className="flex items-center justify-center min-h-[60vh]">جاري التحميل...</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <h1 className="text-3xl font-extrabold mb-8 text-foreground">لوحة تحكم الإدارة</h1>

        <Tabs defaultValue="specialists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-xl">
            <TabsTrigger value="specialists" className="rounded-xl">طلبات المتخصصين</TabsTrigger>
            <TabsTrigger value="invitations" className="rounded-xl">الدعوات</TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl">ملفي الشخصي</TabsTrigger>
          </TabsList>

          {/* Specialists Tab */}
          <TabsContent value="specialists">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-bold mb-4 text-foreground">إدارة المتخصصين</h2>
              {specialists.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">لا توجد طلبات حالياً</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">التخصص</TableHead>
                        <TableHead className="text-right">الخبرة</TableHead>
                        <TableHead className="text-right">الحالات</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {specialists.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.profile?.full_name || "—"}</TableCell>
                          <TableCell>{s.specialty}</TableCell>
                          <TableCell>{s.experience_years ? `${s.experience_years} سنة` : "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {s.conditions.map((c) => (
                                <span key={c} className="text-xs bg-muted px-2 py-1 rounded-lg">
                                  {conditionLabel(c)}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                              s.is_approved
                                ? "bg-secondary/20 text-secondary-foreground"
                                : "bg-destructive/10 text-destructive"
                            }`}>
                              {s.is_approved ? "معتمد" : "قيد المراجعة"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!s.is_approved && (
                                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => handleApprove(s.id)}>
                                  <CheckCircle className="w-4 h-4 text-secondary" /> موافقة
                                </Button>
                              )}
                              {s.is_approved && (
                                <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => handleReject(s.id)}>
                                  <XCircle className="w-4 h-4 text-destructive" /> إيقاف
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-xl font-bold text-foreground">دعوة مستخدم جديد</h2>
              <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="rounded-xl flex-1"
                />
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-full sm:w-40 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> مدير</span>
                    </SelectItem>
                    <SelectItem value="specialist">
                      <span className="flex items-center gap-2"><Stethoscope className="w-4 h-4" /> متخصص</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" className="rounded-xl gap-2">
                  <UserPlus className="w-4 h-4" /> دعوة
                </Button>
              </form>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">الدعوات المعلقة</h3>
                {invitations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">لا توجد دعوات معلقة</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right">الدور</TableHead>
                        <TableHead className="text-right">التاريخ</TableHead>
                        <TableHead className="text-right">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell>{inv.email}</TableCell>
                          <TableCell>{roleLabel(inv.role)}</TableCell>
                          <TableCell>{new Date(inv.created_at).toLocaleDateString("ar-EG")}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteInvitation(inv.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-card rounded-2xl border border-border p-6 max-w-md">
              <h2 className="text-xl font-bold mb-4 text-foreground">تعديل الملف الشخصي</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">الاسم الكامل</label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">رقم الهاتف</label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">البريد الإلكتروني</label>
                  <Input value={user?.email || ""} disabled className="rounded-xl bg-muted" />
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={saving}>
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
