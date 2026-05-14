/**
 * Social Media Content Generator for Tourism Companies
 */
import MarketingGenerator from "@/components/MarketingGenerator";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

export default function SocialMediaGenerator() {
  return (
    <MarketingGenerator
      config={{
        type: "social_media",
        title: "Social Media Generator",
        subtitle: "Social Media",
        icon: <Instagram className="w-5 h-5 text-[var(--theme-primary)]" />,
        platforms: [
          { value: "instagram", label: "Instagram" },
          { value: "facebook", label: "Facebook" },
          { value: "twitter", label: "Twitter/X" },
          { value: "linkedin", label: "LinkedIn" },
          { value: "tiktok", label: "TikTok" },
        ],
        placeholderPrompt: "e.g., Create a post promoting our luxury Nile cruise package for couples...",
        promptHints: [
          "Luxury Nile cruise promo",
          "Pyramids sunrise experience",
          "Red Sea diving adventure",
          "Cairo food tour highlight",
          "Desert safari sunset",
          "Ancient temples discovery",
        ],
      }}
    />
  );
}
