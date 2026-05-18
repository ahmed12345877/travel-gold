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
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function DestinationsAdmin() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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

  const {
    data: destinations,
    isLoading,
    refetch,
  } = trpc.admin.destinations.list.useQuery({
    search,
    limit: 20,
  });

  const createMutation = trpc.admin.destinations.create.useMutation({
    onSuccess: () => {
      alert("تم إنشاء الوجهة بنجاح");
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
      alert("خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.admin.destinations.update.useMutation({
    onSuccess: () => {
      alert("تم تحديث الوجهة بنجاح");
      refetch();
      setIsOpen(false);
      setEditingId(null);
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
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
    if (!formData.name || !formData.location) {
      alert("الاسم والموقع مطلوبان");
      return;
    }

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
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
              <DialogTitle>
                {editingId ? "تعديل الوجهة" : "إضافة وجهة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="اسم الوجهة"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                placeholder="الموقع"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
              <Textarea
                placeholder="الوصف"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <Input
                placeholder="السعر لكل شخص"
                type="number"
                value={formData.pricePerPerson}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerPerson: e.target.value })
                }
              />
              <Input
                placeholder="رابط الصورة"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
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
                  <TableCell className="font-medium">
                    {destination.name}
                  </TableCell>
                  <TableCell>{destination.location}</TableCell>
                  <TableCell>${destination.pricePerPerson}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{destination.rating} ⭐</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        destination.isActive === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
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
                      onClick={() =>
                        deleteMutation.mutate({ id: destination.id })
                      }
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
