import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Activity {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  disability: string | null;
}

interface Props {
  /** When set, only activities tagged with this disability are shown/created. */
  disability?: string | null;
  title?: string;
  emptyHint?: string;
}

export const ActivityManager = ({ disability = null, title = "إدارة الصور والأنشطة", emptyHint }: Props) => {
  const { user } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [titleVal, setTitleVal] = useState("");
  const [descVal, setDescVal] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchItems = async () => {
    setLoading(true);


    let q = supabase.from("kids_activities").select("*").order("created_at", { ascending: false });
    if (disability) q = q.eq("disability", disability);
    else q = q.is("disability", null);
    const { data, error } = await q;
    
    if (error) {
      toast.error("تعذر تحميل الأنشطة");
    } else {
      setItems((data || []) as Activity[]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disability]);

  const resetForm = () => {
    setEditing(null);
    setTitleVal("");
    setDescVal("");
    setFile(null);
  };

  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (a: Activity) => {
    setEditing(a);
    setTitleVal(a.title);
    setDescVal(a.description || "");
    setFile(null);
    setOpen(true);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!file || !user) return null;

    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("kids-activities")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      toast.error("فشل رفع الصورة");
      return null;
    }
    const { data: pub } = supabase.storage.from("kids-activities").getPublicUrl(path);
    return pub.publicUrl;
  };

  const handleSave = async () => {
    if (!user || !titleVal.trim()) {
      toast.error("الرجاء إدخال عنوان");
      return;
    }
    setBusy(true);
    try {
      if (editing) {
        let image_url = editing.image_url;
        if (file) {
          const url = await uploadImage();
          if (!url) return;
          image_url = url;
        }
        


        const { error } = await supabase
          .from("kids_activities")
          .update({
            title: titleVal.trim(),
            description: descVal.trim() || null,
            image_url,
          })
          .eq("id", editing.id);
        if (error) toast.error("تعذر التحديث");
        else {
          toast.success("تم التحديث");
          setOpen(false);
          resetForm();
          fetchItems();
        }
      } else {
        if (!file) {
          toast.error("الرجاء اختيار صورة");
          return;
        }
        const url = await uploadImage();
        if (!url) return;
        


        const { error } = await supabase.from("kids_activities").insert({
          title: titleVal.trim(),
          description: descVal.trim() || null,
          image_url: url,
          created_by: user.id,
          disability: disability,
        });
        if (error) toast.error("تعذر الإضافة");
        else {
          toast.success("تمت الإضافة");
          setOpen(false);
          resetForm();
          fetchItems();
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (a: Activity) => {
    if (!confirm(`حذف "${a.title}"؟`)) return;
    


    const { error } = await supabase.from("kids_activities").delete().eq("id", a.id);
    if (error) toast.error("تعذر الحذف");
    else {
      toast.success("تم الحذف");
      fetchItems();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={openAdd} className="rounded-xl gap-2">
              <ImagePlus className="w-4 h-4" /> إضافة صورة
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>{editing ? "تعديل الصورة" : "إضافة صورة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>العنوان</Label>
                <Input value={titleVal} onChange={(e) => setTitleVal(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label>الوصف (اختياري)</Label>
                <Textarea value={descVal} onChange={(e) => setDescVal(e.target.value)} className="rounded-xl" rows={3} />
              </div>
              <div>
                <Label>الصورة {editing && "(اتركه فارغًا للإبقاء على الصورة الحالية)"}</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="rounded-xl" />
                {editing && !file && (
                  <img src={editing.image_url} alt="" className="mt-2 w-24 h-24 object-cover rounded-lg" />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); resetForm(); }} className="rounded-xl">إلغاء</Button>
              <Button onClick={handleSave} disabled={busy} className="rounded-xl">
                {busy ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-6">جاري التحميل...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground text-center py-6">{emptyHint || "لا توجد صور بعد"}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <img src={a.image_url} alt={a.title} className="w-full h-40 object-cover" />
              <div className="p-3 space-y-2">
                <h4 className="font-bold text-sm">{a.title}</h4>
                {a.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => openEdit(a)} className="rounded-lg gap-1 flex-1">
                    <Pencil className="w-3 h-3" /> تعديل
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(a)} className="rounded-lg gap-1 text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
