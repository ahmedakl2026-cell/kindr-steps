import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const SETTING_KEYS = [
  { key: "header_logo_right", label: "الشعار الأول (يمين)", isImage: true },
  { key: "header_title", label: "صورة العنوان (المنتصف)", isImage: true },
  { key: "header_logo_left", label: "الشعار الثاني (يسار)", isImage: true },
];

export const HeaderLogosManager = () => {
  const { user } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*").in("key", SETTING_KEYS.map((s) => s.key));
    const map: Record<string, string> = {};
    (data || []).forEach((row: any) => { map[row.key] = row.value || ""; });
    
    if (localStorage.getItem("fake_admin") === "true") {
      SETTING_KEYS.forEach((s) => {
        const mockVal = localStorage.getItem(`mock_setting_${s.key}`);
        if (mockVal !== null) map[s.key] = mockVal;
      });
    }

    setValues(map);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (!user) return null;
    if (user.id === "demo-admin") {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
    const ext = file.name.split(".").pop();
    const path = `site/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("kids-activities").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      toast.error("فشل رفع الصورة");
      return null;
    }
    const { data: pub } = supabase.storage.from("kids-activities").getPublicUrl(path);
    return pub.publicUrl;
  };

  const handleSave = async (key: string) => {
    setBusy(true);
    try {
      let value = values[key] || "";
      const file = files[key];
      if (file) {
        const url = await uploadFile(file);
        if (!url) return;
        value = url;
      }
      
      if (user?.id === "demo-admin") {
        try {
          localStorage.setItem(`mock_setting_${key}`, value);
          setValues(p => ({ ...p, [key]: value }));
          setFiles(p => ({ ...p, [key]: null }));
          toast.success("تم الحفظ (وضع تجريبي)");
        } catch (e) {
          console.error(e);
          toast.error("مساحة الذاكرة ممتلئة! يرجى استخدام صورة أصغر أو مسح بعض البيانات.");
        }
        return;
      }

      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });
      if (error) toast.error("تعذر الحفظ");
      else {
        toast.success("تم الحفظ");
        setFiles((p) => ({ ...p, [key]: null }));
        fetchSettings();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async (key: string) => {
    if (!confirm("إزالة هذا الشعار؟")) return;
    
    if (user?.id === "demo-admin") {
      setValues(p => ({ ...p, [key]: "" }));
      localStorage.setItem(`mock_setting_${key}`, "");
      toast.success("تمت الإزالة (وضع تجريبي)");
      return;
    }

    const { error } = await supabase.from("site_settings").upsert({ key, value: "" }, { onConflict: "key" });
    if (error) toast.error("تعذر الحذف");
    else { toast.success("تمت الإزالة"); fetchSettings(); }
  };

  if (loading) return <p className="text-muted-foreground text-center py-6">جاري التحميل...</p>;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-bold text-foreground">شعارات وعنوان الترويسة</h3>
        <p className="text-sm text-muted-foreground">تظهر في أعلى الصفحة الرئيسية. يمكنك التحديث في أي وقت.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SETTING_KEYS.map((s) => (
          <div key={s.key} className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <Label className="font-bold">{s.label}</Label>
            {s.isImage ? (
              <>
                {values[s.key] ? (
                  <img src={values[s.key]} alt="" className="w-full h-32 object-contain bg-muted/30 rounded-lg" />
                ) : (
                  <div className="w-full h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                    لا يوجد شعار
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles((p) => ({ ...p, [s.key]: e.target.files?.[0] || null }))}
                  className="rounded-xl"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleSave(s.key)} disabled={busy || !files[s.key]} size="sm" className="rounded-lg gap-1 flex-1">
                    <Upload className="w-3 h-3" /> رفع
                  </Button>
                  {values[s.key] && (
                    <Button onClick={() => handleClear(s.key)} variant="outline" size="sm" className="rounded-lg text-destructive">
                      حذف
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Input
                  value={values[s.key] || ""}
                  onChange={(e) => setValues((p) => ({ ...p, [s.key]: e.target.value }))}
                  className="rounded-xl"
                  placeholder="منصة خطوة"
                />
                <Button onClick={() => handleSave(s.key)} disabled={busy} size="sm" className="rounded-lg w-full">
                  حفظ
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
