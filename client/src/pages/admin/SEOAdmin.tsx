import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Globe, Share2, Eye, Edit2, Check, Save, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";

/* ─── Types ─── */
interface PageSEO {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
  noIndex: boolean;
  noFollow: boolean;
  lastUpdated: string;
}

/* ─── Initial Data ─── */
const INITIAL_PAGES: PageSEO[] = [
  { id: "1", path: "/", title: "Vanir Group - Luxury Travel & Egypt Tours", description: "Discover Egypt's timeless wonders with Vanir Group. Premium luxury travel experiences, Nile cruises, and exclusive desert adventures.", keywords: "luxury travel, egypt tours, nile cruise, pyramids, vanir group", ogTitle: "Vanir Group - Luxury Travel", ogDescription: "Premium Egypt travel experiences", ogImage: "", canonical: "https://vanirgroup.com", noIndex: false, noFollow: false, lastUpdated: "2026-04-20" },
  { id: "2", path: "/destinations", title: "Destinations - Vanir Group", description: "Explore our curated destinations across Egypt. From Cairo's pyramids to Aswan's temples.", keywords: "egypt destinations, cairo, luxor, aswan, hurghada", ogTitle: "Explore Egypt Destinations", ogDescription: "Curated luxury destinations across Egypt", ogImage: "", canonical: "https://vanirgroup.com/destinations", noIndex: false, noFollow: false, lastUpdated: "2026-04-18" },
  { id: "3", path: "/offers", title: "Special Offers - Vanir Group", description: "Exclusive travel deals and packages. Save up to 40% on luxury Egypt tours.", keywords: "travel offers, egypt deals, discount packages", ogTitle: "Special Travel Offers", ogDescription: "Exclusive deals on luxury Egypt tours", ogImage: "", canonical: "https://vanirgroup.com/offers", noIndex: false, noFollow: false, lastUpdated: "2026-04-15" },
  { id: "4", path: "/blog", title: "Travel Blog - Vanir Group", description: "Travel tips, guides, and stories from Egypt. Expert insights for your next adventure.", keywords: "travel blog, egypt guide, travel tips", ogTitle: "Vanir Travel Blog", ogDescription: "Expert travel guides and stories", ogImage: "", canonical: "https://vanirgroup.com/blog", noIndex: false, noFollow: false, lastUpdated: "2026-04-19" },
  { id: "5", path: "/about", title: "About Us - Vanir Group", description: "Learn about Vanir Group's mission to provide premium luxury travel experiences in Egypt.", keywords: "about vanir group, luxury travel company, egypt tourism", ogTitle: "About Vanir Group", ogDescription: "Premium luxury travel company", ogImage: "", canonical: "https://vanirgroup.com/about", noIndex: false, noFollow: false, lastUpdated: "2026-04-10" },
  { id: "6", path: "/contact", title: "Contact Us - Vanir Group", description: "Get in touch with Vanir Group. We're here to help plan your perfect Egypt journey.", keywords: "contact vanir, travel inquiry, egypt booking", ogTitle: "Contact Vanir Group", ogDescription: "Plan your Egypt journey with us", ogImage: "", canonical: "https://vanirgroup.com/contact", noIndex: false, noFollow: false, lastUpdated: "2026-04-12" },
  { id: "7", path: "/gallery", title: "Photo Gallery - Vanir Group", description: "Stunning photos from Egypt's most beautiful locations. Get inspired for your next trip.", keywords: "egypt photos, travel gallery, pyramids photos", ogTitle: "Egypt Photo Gallery", ogDescription: "Beautiful photos from Egypt", ogImage: "", canonical: "https://vanirgroup.com/gallery", noIndex: false, noFollow: false, lastUpdated: "2026-04-14" },
  { id: "8", path: "/booking", title: "Book Your Trip - Vanir Group", description: "Book your luxury Egypt tour today. Easy online booking with instant confirmation.", keywords: "book egypt tour, travel booking, luxury trip", ogTitle: "Book Your Egypt Trip", ogDescription: "Easy online booking", ogImage: "", canonical: "https://vanirgroup.com/booking", noIndex: false, noFollow: false, lastUpdated: "2026-04-16" },
  { id: "9", path: "/ai-studio", title: "AI Studio - Vanir Group", description: "Create stunning AI-generated images of Egypt. Powered by advanced AI models.", keywords: "ai image generator, egypt ai art, travel ai", ogTitle: "AI Studio - Create Egypt Art", ogDescription: "AI-powered image generation", ogImage: "", canonical: "https://vanirgroup.com/ai-studio", noIndex: false, noFollow: false, lastUpdated: "2026-04-21" },
  { id: "10", path: "/services", title: "Our Services - Vanir Group", description: "Premium travel services including private tours, Nile cruises, and luxury accommodations.", keywords: "travel services, private tours, nile cruise, luxury hotel", ogTitle: "Premium Travel Services", ogDescription: "Luxury travel services in Egypt", ogImage: "", canonical: "https://vanirgroup.com/services", noIndex: false, noFollow: false, lastUpdated: "2026-04-11" },
];

