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
import { Plus, Edit2, Trash2, Search, Eye, Archive } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BlogAdmin() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    category: "",
    author: "",
    tags: "",
    status: "draft" as "published" | "draft" | "archived",
  });

  const {
    data: articles,
    isLoading,
    refetch,
  } = trpc.admin.blog.list.useQuery({
    search,
    limit: 20,
  });

  const createMutation = trpc.admin.blog.create.useMutation({
    onSuccess: () => {
      alert("تم إنشاء المقالة بنجاح");
      refetch();
      setIsOpen(false);
      setFormData({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        imageUrl: "",
        category: "",
        author: "",
        tags: "",
        status: "draft",
      });
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const updateMutation = trpc.admin.blog.update.useMutation({
    onSuccess: () => {
      alert("تم تحديث المقالة بنجاح");
      refetch();
      setIsOpen(false);
      setEditingId(null);
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const deleteMutation = trpc.admin.blog.delete.useMutation({
    onSuccess: () => {
      alert("تم حذف المقالة بنجاح");
      refetch();
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const publishMutation = trpc.admin.blog.publish.useMutation({
    onSuccess: () => {
      alert("تم نشر المقالة بنجاح");
      refetch();
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const archiveMutation = trpc.admin.blog.archive.useMutation({
    onSuccess: () => {
      alert("تم أرشفة المقالة بنجاح");
      refetch();
    },
    onError: (error: any) => {
      alert("خطأ: " + error.message);
    },
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.slug) {
      alert("العنوان والـ slug مطلوبان");
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImageUrl: formData.imageUrl,
        category: formData.category,
        authorName: formData.author,
        tags,
      });
    } else {
      await createMutation.mutateAsync({
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        coverImageUrl: formData.imageUrl,
        category: formData.category,
        authorName: formData.author,
        tags,
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ar-EG");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المدونة</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة مقالة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "تعديل المقالة" : "إضافة مقالة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="عنوان المقالة"
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData({
                    ...formData,
                    title,
                    slug: generateSlug(title),
                  });
                }}
              />
              <Input
                placeholder="الـ Slug (URL)"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
              <Textarea
                placeholder="الملخص"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                rows={2}
              />
              <Textarea
                placeholder="محتوى المقالة"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={6}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="الفئة"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
                <Input
                  placeholder="المؤلف"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                />
              </div>
              <Input
                placeholder="الوسوم (مفصولة بفواصل)"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
              <Input
                placeholder="رابط الصورة"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
              />
              <div>
                <label className="text-sm text-gray-600">الحالة</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="draft">مسودة</option>
                  <option value="published">منشورة</option>
                  <option value="archived">مؤرشفة</option>
                </select>
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
          placeholder="البحث عن مقالة..."
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
              <TableHead>الفئة</TableHead>
              <TableHead>المؤلف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
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
            ) : articles && articles.length > 0 ? (
              articles.map((article: any) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category || "-"}</TableCell>
                  <TableCell>{article.author || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        article.status === "published"
                          ? "default"
                          : article.status === "archived"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {article.status === "published"
                        ? "منشورة"
                        : article.status === "archived"
                          ? "مؤرشفة"
                          : "مسودة"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(article.createdAt)}
                  </TableCell>
                  <TableCell className="space-x-1">
                    {article.status !== "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          publishMutation.mutate({ id: article.id })
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    {article.status !== "archived" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          archiveMutation.mutate({ id: article.id })
                        }
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingId(article.id);
                        setFormData({
                          title: article.title,
                          slug: article.slug,
                          content: article.content,
                          excerpt: article.excerpt,
                          imageUrl: article.coverImageUrl || "",
                          category: article.category || "",
                          author: article.authorName || "",
                          tags: (article.tags || []).join(", "),
                          status: article.status,
                        });
                        setIsOpen(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteMutation.mutate({ id: article.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  لا توجد مقالات
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
