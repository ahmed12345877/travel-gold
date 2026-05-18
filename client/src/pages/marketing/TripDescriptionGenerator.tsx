/**
 * Trip Description Writer for Tourism Companies
 */
import MarketingGenerator from "@/components/MarketingGenerator";
import { FileText } from "lucide-react";

export default function TripDescriptionGenerator() {
  return (
    <MarketingGenerator
      config={{
        type: "trip_description",
        title: "Trip Description Writer",
        subtitle: "Trip Descriptions",
        icon: <FileText className="w-5 h-5 text-[var(--theme-primary)]" />,
        platforms: [
          { value: "website", label: "Website" },
          { value: "brochure", label: "Brochure" },
          { value: "catalog", label: "Catalog" },
          { value: "booking_page", label: "Booking Page" },
        ],
        tones: [
          { value: "luxurious", label: "Luxurious" },
          { value: "adventurous", label: "Adventurous" },
          { value: "romantic", label: "Romantic" },
          { value: "cultural", label: "Cultural & Historical" },
          { value: "family", label: "Family-Friendly" },
          { value: "budget", label: "Budget-Friendly" },
        ],
        placeholderPrompt:
          "e.g., Write a vivid description for a 7-day luxury Nile cruise from Luxor to Aswan...",
        promptHints: [
          "7-day luxury Nile cruise",
          "Cairo & Pyramids day tour",
          "Red Sea diving package",
          "Desert safari adventure",
          "Ancient Egypt cultural tour",
          "Honeymoon in Sharm El Sheikh",
        ],
      }}
    />
  );
}