/* ─── SEO Score Calculator ─── */
function calcSEOScore(page: PageSEO): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  if (!page.title || page.title.length < 30) { score -= 15; issues.push("Title too short (min 30 chars)"); }
  if (page.title.length > 60) { score -= 10; issues.push("Title too long (max 60 chars)"); }
  if (!page.description || page.description.length < 50) { score -= 15; issues.push("Description too short (min 50 chars)"); }
  if (page.description.length > 160) { score -= 10; issues.push("Description too long (max 160 chars)"); }
  if (!page.keywords) { score -= 10; issues.push("No keywords defined"); }
  if (!page.ogTitle) { score -= 10; issues.push("Missing Open Graph title"); }
  if (!page.ogDescription) { score -= 10; issues.push("Missing Open Graph description"); }
  if (!page.ogImage) { score -= 10; issues.push("Missing Open Graph image"); }
  if (!page.canonical) { score -= 5; issues.push("No canonical URL"); }

  return { score: Math.max(0, score), issues };
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-400 bg-green-400/10" : score >= 60 ? "text-yellow-400 bg-yellow-400/10" : "text-red-400 bg-red-400/10";
  const icon = score >= 80 ? <CheckCircle2 className="w-3 h-3" /> : score >= 60 ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />;
  return (
    <Badge className={`${color} border-0 gap-1`}>
      {icon} {score}%
    </Badge>
  );
}

