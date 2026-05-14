import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Upload, Search, Grid3X3, List, Trash2, Copy, Eye, Download, FolderOpen, Film, FileText, Music, X, Check, Filter, Loader2 } from "lucide-react";

/* ─── Types ─── */
interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "document" | "audio";
  size: string;
  dimensions?: string;
  uploadedAt: string;
  folder: string;
  tags: string[];
}

/* ─── Sample Data ─── */
const SAMPLE_MEDIA: MediaItem[] = [
  { id: "1", name: "hero-pyramids.jpg", url: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=400", type: "image", size: "2.4 MB", dimensions: "1920x1080", uploadedAt: "2026-04-20", folder: "Hero", tags: ["hero", "pyramids", "egypt"] },
  { id: "2", name: "nile-cruise.jpg", url: "https://images.unsplash.com/photo-1568322503122-d524cae5d4cf?w=400", type: "image", size: "1.8 MB", dimensions: "1920x1080", uploadedAt: "2026-04-19", folder: "Destinations", tags: ["nile", "cruise", "luxury"] },
  { id: "3", name: "luxor-temple.jpg", url: "https://images.unsplash.com/photo-1590059390098-f484a2a1e1d4?w=400", type: "image", size: "3.1 MB", dimensions: "2560x1440", uploadedAt: "2026-04-18", folder: "Gallery", tags: ["luxor", "temple", "ancient"] },
  { id: "4", name: "desert-safari.jpg", url: "https://images.unsplash.com/photo-1547234935-80c7145ec969?w=400", type: "image", size: "2.7 MB", dimensions: "1920x1280", uploadedAt: "2026-04-17", folder: "Activities", tags: ["desert", "safari", "adventure"] },
  { id: "5", name: "avatar-benjamin.jpg", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", type: "image", size: "0.5 MB", dimensions: "400x400", uploadedAt: "2026-04-16", folder: "Avatars", tags: ["avatar", "testimonial"] },
  { id: "6", name: "avatar-sarah.jpg", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", type: "image", size: "0.4 MB", dimensions: "400x400", uploadedAt: "2026-04-16", folder: "Avatars", tags: ["avatar", "testimonial"] },
  { id: "7", name: "cairo-skyline.jpg", url: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400", type: "image", size: "2.2 MB", dimensions: "1920x1080", uploadedAt: "2026-04-15", folder: "Destinations", tags: ["cairo", "skyline", "city"] },
  { id: "8", name: "red-sea-diving.jpg", url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400", type: "image", size: "1.9 MB", dimensions: "1920x1280", uploadedAt: "2026-04-14", folder: "Activities", tags: ["red sea", "diving", "underwater"] },
];

const FOLDERS = ["All", "Hero", "Destinations", "Gallery", "Activities", "Avatars", "Blog", "Offers"];

const TYPE_ICONS = {
  image: <Image className="w-4 h-4" />,
  video: <Film className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  audio: <Music className="w-4 h-4" />,
};

/* ─── Main Component ─── */
export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>(SAMPLE_MEDIA);

  // Load gallery items from DB
  const galleryQuery = trpc.gallery.listAll.useQuery({ limit: 200, offset: 0 });
  const uploadMutation = trpc.uploads.upload.useMutation();
  // gallery doesn't have a delete mutation, we handle locally

  useEffect(() => {
    if (galleryQuery.data && galleryQuery.data.length > 0) {
      const dbMedia: MediaItem[] = galleryQuery.data.map((item: any) => ({
        id: String(item.id),
        name: item.title || item.imageUrl?.split('/').pop() || 'untitled',
        url: item.imageUrl || '',
        type: 'image' as const,
        size: item.size || 'Unknown',
        dimensions: item.dimensions || '',
        uploadedAt: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '',
        folder: item.category || 'General',
        tags: item.tags ? (typeof item.tags === 'string' ? item.tags.split(',') : item.tags) : [],
      }));
      setMedia(prev => {
        // Merge DB items with sample, prioritize DB
        const dbIds = new Set(dbMedia.map(m => m.id));
        return [...dbMedia, ...prev.filter(m => !dbIds.has(m.id))];
      });
    }
  }, [galleryQuery.data]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.tags.some((t) => t.includes(searchQuery.toLowerCase()));
    const matchesFolder = selectedFolder === "All" || item.folder === selectedFolder;
    const matchesType = selectedType === "all" || item.type === selectedType;
    return matchesSearch && matchesFolder && matchesType;
  });

  const totalSize = media.reduce((sum, m) => {
    const num = parseFloat(m.size);
    return sum + num;
  }, 0);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteSelected = () => {
    const toDelete = Array.from(selectedItems);
    setMedia((prev) => prev.filter((m) => !selectedItems.has(m.id)));
    setSelectedItems(new Set());
    toast.success(`${toDelete.length} item(s) removed from library`);
  };

  const handleUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/trpc/uploads.upload', {
            method: 'POST',
            body: formData,
          });
          // Add to local state
          const newItem: MediaItem = {
            id: String(Date.now() + Math.random()),
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'document',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            uploadedAt: new Date().toISOString().split('T')[0],
            folder: 'Uploads',
            tags: ['new'],
          };
          setMedia(prev => [newItem, ...prev]);
        }
        toast.success(`${files.length} file(s) uploaded successfully`);
        galleryQuery.refetch();
      } catch (err: any) {
        toast.error(`Upload failed: ${err.message}`);
      } finally {
        setUploading(false);
        setShowUpload(false);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Image className="w-6 h-6 text-[var(--theme-primary)]" />
            Media Library
          </h1>
          <p className="text-white/50 mt-1">{media.length} files &middot; {totalSize.toFixed(1)} MB total</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.size > 0 && (
            <Button variant="outline" size="sm" onClick={deleteSelected} className="border-red-500/30 text-red-400 hover:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-1" /> Delete ({selectedItems.size})
            </Button>
          )}
          <Button onClick={() => setShowUpload(true)} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]">
            <Upload className="w-4 h-4 mr-1" /> Upload Files
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Images", count: media.filter((m) => m.type === "image").length, icon: <Image className="w-4 h-4" />, color: "text-blue-400" },
          { label: "Videos", count: media.filter((m) => m.type === "video").length, icon: <Film className="w-4 h-4" />, color: "text-purple-400" },
          { label: "Documents", count: media.filter((m) => m.type === "document").length, icon: <FileText className="w-4 h-4" />, color: "text-green-400" },
          { label: "Audio", count: media.filter((m) => m.type === "audio").length, icon: <Music className="w-4 h-4" />, color: "text-orange-400" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-black/40 border-white/10">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-white font-bold">{stat.count}</p>
                <p className="text-white/40 text-xs">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search files or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white"
          />
        </div>

        {/* Folder Filter */}
        <div className="flex items-center gap-1 flex-wrap">
          {FOLDERS.map((folder) => (
            <Button
              key={folder}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFolder(folder)}
              className={`text-xs ${selectedFolder === folder ? "bg-[var(--theme-primary)]/20 text-[var(--theme-primary)]" : "text-white/50 hover:text-white"}`}
            >
              <FolderOpen className="w-3 h-3 mr-1" /> {folder}
            </Button>
          ))}
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[130px] bg-black/40 border-white/10 text-white">
            <Filter className="w-3 h-3 mr-1" /> <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="document">Documents</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex border border-white/10 rounded-md">
          <Button variant="ghost" size="sm" onClick={() => setViewMode("grid")} className={viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40"}>
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setViewMode("list")} className={viewMode === "list" ? "bg-white/10 text-white" : "text-white/40"}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Media Grid / List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className={`bg-black/40 border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] group ${
                selectedItems.has(item.id) ? "border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)]/30" : "border-white/10 hover:border-white/20"
              }`}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-black/60 flex items-center justify-center">
                      {TYPE_ICONS[item.type]}
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setPreviewItem(item)} className="text-white bg-white/10 hover:bg-white/20">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => copyUrl(item)} className="text-white bg-white/10 hover:bg-white/20">
                      {copiedId === item.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => window.open(item.url, "_blank")} className="text-white bg-white/10 hover:bg-white/20">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Select checkbox */}
                  <div
                    className={`absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all ${
                      selectedItems.has(item.id) ? "bg-[var(--theme-primary)] border-[var(--theme-primary)]" : "border-white/30 bg-black/30 opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                  >
                    {selectedItems.has(item.id) && <Check className="w-3 h-3 text-black" />}
                  </div>

                  {/* Folder badge */}
                  <Badge className="absolute top-2 right-2 bg-black/60 text-white/70 border-0 text-[10px]">{item.folder}</Badge>
                </div>

                <div className="p-2">
                  <p className="text-white text-xs truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white/30 text-[10px]">{item.size}</span>
                    {item.dimensions && <span className="text-white/30 text-[10px]">{item.dimensions}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left w-8"></th>
                  <th className="p-3 text-left text-white/50 text-sm">Preview</th>
                  <th className="p-3 text-left text-white/50 text-sm">Name</th>
                  <th className="p-3 text-left text-white/50 text-sm">Type</th>
                  <th className="p-3 text-left text-white/50 text-sm">Folder</th>
                  <th className="p-3 text-left text-white/50 text-sm">Size</th>
                  <th className="p-3 text-left text-white/50 text-sm">Date</th>
                  <th className="p-3 text-right text-white/50 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      <div
                        className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center ${
                          selectedItems.has(item.id) ? "bg-[var(--theme-primary)] border-[var(--theme-primary)]" : "border-white/20"
                        }`}
                        onClick={() => toggleSelect(item.id)}
                      >
                        {selectedItems.has(item.id) && <Check className="w-3 h-3 text-black" />}
                      </div>
                    </td>
                    <td className="p-3">
                      {item.type === "image" ? (
                        <img src={item.url} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-black/40 flex items-center justify-center text-white/30">{TYPE_ICONS[item.type]}</div>
                      )}
                    </td>
                    <td className="p-3 text-white text-sm">{item.name}</td>
                    <td className="p-3"><Badge className="bg-white/5 text-white/50 border-0 text-xs">{item.type}</Badge></td>
                    <td className="p-3 text-white/50 text-sm">{item.folder}</td>
                    <td className="p-3 text-white/40 text-sm">{item.size}</td>
                    <td className="p-3 text-white/40 text-sm">{item.uploadedAt}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setPreviewItem(item)} className="text-white/50 hover:text-white"><Eye className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => copyUrl(item)} className="text-white/50 hover:text-white">
                          {copiedId === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No media files found</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="bg-[var(--theme-surface)] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{previewItem?.name}</DialogTitle>
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              {previewItem.type === "image" && (
                <img src={previewItem.url} alt={previewItem.name} className="w-full rounded-lg" />
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-white/40 text-xs">Size</p>
                  <p className="text-white">{previewItem.size}</p>
                </div>
                {previewItem.dimensions && (
                  <div className="bg-black/30 p-3 rounded-lg">
                    <p className="text-white/40 text-xs">Dimensions</p>
                    <p className="text-white">{previewItem.dimensions}</p>
                  </div>
                )}
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-white/40 text-xs">Folder</p>
                  <p className="text-white">{previewItem.folder}</p>
                </div>
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-white/40 text-xs">Uploaded</p>
                  <p className="text-white">{previewItem.uploadedAt}</p>
                </div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg">
                <p className="text-white/40 text-xs mb-1">URL</p>
                <div className="flex items-center gap-2">
                  <code className="text-[var(--theme-primary)] text-xs flex-1 truncate">{previewItem.url}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyUrl(previewItem)} className="text-white/50 hover:text-white shrink-0">
                    {copiedId === previewItem.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {previewItem.tags.map((tag) => (
                  <Badge key={tag} className="bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-0 text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="bg-[var(--theme-surface)] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-[var(--theme-primary)]" />
              Upload Files
            </DialogTitle>
          </DialogHeader>
          <div
            className="border-2 border-dashed border-white/10 rounded-lg p-12 text-center hover:border-[var(--theme-primary)]/30 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Drag & drop files here or click to browse</p>
            <p className="text-white/30 text-xs mt-1">Supports: JPG, PNG, WebP, GIF, MP4, PDF, MP3</p>
            <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*,video/*,audio/*,.pdf" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)} className="border-white/10 text-white/70">Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]">
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
