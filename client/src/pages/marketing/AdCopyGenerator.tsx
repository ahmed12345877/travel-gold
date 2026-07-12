/**
 * Ad Copy Creator for Tourism Companies
 */
import MarketingGenerator from "@/components/MarketingGenerator";
import { Megaphone } from "lucide-react";

export default function AdCopyGenerator() {
  return (
    <MarketingGenerator
      config={{
        type: "ad_copy",
        title: "Ad Copy Creator",
        subtitle: "Advertising",
        icon: <Megaphone className="w-5 h-5 text-[var(--theme-primary)]" />,
        platforms: [
          { value: "google_ads", label: "Google Ads" },
          { value: "facebook_ads", label: "Facebook Ads" },
          { value: "instagram_ads", label: "Instagram Ads" },
          { value: "display", label: "Display Ads" },
          { value: "youtube", label: "YouTube Ads" },
        ],
        tones: [
          { value: "persuasive", label: "Persuasive" },
          { value: "urgent", label: "Urgent (FOMO)" },
          { value: "luxurious", label: "Luxurious" },
          { value: "adventurous", label: "Adventurous" },
          { value: "value", label: "Value-Focused" },
          { value: "emotional", label: "Emotional" },
        ],
        placeholderPrompt: "e.g., Create Google Ads copy for our luxury Egypt tour package targeting US travelers...",
        promptHints: [
          "Luxury Egypt tour for US market",
          "Last-minute Red Sea deals",
          "Nile cruise retargeting ad",
          "Family vacation Egypt promo",
          "Honeymoon package display ad",
          "Adventure travel YouTube ad",
        ],
      }}
    />
  );
}
