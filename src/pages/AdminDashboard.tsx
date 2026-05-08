import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle, XCircle, UserPlus, Shield, Stethoscope, Trash2, Users, Baby, UserCheck, Pencil, Image as ImageIcon } from "lucide-react";
import { ActivityManager } from "@/components/admin/ActivityManager";
import { HeaderLogosManager } from "@/components/admin/HeaderLogosManager";

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
      fetchStats();
    }
  }, [role]);

  const fetchStats = async () => {
    const [{ count: usersCount }, { count: approvedCount }, { count: childrenCount }] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("specialists").select("*", { count: "exact", head: true }).eq("is_approved", true),
      supabase.from("children").select("*", { count: "exact", head: true }),
    ]);
    setStats({
      users: usersCount ?? 0,
      approvedSpecialists: approvedCount ?? 0,
      children: childrenCount ?? 0,
    });
  };

  const fetchSpecialists = async () => {
    // Mock data for demonstration purposes
    const mockData = [
      {
        id: "1",
        user_id: "user-1",
        specialty: "أخصائي تخاطب",
        bio: "خبرة في التعامل مع الأطفال ذوي التوحد وتأخر الكلام.",
        experience_years: 5,
        conditions: ["asd", "down_syndrome"],
        is_approved: false,
        created_at: new Date().toISOString(),
        profile: { full_name: "أحمد محمد", phone: "01012345678" }
      },
      {
        id: "2",
        user_id: "user-2",
        specialty: "تعديل سلوك",
        bio: "متخصصة في تعديل سلوكيات فرط الحركة.",
        experience_years: 3,
        conditions: ["adhd"],
        is_approved: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profile: { full_name: "سارة محمود", phone: "01198765432" }
      }
    ];
    setSpecialists(mockData);
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

  const handleDeleteSpecialist = async (id: string) => {
    const { error } = await supabase.from("specialists").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("تم حذف المتخصص");
      fetchSpecialists();
      fetchStats();
    }
  };

  const [editingSpecialist, setEditingSpecialist] = useState<SpecialistRow | null>(null);
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editExp, setEditExp] = useState("");
  const [editConditions, setEditConditions] = useState<string[]>([]);
  const [editSpecName, setEditSpecName] = useState("");

  const openEditDialog = (s: SpecialistRow) => {
    setEditingSpecialist(s);
    setEditSpecialty(s.specialty);
    setEditBio(s.bio || "");
    setEditExp(s.experience_years?.toString() || "");
    setEditConditions([...s.conditions]);
    setEditSpecName(s.profile?.full_name || "");
  };

  const handleSaveSpecialist = async () => {
    if (!editingSpecialist) return;
    setSaving(true);
    const { error } = await supabase
      .from("specialists")
      .update({
        specialty: editSpecialty,
        bio: editBio,
        experience_years: parseInt(editExp) || 0,
        conditions: editConditions as any,
      })
      .eq("id", editingSpecialist.id);

    // Update profile name if changed
    if (editSpecName !== editingSpecialist.profile?.full_name) {
      await supabase
        .from("profiles")
        .update({ full_name: editSpecName })
        .eq("user_id", editingSpecialist.user_id);
    }

    setSaving(false);
    if (error) toast.error(error.message);
    else {
      toast.success("تم تحديث بيانات المتخصص");
      setEditingSpecialist(null);
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
        <h1 className="text-3xl font-extrabold mb-6 text-foreground">لوحة تحكم الإدارة</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "إجمالي المستخدمين", value: stats.users, icon: Users, color: "text-primary" },
            { label: "المتخصصون المعتمدون", value: stats.approvedSpecialists, icon: UserCheck, color: "text-secondary" },
            { label: "الأطفال المسجلون", value: stats.children, icon: Baby, color: "text-accent-foreground" },
          ].map((s) => (
            <Card key={s.label} className="rounded-2xl border-border">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="specialists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-xl h-auto">
            <TabsTrigger value="specialists" className="rounded-xl">طلبات المتخصصين</TabsTrigger>
            <TabsTrigger value="invitations" className="rounded-xl">الدعوات</TabsTrigger>
            <TabsTrigger value="media" className="rounded-xl gap-1">
              <ImageIcon className="w-4 h-4" /> إدارة الصور
            </TabsTrigger>
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
                              <Button size="sm" variant="outline" className="gap-1 rounded-lg" onClick={() => openEditDialog(s)}>
                                <Pencil className="w-4 h-4" /> تعديل
                              </Button>
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
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>حذف المتخصص</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف {s.profile?.full_name || "هذا المتخصص"}؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSpecialist(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

          {/* Media Management Tab */}
          <TabsContent value="media">
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <HeaderLogosManager />
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <ActivityManager
                  disability={null}
                  title="معرض ركن الأطفال (عام)"
                  emptyHint="لا توجد صور في المعرض العام بعد"
                />
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold mb-1">أنشطة اضطراب طيف التوحد 🧩</h3>
                <p className="text-sm text-muted-foreground mb-4">تظهر داخل صفحة التوحد في مكتبة الإعاقات</p>
                <ActivityManager disability="asd" title="" emptyHint="لا توجد أنشطة بعد" />
              </div>

              <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-bold mb-1">أنشطة فرط الحركة وتشتت الانتباه ⚡</h3>
                <p className="text-sm text-muted-foreground mb-4">تظهر داخل صفحة فرط الحركة في مكتبة الإعاقات</p>
                <ActivityManager disability="adhd" title="" emptyHint="لا توجد أنشطة بعد" />
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

      {/* Edit Specialist Dialog */}
      <Dialog open={!!editingSpecialist} onOpenChange={(open) => !open && setEditingSpecialist(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات المتخصص</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">الاسم</label>
              <Input value={editSpecName} onChange={(e) => setEditSpecName(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">التخصص</label>
              <Input value={editSpecialty} onChange={(e) => setEditSpecialty(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">سنوات الخبرة</label>
              <Input type="number" value={editExp} onChange={(e) => setEditExp(e.target.value)} className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">نبذة</label>
              <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="rounded-xl" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">الحالات</label>
              <div className="flex gap-2">
                {[
                  { value: "adhd", label: "⚡ فرط الحركة" },
                  { value: "down_syndrome", label: "💛 متلازمة داون" },
                ].map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() =>
                      setEditConditions((prev) =>
                        prev.includes(c.value) ? prev.filter((x) => x !== c.value) : [...prev, c.value]
                      )
                    }
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${
                      editConditions.includes(c.value)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSpecialist(null)} className="rounded-xl">إلغاء</Button>
            <Button onClick={handleSaveSpecialist} disabled={saving} className="rounded-xl">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
