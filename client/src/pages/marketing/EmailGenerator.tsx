/**
 * Email Campaign Builder for Tourism Companies
 */
import MarketingGenerator from "@/components/MarketingGenerator";
import { Mail } from "lucide-react";

export default function EmailGenerator() {
  return (
    <MarketingGenerator
      config={{
        type: "email",
        title: "Email Campaign Builder",
        subtitle: "Email Marketing",
        icon: <Mail className="w-5 h-5 text-[var(--theme-primary)]" />,
        platforms: [
          { value: "welcome", label: "Welcome" },
          { value: "promotional", label: "Promo" },
          { value: "newsletter", label: "Newsletter" },
          { value: "follow_up", label: "Follow-up" },
          { value: "booking_confirm", label: "Booking" },
          { value: "seasonal", label: "Seasonal" },
        ],
        tones: [
          { value: "luxurious", label: "Luxurious" },
          { value: "professional", label: "Professional" },
          { value: "warm", label: "Warm & Friendly" },
          { value: "urgent", label: "Urgent (Limited Offer)" },
          { value: "informative", label: "Informative" },
          { value: "personal", label: "Personal Touch" },
        ],
        placeholderPrompt: "e.g., Create a promotional email for our early bird summer deals to Hurghada...",
        promptHints: [
          "Early bird summer deals",
          "Welcome new subscriber",
          "Abandoned booking follow-up",
          "Monthly travel newsletter",
          "Holiday season special",
          "Loyalty program rewards",
        ],
      }}
    />
  );
}