/* ─── Main Component ─── */
export default function SEOAdmin() {
  const [pages, setPages] = useState<PageSEO[]>(INITIAL_PAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load SEO data from DB
  const seoQuery = trpc.siteSettings.getByCategory.useQuery({ category: "seo" });
  const saveMutation = trpc.siteSettings.setMany.useMutation();

  useEffect(() => {
    if (seoQuery.data) {
      try {
        if (seoQuery.data.pages) {
          const dbPages = JSON.parse(seoQuery.data.pages);
          if (Array.isArray(dbPages) && dbPages.length > 0) setPages(dbPages);
        }
      } catch { /* use defaults */ }
    }
  }, [seoQuery.data]);

  const filteredPages = pages.filter((p) =>
    p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avgScore = Math.round(pages.reduce((sum, p) => sum + calcSEOScore(p).score, 0) / pages.length);

  const handleEdit = (page: PageSEO) => {
    setEditingPage({ ...page });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    setSaving(true);
    try {
      const updatedPages = pages.map((p) => p.id === editingPage.id ? { ...editingPage, lastUpdated: new Date().toISOString().split("T")[0] } : p);
      setPages(updatedPages);
      await saveMutation.mutateAsync({
        category: "seo",
        settings: { pages: JSON.stringify(updatedPages) },
      });
      toast.success(`SEO settings saved for ${editingPage.path}`);
      setShowDialog(false);
      setEditingPage(null);
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-[var(--theme-primary)]" />
            SEO Management
          </h1>
          <p className="text-white/50 mt-1">Optimize your pages for search engines and social media</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-white/50 text-sm">Average SEO Score</p>
            <p className="text-3xl font-bold mt-1" style={{ color: avgScore >= 80 ? "#22C55E" : avgScore >= 60 ? "#F59E0B" : "#EF4444" }}>{avgScore}%</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-white/50 text-sm">Total Pages</p>
            <p className="text-3xl font-bold text-white mt-1">{pages.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-white/50 text-sm">Good (80%+)</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{pages.filter((p) => calcSEOScore(p).score >= 80).length}</p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-white/50 text-sm">Needs Work</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">{pages.filter((p) => calcSEOScore(p).score < 80).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-black/40 border-white/10 text-white"
        />
      </div>

      {/* Pages Table */}
      <Card className="bg-black/40 border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-white/50 text-sm font-medium">Page</th>
                  <th className="text-left p-4 text-white/50 text-sm font-medium">Title</th>
                  <th className="text-center p-4 text-white/50 text-sm font-medium">SEO Score</th>
                  <th className="text-center p-4 text-white/50 text-sm font-medium">OG</th>
                  <th className="text-center p-4 text-white/50 text-sm font-medium">Index</th>
                  <th className="text-left p-4 text-white/50 text-sm font-medium">Updated</th>
                  <th className="text-right p-4 text-white/50 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPages.map((page) => {
                  const { score } = calcSEOScore(page);
                  return (
                    <tr key={page.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <code className="text-[var(--theme-primary)] text-sm bg-[var(--theme-primary)]/10 px-2 py-0.5 rounded">{page.path}</code>
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm truncate max-w-[250px]">{page.title}</p>
                        <p className="text-white/40 text-xs truncate max-w-[250px] mt-0.5">{page.description.slice(0, 60)}...</p>
                      </td>
                      <td className="p-4 text-center"><ScoreBadge score={score} /></td>
                      <td className="p-4 text-center">
                        {page.ogTitle ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                      </td>
                      <td className="p-4 text-center">
                        {!page.noIndex ? <Badge className="bg-green-400/10 text-green-400 border-0 text-xs">Index</Badge> : <Badge className="bg-red-400/10 text-red-400 border-0 text-xs">No Index</Badge>}
                      </td>
                      <td className="p-4 text-white/40 text-sm">{page.lastUpdated}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(page)} className="text-[var(--theme-primary)] hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/10">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[var(--theme-surface)] border-white/10 text-white max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--theme-primary)]" />
              Edit SEO - {editingPage?.path}
            </DialogTitle>
          </DialogHeader>

          {editingPage && (
            <Tabs defaultValue="meta" className="space-y-4">
              <TabsList className="bg-black/40 border border-white/10">
                <TabsTrigger value="meta" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">Meta Tags</TabsTrigger>
                <TabsTrigger value="og" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">Open Graph</TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="meta" className="space-y-4">
                <div>
                  <Label className="text-white/70">Page Title <span className="text-white/30">({editingPage.title.length}/60)</span></Label>
                  <Input
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="bg-black/40 border-white/10 text-white mt-1"
                    maxLength={70}
                  />
                  {editingPage.title.length > 60 && <p className="text-yellow-400 text-xs mt-1">Title is longer than recommended 60 characters</p>}
                </div>
                <div>
                  <Label className="text-white/70">Meta Description <span className="text-white/30">({editingPage.description.length}/160)</span></Label>
                  <Textarea
                    value={editingPage.description}
                    onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                    className="bg-black/40 border-white/10 text-white mt-1"
                    rows={3}
                    maxLength={200}
                  />
                  {editingPage.description.length > 160 && <p className="text-yellow-400 text-xs mt-1">Description is longer than recommended 160 characters</p>}
                </div>
                <div>
                  <Label className="text-white/70">Keywords <span className="text-white/30">(comma separated)</span></Label>
                  <Input
                    value={editingPage.keywords}
                    onChange={(e) => setEditingPage({ ...editingPage, keywords: e.target.value })}
                    className="bg-black/40 border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white/70">Canonical URL</Label>
                  <Input
                    value={editingPage.canonical}
                    onChange={(e) => setEditingPage({ ...editingPage, canonical: e.target.value })}
                    className="bg-black/40 border-white/10 text-white mt-1"
                  />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingPage.noIndex} onChange={(e) => setEditingPage({ ...editingPage, noIndex: e.target.checked })} className="accent-[var(--theme-primary)]" />
                    <span className="text-white/70 text-sm">No Index</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingPage.noFollow} onChange={(e) => setEditingPage({ ...editingPage, noFollow: e.target.checked })} className="accent-[var(--theme-primary)]" />
                    <span className="text-white/70 text-sm">No Follow</span>
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="og" className="space-y-4">
                <div>
                  <Label className="text-white/70">OG Title</Label>
                  <Input
                    value={editingPage.ogTitle}
                    onChange={(e) => setEditingPage({ ...editingPage, ogTitle: e.target.value })}
                    className="bg-black/40 border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white/70">OG Description</Label>
                  <Textarea
                    value={editingPage.ogDescription}
                    onChange={(e) => setEditingPage({ ...editingPage, ogDescription: e.target.value })}
                    className="bg-black/40 border-white/10 text-white mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-white/70">OG Image URL</Label>
                  <Input
                    value={editingPage.ogImage}
                    onChange={(e) => setEditingPage({ ...editingPage, ogImage: e.target.value })}
                    className="bg-black/40 border-white/10 text-white mt-1"
                    placeholder="https://..."
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                {/* Google Preview */}
                <Card className="bg-white border-0">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-gray-500 text-xs flex items-center gap-1"><Search className="w-3 h-3" /> Google Search Preview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-700 text-lg hover:underline cursor-pointer">{editingPage.title || "Page Title"}</p>
                    <p className="text-green-700 text-sm">{editingPage.canonical || "https://vanirgroup.com" + editingPage.path}</p>
                    <p className="text-gray-600 text-sm mt-1">{editingPage.description || "No description provided"}</p>
                  </CardContent>
                </Card>

                {/* Social Media Preview */}
                <Card className="bg-[var(--theme-secondary)] border-white/10">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-white/50 text-xs flex items-center gap-1"><Share2 className="w-3 h-3" /> Social Media Preview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg overflow-hidden border border-white/10">
                      {editingPage.ogImage ? (
                        <img src={editingPage.ogImage} alt="OG" className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-black/40 flex items-center justify-center text-white/30 text-sm">No OG Image</div>
                      )}
                      <div className="p-3 bg-black/40">
                        <p className="text-white/40 text-xs uppercase">vanirgroup.com</p>
                        <p className="text-white font-medium text-sm mt-1">{editingPage.ogTitle || editingPage.title}</p>
                        <p className="text-white/50 text-xs mt-1">{editingPage.ogDescription || editingPage.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Score */}
                <Card className="bg-black/40 border-white/10">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-white/50 text-xs flex items-center gap-1"><Eye className="w-3 h-3" /> SEO Analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const { score, issues } = calcSEOScore(editingPage);
                      return (
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <ScoreBadge score={score} />
                            <span className="text-white/70 text-sm">{score >= 80 ? "Good" : score >= 60 ? "Needs improvement" : "Poor"}</span>
                          </div>
                          {issues.length > 0 ? (
                            <ul className="space-y-1">
                              {issues.map((issue, i) => (
                                <li key={i} className="text-yellow-400/80 text-sm flex items-center gap-2">
                                  <AlertTriangle className="w-3 h-3 shrink-0" /> {issue}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-green-400 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> All checks passed!</p>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-white/10 text-white/70">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]">
              {saving ? "Saving..." : <><Save className="w-4 h-4 mr-1" /> Save Changes</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
