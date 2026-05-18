import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Search, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function OffersAdmin() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    promoCode: "",
    startDate: "",
    endDate: "",
    totalSpots: "",
    imageUrl: "",
    badgeText: "",
    badgeColor: "#D4A853",
  });

  const {
    data: offers,
    isLoading,
    refetch,
  } = trpc.admin.offers.list.useQuery({
    search,
    limit: 20,
  });

  const createMutation = trpc.admin.offers.create.useMutation({
    onSuccess: () => {
      alert("تم إنشاء العرض بنجاح");
      refetch();
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        destination: "",
        discountType: "percentage",
        discountValue: "",
        promoCode: "",
        startDate: "",
        endDate: "",
        totalSpots: "",
        imageUrl: "",
        badgeText: "",
        badgeColor: "#D4A853",
      });
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.admin.offers.update.useMutation({
    onSuccess: () => {
      alert("تم تحديث العرض بنجاح");
      refetch();
      setIsOpen(false);
      setEditingId(null);
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const deleteMutation = trpc.admin.offers.delete.useMutation({
    onSuccess: () => {
      alert("تم حذف العرض بنجاح");
      refetch();
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.discountValue) {
      alert("العنوان والخصم مطلوبان");
      return;
    }

    const startDateTimestamp = formData.startDate
      ? new Date(formData.startDate).getTime()
      : Date.now();
    const endDateTimestamp = formData.endDate
      ? new Date(formData.endDate).getTime()
      : Date.now();

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...formData,
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
        totalSpots: formData.totalSpots
          ? parseInt(formData.totalSpots)
          : undefined,
      });
    } else {
      await createMutation.mutateAsync({
        ...formData,
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
        totalSpots: formData.totalSpots
          ? parseInt(formData.totalSpots)
          : undefined,
      });
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "-";
    return new Date(timestamp).toLocaleDateString("ar-EG");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة العروض والحزم</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة عرض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "تعديل العرض" : "إضافة عرض جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="عنوان العرض"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <Input
                placeholder="الوجهة"
                value={formData.destination}
                onChange={(e) =>
                  setFormData({ ...formData, destination: e.target.value })
                }
              />
              <Textarea
                placeholder="الوصف"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">نوع الخصم</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="percentage">نسبة مئوية %</option>
                    <option value="fixed">مبلغ ثابت $</option>
                  </select>
                </div>
                <Input
                  placeholder="قيمة الخصم"
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: e.target.value })
                  }
                />
              </div>
              <Input
                placeholder="كود الترويج"
                value={formData.promoCode}
                onChange={(e) =>
                  setFormData({ ...formData, promoCode: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">تاريخ البداية</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">تاريخ النهاية</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <Input
                placeholder="عدد الأماكن المتاحة"
                type="number"
                value={formData.totalSpots}
                onChange={(e) =>
                  setFormData({ ...formData, totalSpots: e.target.value })
                }
              />
              <Input
                placeholder="رابط الصورة"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="نص الشارة"
                  value={formData.badgeText}
                  onChange={(e) =>
                    setFormData({ ...formData, badgeText: e.target.value })
                  }
                />
                <div>
                  <label className="text-sm text-gray-600">لون الشارة</label>
                  <Input
                    type="color"
                    value={formData.badgeColor}
                    onChange={(e) =>
                      setFormData({ ...formData, badgeColor: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {editingId ? "تحديث" : "إضافة"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          placeholder="البحث عن عرض..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الوجهة</TableHead>
              <TableHead>الخصم</TableHead>
              <TableHead>التاريخ</TableHead>
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
            ) : offers && offers.length > 0 ? (
              offers.map((offer: any) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell>{offer.destination || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50">
                      {offer.discountValue}
                      {offer.discountType === "percentage" ? "%" : "$"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(offer.startDate)} -{" "}
                      {formatDate(offer.endDate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        offer.isActive === "active" ? "default" : "secondary"
                      }
                    >
                      {offer.isActive === "active" ? "نشط" : "غير نشط"}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(offer.id);
                        setFormData({
                          ...offer,
                          startDate: new Date(offer.startDate)
                            .toISOString()
                            .split("T")[0],
                          endDate: new Date(offer.endDate)
                            .toISOString()
                            .split("T")[0],
                          totalSpots: offer.totalSpots?.toString() || "",
                        });
                        setIsOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: offer.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  لا توجد عروض
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
