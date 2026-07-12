import { useState } from 'react';
import { FileUploadComponent } from '@/components/FileUploadComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * مثال عملي على استخدام مكون الرفع
 * يظهر جميع الحالات والاستخدامات المختلفة
 */
export function FileUploadExamples() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; name: string }>>([]);

  // معالج النجاح للصورة الشخصية
  const handleProfileImageUpload = (url: string, filename: string) => {
    setProfileImage(url);
    console.log('[Profile] تم رفع صورة الملف الشخصي:', { url, filename });
  };

  // معالج النجاح للمستندات
  const handleDocumentUpload = (url: string, filename: string) => {
    setDocumentUrl(url);
    console.log('[Document] تم رفع المستند:', { url, filename });
  };

  // معالج النجاح لصور المعرض
  const handleGalleryImageUpload = (url: string, filename: string) => {
    setGalleryImages([...galleryImages, { url, name: filename }]);
    console.log('[Gallery] تم إضافة صورة للمعرض:', { url, filename });
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">أمثلة رفع الملفات</h1>
          <p className="text-gray-600">
            جميع الأمثلة تستخدم النظام المدمج بالمشروع
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">صورة الملف الشخصي</TabsTrigger>
            <TabsTrigger value="document">المستندات</TabsTrigger>
            <TabsTrigger value="gallery">المعرض</TabsTrigger>
          </TabsList>

          {/* Tab 1: Profile Image */}
          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">رفع صورة الملف الشخصي</h2>
              <p className="text-gray-600 text-sm mb-6">
                ارفع صورة شخصية بصيغة JPG أو PNG (الحد الأقصى 5 ميجابايت)
              </p>
            </div>

            <FileUploadComponent
              purpose="profile-picture"
              maxSizeMB={5}
              acceptedFileTypes="image/jpeg,image/png,image/webp"
              onUploadSuccess={handleProfileImageUpload}
            />

            {profileImage && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold">معاينة الصورة المرفوعة:</h3>
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                <div className="bg-gray-100 p-3 rounded text-xs break-all">
                  <p className="text-gray-600 mb-1">الرابط:</p>
                  <p className="font-mono text-blue-600">{profileImage}</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Documents */}
          <TabsContent value="document" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">رفع المستندات</h2>
              <p className="text-gray-600 text-sm mb-6">
                ارفع مستندات بصيغ مختلفة (PDF, Word, Excel إلخ) بحد أقصى 10 ميجابايت
              </p>
            </div>

            <FileUploadComponent
              purpose="document"
              maxSizeMB={10}
              acceptedFileTypes=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onUploadSuccess={handleDocumentUpload}
            />

            {documentUrl && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold">المستند المرفوع:</h3>
                <div className="bg-gray-100 p-4 rounded">
                  <p className="text-gray-600 text-sm mb-2">رابط التحميل:</p>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all text-sm"
                  >
                    {documentUrl}
                  </a>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Gallery */}
          <TabsContent value="gallery" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">معرض الصور</h2>
              <p className="text-gray-600 text-sm mb-6">
                أضف عدة صور للمعرض (JPG, PNG, WebP بحد أقصى 8 ميجابايت لكل صورة)
              </p>
            </div>

            <FileUploadComponent
              purpose="gallery"
              maxSizeMB={8}
              acceptedFileTypes="image/*"
              onUploadSuccess={handleGalleryImageUpload}
            />

            {galleryImages.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">
                  الصور المضافة ({galleryImages.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div key={idx} className="space-y-2">
                      <img
                        src={img.url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                      />
                      <p className="text-xs text-gray-600 truncate">{img.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">معلومات تقنية</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ جميع الملفات مشفرة وآمنة</li>
            <li>✓ التخزين الأساسي: Firebase Storage</li>
            <li>✓ النسخ الاحتياطي: التخزين المحلي</li>
            <li>✓ الملفات متوفرة للتحميل الفوري</li>
            <li>✓ الحد الأقصى العام: 10 ميجابايت</li>
            <li>✓ محمي بـ Authentication</li>
          </ul>
        </div>

        {/* API Integration Example */}
        <div className="bg-gray-900 rounded-lg p-6 text-gray-100">
          <h3 className="font-semibold mb-3">مثال التكامل مع قاعدة البيانات:</h3>
          <pre className="text-xs overflow-x-auto bg-black p-4 rounded">
            {`// بعد الرفع الناجح
await db.profiles.update({
  where: { userId: user.id },
  data: {
    profileImageUrl: url,
    profileImageName: filename,
    updatedAt: new Date()
  }
});

// أو حفظ المرجع في جدول منفصل
await db.fileUploads.create({
  data: {
    userId: user.id,
    url,
    filename,
    purpose: 'profile-picture',
    fileSize: file.size,
    mimeType: file.type
  }
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default FileUploadExamples;
