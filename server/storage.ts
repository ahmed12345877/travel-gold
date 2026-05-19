import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Storage] ERROR: SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
// اسم الحاوية (Bucket) التي قمت بإنشائها في حسابك
const BUCKET_NAME = "media";

/**
 * دالة رفع الملفات إلى Supabase Storage السحابي وتوليد رابط مباشر وصحيح
 */
export async function storagePut(
  fileKey: string,
  buffer: Buffer,
  contentType: string
): Promise<{ url: string }> {
  try {
    console.log(`[Storage] Uploading file to Supabase: ${fileKey}`);

    // رفع الملف كمصفوفة بايتات مع تحديد نوع الـ MimeType للصور
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileKey, buffer, {
        contentType: contentType,
        upsert: true, // استبدال الملف إذا كان موجوداً بنفس الاسم
      });

    if (error) {
      throw error;
    }

    // جلب الرابط العام المباشر للصورة المرفوعة
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileKey);

    console.log(`[Storage] Upload successful! Public URL: ${publicUrlData.publicUrl}`);

    return { url: publicUrlData.publicUrl };
  } catch (error) {
    console.error("[Storage] Upload failed:", error);
    throw new Error(`فشل رفع الملف إلى السيرفر: ${String(error)}`);
  }
}
