import {
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

interface SocialMediaSharingProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
}

export default function SocialMediaSharing({
  title,
  description = "",
  url = typeof window !== "undefined" ? window.location.href : "",
  imageUrl = "",
}: SocialMediaSharingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  };

  const openShare = (link: string) => {
    window.open(link, "_blank", "width=600,height=400");
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-[var(--card)] rounded-lg border border-[var(--theme-primary)]/20">
      <span className="text-sm font-medium text-white/70">مشاركة:</span>

      {/* Facebook */}
      <button
        onClick={() => openShare(shareLinks.facebook)}
        className="p-2 rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-colors"
        title="مشاركة على Facebook"
      >
        <Facebook size={18} className="text-[#1877F2]" />
      </button>

      {/* Twitter */}
      <button
        onClick={() => openShare(shareLinks.twitter)}
        className="p-2 rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors"
        title="مشاركة على Twitter"
      >
        <Twitter size={18} className="text-[#1DA1F2]" />
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => openShare(shareLinks.linkedin)}
        className="p-2 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 transition-colors"
        title="مشاركة على LinkedIn"
      >
        <Linkedin size={18} className="text-[#0A66C2]" />
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => openShare(shareLinks.whatsapp)}
        className="p-2 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors"
        title="مشاركة على WhatsApp"
      >
        <MessageCircle size={18} className="text-[#25D366]" />
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="p-2 rounded-lg bg-[var(--theme-primary)]/10 hover:bg-[var(--theme-primary)]/20 transition-colors"
        title="نسخ الرابط"
      >
        {copied ? (
          <Check size={18} className="text-[var(--theme-primary)]" />
        ) : (
          <Copy size={18} className="text-[var(--theme-primary)]" />
        )}
      </button>
    </div>
  );
}
