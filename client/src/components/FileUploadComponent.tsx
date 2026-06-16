import { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess?: (url: string, filename: string) => void;
  purpose?: string;
  maxSizeMB?: number;
  acceptedFileTypes?: string;
}

export function FileUploadComponent({
  onUploadSuccess,
  purpose = 'general',
  maxSizeMB = 10,
  acceptedFileTypes = 'image/*,.pdf,.doc,.docx'
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const maxBytes = maxSizeMB * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    if (file.size > maxBytes) {
      return `حجم الملف يتجاوز ${maxSizeMB} ميجابايت`;
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
      } else {
        setFile(selectedFile);
        setError(null);
        setSuccess(false);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const validationError = validateFile(droppedFile);
      if (validationError) {
        setError(validationError);
        setFile(null);
      } else {
        setFile(droppedFile);
        setError(null);
        setSuccess(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('الرجاء اختيار ملف أولاً');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // تحويل الملف إلى Base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binaryString = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binaryString += String.fromCharCode(bytes[i]);
      }
      const base64String = btoa(binaryString);

      // إرسال الطلب للـ API
      const response = await fetch('/api/trpc/uploads.upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: base64String,
          filename: file.name,
          mimeType: file.type,
          purpose,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل رفع الملف');
      }

      const data = await response.json();
      
      if (data.result?.url) {
        setUploadedUrl(data.result.url);
        setSuccess(true);
        setFile(null);
        
        if (onUploadSuccess) {
          onUploadSuccess(data.result.url, file.name);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الرفع');
      console.error('[FileUpload] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setUploadedUrl(null);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            type="file"
            id="file-input"
            onChange={handleFileSelect}
            disabled={loading}
            accept={acceptedFileTypes}
            className="hidden"
          />

          <label htmlFor="file-input" className="cursor-pointer block">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 font-medium">
              اسحب الملف هنا أو انقر للاختيار
            </p>
            <p className="text-sm text-gray-500 mt-1">
              الحد الأقصى: {maxSizeMB} ميجابايت
            </p>
          </label>
        </div>

        {/* File Preview */}
        {file && !success && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 break-all">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                disabled={loading}
                className="ml-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && uploadedUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-700">تم رفع الملف بنجاح!</p>
            </div>
            <div className="bg-white rounded p-3 border border-green-100">
              <p className="text-xs text-gray-600 mb-1">رابط الملف:</p>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 break-all"
              >
                {uploadedUrl}
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || loading || success}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              !file || loading || success
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'جاري الرفع...' : 'رفع الملف'}
          </button>

          {(file || success) && (
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              مسح
            </button>
          )}
        </div>

        {/* Info Text */}
        {success && (
          <p className="text-xs text-gray-500 text-center">
            يمكنك الآن استخدام الرابط أعلاه
          </p>
        )}
      </div>
    </div>
  );
}
