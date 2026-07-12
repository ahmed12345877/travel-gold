/**
 * SEO Blog Article Generator for Tourism Companies
 */
import MarketingGenerator from "@/components/MarketingGenerator";
import { PenTool } from "lucide-react";

export default function BlogSEOGenerator() {
  return (
    <MarketingGenerator
      config={{
        type: "blog_seo",
        title: "SEO Blog Generator",
        subtitle: "Blog & SEO",
        icon: <PenTool className="w-5 h-5 text-[var(--theme-primary)]" />,
        platforms: [
          { value: "article", label: "Article" },
          { value: "listicle", label: "Listicle" },
          { value: "guide", label: "Travel Guide" },
          { value: "review", label: "Review" },
          { value: "comparison", label: "Comparison" },
          { value: "how_to", label: "How-To" },
        ],
        tones: [
          { value: "informative", label: "Informative" },
          { value: "engaging", label: "Engaging" },
          { value: "professional", label: "Professional" },
          { value: "storytelling", label: "Storytelling" },
          { value: "persuasive", label: "Persuasive" },
          { value: "educational", label: "Educational" },
        ],
        placeholderPrompt: "e.g., Write an SEO article about the top 10 hidden gems in Egypt for adventurous travelers...",
        promptHints: [
          "Top 10 hidden gems in Egypt",
          "Best time to visit Luxor",
          "Ultimate Red Sea diving guide",
          "Egyptian cuisine food guide",
          "Budget travel tips for Egypt",
          "Ancient Egyptian temples guide",
        ],
      }}
    />
  );
}
