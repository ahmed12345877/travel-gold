import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Save, AlertCircle, Loader2, User, Link2, X, Eye } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface OwnerProfile {
  name: string;
  title: string;
  bio: string;
  profileImage: string;
  backgroundImage: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

export default function ProfileAdmin() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  const [profileData, setProfileData] = useState<OwnerProfile>({
    name: "Ahmed Roshdi",
    title: "Founder & CEO",
    bio: "",
    profileImage: "",
    backgroundImage: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      email: "",
    },
  });

  // Fetch from DB
  const { data: savedProfile, isLoading: isLoadingProfile } = trpc.siteSettings.get.useQuery(
    { category: "owner", key: "profile" },
    { staleTime: 30000 }
  );

  const setMut = trpc.siteSettings.set.useMutation();
  const uploadImageMut = trpc.gallery.uploadImage.useMutation();

  useEffect(() => {
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfileData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse profile data:", e);
      }
    }
  }, [savedProfile]);

  // Upload media to Firebase
  const uploadMedia = async (file: File): Promise<string> => {
    if (file.size > MAX_FILE_SIZE) throw new Error("حجم الملف يتجاوز 10MB");
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const base64 = dataUrl.split(",")[1];
    const { url } = await uploadImageMut.mutateAsync({
      fileData: base64,
      filename: file.name,
      mimeType: file.type,
    });
    return url;
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProfile(true);
    try {
      const url = await uploadMedia(file);
      setProfileData(prev => ({ ...prev, profileImage: url }));
      setHasChanges(true);
      toast.success("تم رفع صورة الملف الشخصي بنجاح");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBackground(true);
    try {
      const url = await uploadMedia(file);
      setProfileData(prev => ({ ...prev, backgroundImage: url }));
      setHasChanges(true);
      toast.success("تم رفع صورة الخلفية بنجاح");
    } catch (err: unknown) {
      toast.error(`فشل الرفع: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploadingBackground(false);
    }
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await setMut.mutateAsync({
        category: "owner",
        key: "profile",
        value: JSON.stringify(profileData),
      });
      setHasChanges(false);
      toast.success("تم حفظ بيانات المالك بنجاح");
    } catch (err) {
      toast.error("فشل الحفظ في قاعدة البيانات");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [profileData, setMut]);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[var(--theme-primary)]" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="text-[var(--theme-primary)]" size={24} />
            إدارة ملف المالك
          </h1>
          <p className="text-white/50 text-sm mt-1">إدارة بيانات وصور أحمد روشدي المالك مع الروابط الاجتماعية</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && <div className="flex items-center gap-2 text-yellow-400"><AlertCircle size={16} /><span className="text-sm">تغييرات غير محفوظة</span></div>}
          <Button onClick={handleSave} disabled={saving || !hasChanges} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-primary-light)] font-semibold">
            {saving ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Save size={16} className="ml-2" />}
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="profile" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <User className="w-4 h-4 ml-1" /> الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]">
            <Link2 className="w-4 h-4 ml-1" /> الروابط الاجتماعية
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4 bg-[var(--theme-surface)] border border-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white">معلومات المالك</h3>

              {/* Name */}
              <div>
                <Label className="text-white/70 text-sm">الاسم الكامل</Label>
                <Input
                  value={profileData.name}
                  onChange={(e) => {
                    setProfileData(prev => ({ ...prev, name: e.target.value }));
                    setHasChanges(true);
                  }}
                  className="bg-[#1a1a1a] border-white/10 text-white mt-1"
                  placeholder="Ahmed Roshdi"
                />
              </div>

              {/* Title */}
              <div>
                <Label className="text-white/70 text-sm">المسمى الوظيفي</Label>
                <Input
                  value={profileData.title}
                  onChange={(e) => {
                    setProfileData(prev => ({ ...prev, title: e.target.value }));
                    setHasChanges(true);
                  }}
                  className="bg-[#1a1a1a] border-white/10 text-white mt-1"
                  placeholder="Founder & CEO"
                />
              </div>

              {/* Bio */}
              <div>
                <Label className="text-white/70 text-sm">النبذة التعريفية</Label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => {
                    setProfileData(prev => ({ ...prev, bio: e.target.value }));
                    setHasChanges(true);
                  }}
                  className="bg-[#1a1a1a] border-white/10 text-white mt-1"
                  placeholder="أكتب نبذة عن المالك..."
                  rows={4}
                />
              </div>

              {/* Images Section */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <h4 className="text-sm font-semibold text-white mb-4">الصور</h4>

                {/* Profile Image */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--theme-primary)]">صورة الملف الشخصي</span>
                    {profileData.profileImage && (
                      <img src={profileData.profileImage} alt="" className="w-12 h-12 object-cover rounded-full border-2 border-[var(--theme-primary)]/20" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    onChange={handleProfileImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                    disabled={uploadingProfile}
                  />
                  <label htmlFor="profile-image-upload" className={`flex items-center gap-2 px-3 py-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 rounded-lg cursor-pointer hover:bg-[var(--theme-primary)]/20 transition-colors text-sm w-fit ${uploadingProfile ? "opacity-60 cursor-not-allowed" : ""}`}>
                    {uploadingProfile ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingProfile ? "جاري الرفع..." : profileData.profileImage ? "تغيير الصورة" : "رفع صورة"}
                  </label>
                  {profileData.profileImage && (
                    <button onClick={() => { setProfileData(prev => ({ ...prev, profileImage: "" })); setHasChanges(true); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <X size={12} /> إزالة
                    </button>
                  )}
                </div>

                {/* Background Image */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--theme-primary)]">صورة الخلفية</span>
                    {profileData.backgroundImage && (
                      <img src={profileData.backgroundImage} alt="" className="w-16 h-10 object-cover rounded border-2 border-[var(--theme-primary)]/20" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    onChange={handleBackgroundImageUpload}
                    className="hidden"
                    id="background-image-upload"
                    disabled={uploadingBackground}
                  />
                  <label htmlFor="background-image-upload" className={`flex items-center gap-2 px-3 py-2 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border border-[var(--theme-primary)]/20 rounded-lg cursor-pointer hover:bg-[var(--theme-primary)]/20 transition-colors text-sm w-fit ${uploadingBackground ? "opacity-60 cursor-not-allowed" : ""}`}>
                    {uploadingBackground ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingBackground ? "جاري الرفع..." : profileData.backgroundImage ? "تغيير الصورة" : "رفع صورة"}
                  </label>
                  {profileData.backgroundImage && (
                    <button onClick={() => { setProfileData(prev => ({ ...prev, backgroundImage: "" })); setHasChanges(true); }} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                      <X size={12} /> إزالة
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-[var(--theme-surface)] border border-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Eye className="text-[var(--theme-primary)]" size={20} /> معاينة</h3>
              <div className="space-y-4">
                {/* Background */}
                {profileData.backgroundImage && (
                  <div className="relative h-24 rounded-lg overflow-hidden border border-white/10">
                    <img src={profileData.backgroundImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Profile Section */}
                <div className="flex flex-col items-center text-center">
                  {profileData.profileImage && (
                    <img src={profileData.profileImage} alt="" className="w-20 h-20 object-cover rounded-full border-4 border-[var(--theme-primary)] mb-3" />
                  )}
                  <h4 className="text-lg font-bold text-white">{profileData.name}</h4>
                  <p className="text-sm text-[var(--theme-primary)] mb-2">{profileData.title}</p>
                  {profileData.bio && (
                    <p className="text-xs text-white/60 leading-relaxed">{profileData.bio.substring(0, 80)}...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">الروابط الاجتماعية</CardTitle>
              <CardDescription className="text-white/50">أضف روابط وسائل التواصل الاجتماعي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
                { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
                { key: "twitter", label: "Twitter/X", placeholder: "https://twitter.com/..." },
                { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/..." },
                { key: "email", label: "البريد الإلكتروني", placeholder: "email@example.com" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label className="text-white/70 text-sm">{label}</Label>
                  <Input
                    value={profileData.socialLinks[key as keyof typeof profileData.socialLinks] || ""}
                    onChange={(e) => {
                      setProfileData(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, [key]: e.target.value }
                      }));
                      setHasChanges(true);
                    }}
                    className="bg-[#1a1a1a] border-white/10 text-white mt-1"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
