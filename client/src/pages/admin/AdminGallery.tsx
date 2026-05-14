/**
 * Admin Gallery Management Page
 * Full CRUD for gallery images and videos with upload, edit, delete, visibility toggle
 * Design: Art Deco Luxe - Black & Gold (matches admin panel theme)
 */
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import OptimizedImage from "@/components/OptimizedImage";
import {
  Image, Plus, Pencil, Trash2, Eye, EyeOff, Upload,
  X, Search, Star, Video, ChevronDown, Loader2, Link2,
  Grid3X3, LayoutGrid, Filter
} from "lucide-react";

/* ─── Category Options ─── */
const CATEGORY_OPTIONS = [
  { value: "Pyramids & Ancient Sites", label: "Pyramids & Ancient Sites", labelAr: "الأهرامات والمواقع الأثرية" },
  { value: "Temples & Monuments", label: "Temples & Monuments", labelAr: "المعابد والآثار" },
  { value: "Nile Cruises", label: "Nile Cruises", labelAr: "رحلات النيل" },
  { value: "Desert Safari", label: "Desert Safari", labelAr: "سفاري الصحراء" },
  { value: "Beach & Resorts", label: "Beach & Resorts", labelAr: "شواطئ ومنتجعات" },
  { value: "Luxury Hotels", label: "Luxury Hotels", labelAr: "فنادق فاخرة" },
  { value: "City Tours", label: "City Tours", labelAr: "جولات المدن" },
  { value: "Business Travel", label: "Business Travel", labelAr: "سفر الأعمال" },
  { value: "Branding", label: "Branding", labelAr: "الهوية البصرية" },
];

const ASPECT_OPTIONS = [
  { value: "landscape", label: "Landscape (أفقي)" },
  { value: "portrait", label: "Portrait (عمودي)" },
  { value: "square", label: "Square (مربع)" },
];

/* ─── Tabs ─── */
type Tab = "images" | "videos";

