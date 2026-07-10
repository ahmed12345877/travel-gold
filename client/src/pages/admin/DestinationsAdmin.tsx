import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DestinationsAdmin() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    pricePerPerson: "",
    rating: "5",
    imageUrl: "",
    highlights: "",
    bestTimeToVisit: "",
    duration: "",
    difficulty: "moderate" as const,
    groupSize: "",
    inclusions: "",
    exclusions: "",
  });

  const utils = trpc.useUtils();
  const { data: destinations, isLoading, refetch } = trpc.admin.destinations.list.useQuery({
    search,
    limit: 20,
  });

  // Mutation for uploading destination images
  const uploadImageMutation = trpc.gallery.uploadImage.useMutation({
    onSuccess: (result) => {
      console.log("[DestinationsAdmin] Image uploaded successfully:", result.url);
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      toast.success("تم رفع الصورة بنجاح");
      setIsUploadingImage(false);
      // Keep gallery views in sync with new uploads
      utils.gallery.listAll.invalidate();
      utils.gallery.listVisible.invalidate();
    },
    onError: (error: any) => {
      console.error("[DestinationsAdmin] Image upload failed:", error);
      toast.error("خطأ في رفع الصورة: " + (error.message || "Unknown error"));
      setIsUploadingImage(false);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 10 ميجابايت");
      input.value = "";
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        if (typeof reader.result !== "string") {
          throw new Error("Invalid file reader result");
        }
        const base64Data = reader.result.split(",")[1];
        await uploadImageMutation.mutateAsync({
          fileData: base64Data,
          filename: file.name,
          mimeType: file.type,
        });
      } catch (error) {
        console.error("[DestinationsAdmin] Upload error:", error);
        toast.error("خطأ في رفع الصورة");
      } finally {
        setIsUploadingImage(false);
        input.value = "";
      }
    };
    reader.onerror = () => {
      toast.error("خطأ في قراءة الملف");
      setIsUploadingImage(false);
      input.value = "";
    };
    reader.readAsDataURL(file);
  };

  const createMutation = trpc.admin.destinations.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الوجهة بنجاح");
      refetch();
      setIsOpen(false);
      setFormData({
        name: "",
        description: "",
        location: "",
        pricePerPerson: "",
        rating: "5",
        imageUrl: "",
        highlights: "",
        bestTimeToVisit: "",
        duration: "",
        difficulty: "moderate",
        groupSize: "",
        inclusions: "",
        exclusions: "",
      });
    },
    onError: (error: any) => {
      toast.error("خطأ: " + (error.message || "فشل حفظ الوجهة"));
    },
  });

  const updateMutation = trpc.admin.destinations.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الوجهة بنجاح");
      refetch();
      setIsOpen(false);
      setEditingId(null);
    },
    onError: (error: any) => {
      toast.error("خطأ: " + (error.message || "فشل تحديث الوجهة"));
    },
  });

  const deleteMutation = trpc.admin.destinations.delete.useMutation({
    onSuccess: () => {
      alert("تم حذف الوجهة بنجاح");
      refetch();
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const handleSubmit = async () => {
    // Prevent concurrent mutations
    if (updateMutation.isPending || createMutation.isPending || isUploadingImage) {
      return;
    }

    if (!formData.name || !formData.location) {
      toast.error("الاسم والموقع مطلوبان");
      return;
    }

    // Numeric validation
    const pricePerPerson = Number(formData.pricePerPerson);
    const rating = Number(formData.rating);
    const groupSize = formData.groupSize ? Number(formData.groupSize) : null;

    if (Number.isNaN(pricePerPerson) || pricePerPerson <= 0) {
      toast.error("السعر لكل شخص يجب أن يكون رقماً أكبر من 0");
      return;
    }

    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      toast.error("التقييم يجب أن يكون بين 1 و 5");
      return;
    }

    if (groupSize !== null && (Number.isNaN(groupSize) || groupSize <= 0)) {
      toast.error("حجم المجموعة يجب أن يكون رقماً موجباً");
      return;
    }

    const payload = {
      ...formData,
      pricePerPerson: String(pricePerPerson),
      rating: String(rating),
      groupSize: groupSize ? String(groupSize) : undefined,
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة الوجهات</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة وجهة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل الوجهة" : "إضافة وجهة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <Input
                placeholder="اسم الوجهة"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                placeholder="الموقع"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <Textarea
                placeholder="الوصف"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                placeholder="السعر لكل شخص"
                type="number"
                value={formData.pricePerPerson}
                onChange={(e) => setFormData({ ...formData, pricePerPerson: e.target.value })}
              />
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">الصورة</label>
                {formData.imageUrl && (
                  <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2 border border-gray-200">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("[DestinationsAdmin] Image preview failed:", formData.imageUrl);
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
                <label className="flex items-center justify-center w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 text-gray-600">
                    <Upload size={16} />
                    <span className="text-sm">
                      {isUploadingImage ? "جاري الرفع..." : "رفع صورة أو انقر للاختيار"}
                    </span>
                  </div>
                </label>
                <p className="text-xs text-gray-500">
                  {formData.imageUrl && `✓ الصورة المرفوعة: ${formData.imageUrl.substring(0, 50)}...`}
                </p>
              </div>

              <Input
                placeholder="التقييم (1-5)"
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              />
              <Input
                placeholder="مدة الرحلة"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
              <Textarea
                placeholder="الأنشطة المميزة"
                value={formData.highlights}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              />
              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={isUploadingImage || !formData.name || !formData.location || updateMutation.isPending || createMutation.isPending}
              >
                {editingId ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="البحث عن وجهة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الموقع</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>التقييم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : destinations && destinations.length > 0 ? (
              destinations.map((destination: any) => (
                <TableRow key={destination.id}>
                  <TableCell className="font-medium">{destination.name}</TableCell>
                  <TableCell>{destination.location}</TableCell>
                  <TableCell>${destination.pricePerPerson}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{destination.rating} ⭐</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={destination.isActive === "active" ? "default" : "secondary"}>
                      {destination.isActive === "active" ? "نشطة" : "غير نشطة"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(destination.id);
                        setFormData(destination);
                        setIsOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: destination.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  لا توجد وجهات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