export default function AdminGallery() {
  const [activeTab, setActiveTab] = useState<Tab>("images");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Image modal state
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);

  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<any>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "image" | "video"; id: number } | null>(null);

  const utils = trpc.useUtils();

  /* ─── Queries ─── */
  const { data: galleryItems, isLoading: loadingImages } = trpc.gallery.listAll.useQuery(
    { limit: 200, offset: 0 },
    { staleTime: 30_000 }
  );
  const { data: galleryVideos, isLoading: loadingVideos } = trpc.gallery.listAllVideos.useQuery(
    { limit: 100, offset: 0 },
    { staleTime: 30_000 }
  );

  /* ─── Mutations ─── */
  const createImageMut = trpc.gallery.create.useMutation({
    onSuccess: () => {
      utils.gallery.listAll.invalidate();
      utils.gallery.listVisible.invalidate();
      toast.success("تمت إضافة الصورة بنجاح");
      setShowImageModal(false);
      setEditingImage(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateImageMut = trpc.gallery.update.useMutation({
    onSuccess: () => {
      utils.gallery.listAll.invalidate();
      utils.gallery.listVisible.invalidate();
      toast.success("تم تحديث الصورة بنجاح");
      setShowImageModal(false);
      setEditingImage(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteImageMut = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      utils.gallery.listAll.invalidate();
      utils.gallery.listVisible.invalidate();
      toast.success("تم حذف الصورة");
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const uploadImageMut = trpc.gallery.uploadImage.useMutation({
    onError: (err) => toast.error(err.message),
  });

  const createVideoMut = trpc.gallery.createVideo.useMutation({
    onSuccess: () => {
      utils.gallery.listAllVideos.invalidate();
      utils.gallery.listVisibleVideos.invalidate();
      toast.success("تمت إضافة الفيديو بنجاح");
      setShowVideoModal(false);
      setEditingVideo(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateVideoMut = trpc.gallery.updateVideo.useMutation({
    onSuccess: () => {
      utils.gallery.listAllVideos.invalidate();
      utils.gallery.listVisibleVideos.invalidate();
      toast.success("تم تحديث الفيديو بنجاح");
      setShowVideoModal(false);
      setEditingVideo(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteVideoMut = trpc.gallery.deleteVideo.useMutation({
    onSuccess: () => {
      utils.gallery.listAllVideos.invalidate();
      utils.gallery.listVisibleVideos.invalidate();
      toast.success("تم حذف الفيديو");
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  /* ─── Filtered Data ─── */
  const filteredImages = (galleryItems || []).filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.titleAr || "").includes(searchTerm) ||
      (item.location || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = (galleryVideos || []).filter((video) => {
    return (
      !searchTerm ||
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (video.titleAr || "").includes(searchTerm)
    );
  });

  /* ─── Toggle Visibility ─── */
  const toggleImageVisibility = (item: any) => {
    updateImageMut.mutate({
      id: item.id,
      isVisible: item.isVisible === "visible" ? "hidden" : "visible",
    });
  };

  const toggleVideoVisibility = (video: any) => {
    updateVideoMut.mutate({
      id: video.id,
      isVisible: video.isVisible === "visible" ? "hidden" : "visible",
    });
  };

  const toggleImageFeatured = (item: any) => {
    updateImageMut.mutate({
      id: item.id,
      featured: item.featured === "yes" ? "no" : "yes",
    });
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-[var(--font-display)] font-bold text-white">
            Gallery Management
          </h1>
          <p className="text-sm text-white/50 font-[var(--font-body)] mt-1">
            إدارة صور وفيديوهات المعرض
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (activeTab === "images") {
                setEditingImage(null);
                setShowImageModal(true);
              } else {
                setEditingVideo(null);
                setShowVideoModal(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] rounded-lg font-[var(--font-body)] font-semibold text-sm hover:bg-[var(--theme-primary-light)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {activeTab === "images" ? "Add Image" : "Add Video"}
          </button>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex items-center gap-1 bg-[var(--theme-surface)] rounded-lg p-1 border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab("images")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-[var(--font-body)] font-medium transition-all ${
            activeTab === "images"
              ? "bg-[var(--theme-primary)] text-[var(--theme-surface)]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Image className="w-4 h-4" />
          Images ({galleryItems?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-[var(--font-body)] font-medium transition-all ${
            activeTab === "videos"
              ? "bg-[var(--theme-primary)] text-[var(--theme-surface)]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Video className="w-4 h-4" />
          Videos ({galleryVideos?.length || 0})
        </button>
      </div>

      {/* ─── Search & Filter ─── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white placeholder-[var(--theme-primary-light)]/30 text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
          />
        </div>
        {activeTab === "images" && (
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ─── Images Tab ─── */}
      {activeTab === "images" && (
        <div>
          {loadingImages ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[var(--theme-primary)] animate-spin" />
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-20 bg-[var(--theme-surface)] rounded-xl border border-white/5">
              <Image className="w-16 h-16 text-[var(--theme-primary)]/20 mx-auto mb-4" />
              <p className="text-white/50 font-[var(--font-body)]">
                {searchTerm || filterCategory !== "all" ? "No images match your search" : "No images yet. Add your first image!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredImages.map((item) => (
                <div
                  key={item.id}
                  className={`group relative bg-[var(--theme-surface)] rounded-xl border overflow-hidden transition-all hover:border-[var(--theme-primary)]/40 ${
                    item.isVisible === "hidden" ? "border-red-500/20 opacity-60" : "border-white/5"
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-video">
                    <img
                      src={item.imageUrl}
                      alt={item.titleAr || item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingImage(item);
                          setShowImageModal(true);
                        }}
                        className="w-9 h-9 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleImageVisibility(item)}
                        className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-white hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-colors"
                        title={item.isVisible === "visible" ? "Hide" : "Show"}
                      >
                        {item.isVisible === "visible" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => toggleImageFeatured(item)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                          item.featured === "yes"
                            ? "bg-[var(--theme-primary)] text-[var(--theme-surface)]"
                            : "bg-[#1A1A1A] border border-[#333] text-white hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)]"
                        }`}
                        title={item.featured === "yes" ? "Unfeature" : "Feature"}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: "image", id: item.id })}
                        className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      {item.featured === "yes" && (
                        <span className="bg-[var(--theme-primary)] text-[var(--theme-surface)] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                      {item.isVisible === "hidden" && (
                        <span className="bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-white text-sm font-[var(--font-body)] font-medium truncate">
                      {item.titleAr || item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-[var(--theme-primary)]/60 bg-[var(--theme-primary)]/10 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-white/30">
                        {item.aspect}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Videos Tab ─── */}
      {activeTab === "videos" && (
        <div>
          {loadingVideos ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[var(--theme-primary)] animate-spin" />
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-20 bg-[var(--theme-surface)] rounded-xl border border-white/5">
              <Video className="w-16 h-16 text-[var(--theme-primary)]/20 mx-auto mb-4" />
              <p className="text-white/50 font-[var(--font-body)]">
                {searchTerm ? "No videos match your search" : "No videos yet. Add your first video!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className={`group relative bg-[var(--theme-surface)] rounded-xl border overflow-hidden transition-all hover:border-[var(--theme-primary)]/40 ${
                    video.isVisible === "hidden" ? "border-red-500/20 opacity-60" : "border-white/5"
                  }`}
                >
                  <div className="relative aspect-video">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.titleAr || video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingVideo(video);
                          setShowVideoModal(true);
                        }}
                        className="w-9 h-9 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleVideoVisibility(video)}
                        className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#333] flex items-center justify-center text-white hover:bg-[var(--theme-primary)] hover:text-[var(--theme-surface)] transition-colors"
                      >
                        {video.isVisible === "visible" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ type: "video", id: video.id })}
                        className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {video.isVisible === "hidden" && (
                      <span className="absolute top-2 left-2 bg-red-500/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="text-white text-sm font-[var(--font-body)] font-medium truncate">
                      {video.titleAr || video.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/30">
                      <span>YouTube: {video.youtubeId}</span>
                      {video.duration && <span>{video.duration}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Image Create/Edit Modal ─── */}
      {showImageModal && (
        <ImageFormModal
          editing={editingImage}
          onClose={() => { setShowImageModal(false); setEditingImage(null); }}
          onSubmit={(data) => {
            if (editingImage) {
              updateImageMut.mutate({ id: editingImage.id, ...data });
            } else {
              createImageMut.mutate(data);
            }
          }}
          onUpload={async (fileData, filename, mimeType) => {
            const result = await uploadImageMut.mutateAsync({ fileData, filename, mimeType });
            return result.url;
          }}
          isSubmitting={createImageMut.isPending || updateImageMut.isPending}
          isUploading={uploadImageMut.isPending}
        />
      )}

      {/* ─── Video Create/Edit Modal ─── */}
      {showVideoModal && (
        <VideoFormModal
          editing={editingVideo}
          onClose={() => { setShowVideoModal(false); setEditingVideo(null); }}
          onSubmit={(data) => {
            if (editingVideo) {
              updateVideoMut.mutate({ id: editingVideo.id, ...data });
            } else {
              createVideoMut.mutate(data);
            }
          }}
          isSubmitting={createVideoMut.isPending || updateVideoMut.isPending}
        />
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-[var(--font-display)] font-bold text-lg mb-2">
              Confirm Delete
            </h3>
            <p className="text-white/50 text-sm font-[var(--font-body)] mb-6">
              هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white font-[var(--font-body)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "image") {
                    deleteImageMut.mutate({ id: deleteConfirm.id });
                  } else {
                    deleteVideoMut.mutate({ id: deleteConfirm.id });
                  }
                }}
                disabled={deleteImageMut.isPending || deleteVideoMut.isPending}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-[var(--font-body)] font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {(deleteImageMut.isPending || deleteVideoMut.isPending) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Image Form Modal
   ═══════════════════════════════════════════════════════════════ */
function ImageFormModal({
  editing,
  onClose,
  onSubmit,
  onUpload,
  isSubmitting,
  isUploading,
}: {
  editing: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onUpload: (fileData: string, filename: string, mimeType: string) => Promise<string>;
  isSubmitting: boolean;
  isUploading: boolean;
}) {
  const [form, setForm] = useState({
    imageUrl: editing?.imageUrl || "",
    title: editing?.title || "",
    titleAr: editing?.titleAr || "",
    description: editing?.description || "",
    descriptionAr: editing?.descriptionAr || "",
    category: editing?.category || CATEGORY_OPTIONS[0].value,
    categoryAr: editing?.categoryAr || CATEGORY_OPTIONS[0].labelAr,
    location: editing?.location || "",
    locationAr: editing?.locationAr || "",
    featured: editing?.featured || "no",
    aspect: editing?.aspect || "landscape",
    sortOrder: editing?.sortOrder || 0,
  });

  const [previewUrl, setPreviewUrl] = useState(editing?.imageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 10 ميجابايت");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const base64Reader = new FileReader();
    base64Reader.onload = async () => {
      const base64 = (base64Reader.result as string).split(",")[1];
      try {
        const url = await onUpload(base64, file.name, file.type);
        setForm((prev) => ({ ...prev, imageUrl: url }));
        setPreviewUrl(url);
        toast.success("تم رفع الصورة بنجاح");
      } catch {
        toast.error("فشل رفع الصورة");
      }
    };
    base64Reader.readAsDataURL(file);
  }, [onUpload]);

  const handleCategoryChange = (value: string) => {
    const cat = CATEGORY_OPTIONS.find((c) => c.value === value);
    setForm((prev) => ({
      ...prev,
      category: value,
      categoryAr: cat?.labelAr || prev.categoryAr,
    }));
  };

  const handleSubmit = () => {
    if (!form.imageUrl) {
      toast.error("يرجى رفع صورة أو إدخال رابط الصورة");
      return;
    }
    if (!form.title) {
      toast.error("يرجى إدخال عنوان الصورة");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-white font-[var(--font-display)] font-bold text-lg">
            {editing ? "Edit Image" : "Add New Image"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Image Upload */}
          <div>
            <label className="text-sm text-white/70 font-[var(--font-body)] mb-2 block">Image *</label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div
                className="w-32 h-24 rounded-lg bg-[#1A1A1A] border border-dashed border-white/10 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--theme-primary)]/50 transition-colors shrink-0"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <OptimizedImage src={previewUrl} alt="Preview" className="w-full h-full object-cover" containerClassName="w-full h-full" lazy={false} />
                ) : (
                  <Upload className="w-6 h-6 text-[var(--theme-primary)]/30" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-3 py-2 bg-[var(--theme-primary)]/10 border border-white/10 rounded-lg text-[var(--theme-primary)] text-sm font-[var(--font-body)] hover:bg-[var(--theme-primary)]/20 transition-colors disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? "Uploading..." : "Upload Image"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <p className="text-[10px] text-white/30">Or paste image URL below</p>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, imageUrl: e.target.value }));
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
                />
              </div>
            </div>
          </div>

          {/* Title EN / AR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Title (EN) *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">العنوان (AR)</label>
              <input
                type="text"
                value={form.titleAr}
                onChange={(e) => setForm((prev) => ({ ...prev, titleAr: e.target.value }))}
                dir="rtl"
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
          </div>

          {/* Description EN / AR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Description (EN)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40 resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">الوصف (AR)</label>
              <textarea
                value={form.descriptionAr}
                onChange={(e) => setForm((prev) => ({ ...prev, descriptionAr: e.target.value }))}
                rows={2}
                dir="rtl"
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40 resize-none"
              />
            </div>
          </div>

          {/* Category & Aspect */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Category *</label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Aspect Ratio</label>
              <select
                value={form.aspect}
                onChange={(e) => setForm((prev) => ({ ...prev, aspect: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              >
                {ASPECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location EN / AR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Location (EN)</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">الموقع (AR)</label>
              <input
                type="text"
                value={form.locationAr}
                onChange={(e) => setForm((prev) => ({ ...prev, locationAr: e.target.value }))}
                dir="rtl"
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
          </div>

          {/* Featured & Sort */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Featured</label>
              <select
                value={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              >
                <option value="no">No</option>
                <option value="yes">Yes (مميز)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-white/60 hover:text-white font-[var(--font-body)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] rounded-lg text-sm font-[var(--font-body)] font-semibold hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {editing ? "Update" : "Add Image"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Video Form Modal
   ═══════════════════════════════════════════════════════════════ */
function VideoFormModal({
  editing,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  editing: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState({
    thumbnailUrl: editing?.thumbnailUrl || "",
    title: editing?.title || "",
    titleAr: editing?.titleAr || "",
    youtubeId: editing?.youtubeId || "",
    duration: editing?.duration || "",
    views: editing?.views || "",
    sortOrder: editing?.sortOrder || 0,
  });

  const handleSubmit = () => {
    if (!form.thumbnailUrl) {
      toast.error("يرجى إدخال رابط الصورة المصغرة");
      return;
    }
    if (!form.title) {
      toast.error("يرجى إدخال عنوان الفيديو");
      return;
    }
    if (!form.youtubeId) {
      toast.error("يرجى إدخال YouTube ID");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[var(--theme-surface)] border border-white/10 rounded-xl w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="text-white font-[var(--font-display)] font-bold text-lg">
            {editing ? "Edit Video" : "Add New Video"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Thumbnail URL */}
          <div>
            <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Thumbnail URL *</label>
            <input
              type="text"
              value={form.thumbnailUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
            />
            {form.thumbnailUrl && (
              <OptimizedImage src={form.thumbnailUrl} alt="Preview" className="w-32 h-20 object-cover rounded-lg" containerClassName="w-32 h-20 rounded-lg mt-2" lazy={false} />
            )}
          </div>

          {/* Title EN / AR */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Title (EN) *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">العنوان (AR)</label>
              <input
                type="text"
                value={form.titleAr}
                onChange={(e) => setForm((prev) => ({ ...prev, titleAr: e.target.value }))}
                dir="rtl"
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
          </div>

          {/* YouTube ID */}
          <div>
            <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">YouTube Video ID *</label>
            <input
              type="text"
              value={form.youtubeId}
              onChange={(e) => setForm((prev) => ({ ...prev, youtubeId: e.target.value }))}
              placeholder="e.g. dQw4w9WgXcQ"
              className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
            />
          </div>

          {/* Duration & Views */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                placeholder="e.g. 8:45"
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Views</label>
              <input
                type="text"
                value={form.views}
                onChange={(e) => setForm((prev) => ({ ...prev, views: e.target.value }))}
                placeholder="e.g. 12.5K"
                className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
              />
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="text-sm text-white/70 font-[var(--font-body)] mb-1 block">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2.5 bg-[var(--theme-surface)] border border-white/5 rounded-lg text-white text-sm font-[var(--font-body)] focus:outline-none focus:border-[var(--theme-primary)]/40"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-white/60 hover:text-white font-[var(--font-body)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] rounded-lg text-sm font-[var(--font-body)] font-semibold hover:bg-[var(--theme-primary-light)] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {editing ? "Update" : "Add Video"}
          </button>
        </div>
      </div>
    </div>
  );
}
