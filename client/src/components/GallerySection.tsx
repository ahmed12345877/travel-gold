import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { GalleryImage, GalleryCategory } from "@/types/gallery";
import { getGalleryErrorMessage } from "@/lib/errorUtils";
import { applyLuxuryImageFallback } from "@/lib/imageFallback";

const UNSPLASH_GALLERY_FALLBACKS: GalleryImage[] = [
  {
    id: "fallback-luxury-resort-interior",
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1800&q=80",
    category: "luxury",
    title: "Luxury Resort Interior",
    description: "Curated fallback visual",
    featured: "yes",
  },
  {
    id: "fallback-private-yacht-deck",
    imageUrl: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1800&q=80",
    category: "adventure",
    title: "Private Yacht Deck",
    description: "Curated fallback visual",
    featured: "no",
  },
  {
    id: "fallback-spa-retreat",
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1800&q=80",
    category: "luxury",
    title: "Spa Retreat",
    description: "Curated fallback visual",
    featured: "no",
  },
  {
    id: "fallback-fine-dining-ambiance",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80",
    category: "cuisine",
    title: "Fine Dining Ambiance",
    description: "Curated fallback visual",
    featured: "yes",
  },
];

export default function GallerySection() {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | "all">("all");
  const [layoutMode, setLayoutMode] = useState<"dynamic-grid" | "masonry" | "swiper-carousel" | "grid-lightbox" | "isotope-filter">("dynamic-grid");
  const [forcedAspect, setForcedAspect] = useState<"square" | "landscape" | "portrait" | "original">("original");

  // Fetch gallery items from server (uses permanent Firebase URLs)
  const { data: images = [], isLoading, error } = trpc.gallery.listVisible.useQuery(
    undefined,
    { 
      staleTime: 10 * 60 * 1000,
      enabled: true,
    }
  );
  const { data: mediaDisplaySettings } = trpc.siteSettings.get.useQuery(
    { category: "media", key: "gallery_display" },
    { staleTime: 30000 }
  );

  useEffect(() => {
    if (!mediaDisplaySettings) return;
    try {
      const parsed = JSON.parse(mediaDisplaySettings);
      if (parsed.layout) setLayoutMode(parsed.layout);
      if (parsed.aspectRatio) setForcedAspect(parsed.aspectRatio);
    } catch {
      // ignore malformed display setting
    }
  }, [mediaDisplaySettings]);

  // Debug: Log images when they load
  useEffect(() => {
    if (images.length > 0) {
      console.log("[GallerySection] Images loaded successfully:", images.length);
      images.forEach((img: any) => {
        console.log("[GallerySection] Image URL:", {
          title: img.title,
          url: img.imageUrl,
          category: img.category,
          featured: img.featured,
        });
      });
    }
  }, [images]);

  // Handle errors safely
  useEffect(() => {
    if (error) {
      console.error("[GallerySection] Error loading gallery:", error);
      const safeMessage = getGalleryErrorMessage(error);
      toast.error(safeMessage);
    }
  }, [error]);

  const normalizedImages = useMemo(() => {
    return (images as any[])
      .map((img, index) => ({
        ...img,
        id: String(img.id ?? img._docId ?? img.imageUrl ?? img.title ?? `gallery-item-${index}`),
        imageUrl: img.imageUrl ?? img.url ?? "",
      }))
      .filter((img) => Boolean(img.imageUrl));
  }, [images]);

  const effectiveImages = normalizedImages.length > 0 ? normalizedImages : UNSPLASH_GALLERY_FALLBACKS;

  // Filter images by category
  const filteredImages = selectedCategory === "all"
    ? effectiveImages
    : effectiveImages.filter((img) => img.category === selectedCategory);

  // Get unique categories
  const categories: (GalleryCategory | "all")[] = ["all", ...Array.from(
    new Set(effectiveImages.map((img) => img.category))
  )];

  const categories_display: Record<string, string> = {
    "all": "All",
    "luxury": "Luxury",
    "safari": "Safari",
    "beach": "Beach",
    "cuisine": "Cuisine",
    "culture": "Culture",
    "adventure": "Adventure",
  };

  return (
    <section id="gallery" className="py-12 sm:py-16 md:py-24 bg-[var(--theme-background)]" ref={ref}>
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
            Photo Gallery
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Capture the Moments of Your Journey
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-12"
            role="tablist"
            aria-label="Filter photos by category"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--theme-surface)] ${
                    isSelected
                      ? "bg-[var(--theme-primary)] text-[var(--theme-surface)]"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {categories_display[cat as keyof typeof categories_display] || cat}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-white/60">Loading gallery...</p>
          </div>
        )}

        {/* Error/Recovery State */}
        {error && (
          <div className="text-center py-6 px-4 mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10">
            <p className="text-amber-200">Gallery feed is unavailable right now.</p>
            <p className="text-white/60 text-sm mt-2">
              {getGalleryErrorMessage(error)} — showing curated luxury visuals instead.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No photos available in this category</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && filteredImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={
              layoutMode === "masonry"
                ? "columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-5 md:gap-6 space-y-4"
                : layoutMode === "swiper-carousel"
                  ? "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
            }
          >
            {filteredImages.map((img, index) => {
              const aspectClass = forcedAspect === "square"
                ? "aspect-square"
                : forcedAspect === "landscape"
                  ? "aspect-video"
                  : forcedAspect === "portrait"
                    ? "aspect-[4/5]"
                    : "aspect-[4/3]";
              return (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.6) }}
                  className={`group relative bg-[var(--theme-surface)] border border-white/8 overflow-hidden cursor-pointer hover:border-[var(--theme-primary)]/40 transition-all duration-500 ${
                    layoutMode === "masonry" ? "break-inside-avoid mb-4" : ""
                  } ${layoutMode === "swiper-carousel" ? "snap-start min-w-[300px] sm:min-w-[340px]" : ""}`}
                >
                  {/* Image */}
                  <div className={`relative ${aspectClass} bg-black overflow-hidden`}>
                    <img
                      src={img.imageUrl}
                      alt={img.title || img.titleAr || img.description || img.descriptionAr || "Gallery photo from Vanir Travel"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        console.error("[GallerySection] Image failed to load:", {
                          url: img.imageUrl,
                          title: img.title,
                          id: img.id,
                        });
                        applyLuxuryImageFallback(e.currentTarget);
                      }}
                      loading="lazy"
                    />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/90 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Featured Badge */}
                  {img.featured === "yes" && (
                    <div 
                      className="absolute top-3 right-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] px-3 py-1 rounded-full text-xs font-bold"
                      aria-label="Featured photo"
                    >
                      Featured
                    </div>
                  )}

                  {/* Hover Info */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 text-center">
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {img.title || img.titleAr || "Photo"}
                    </h3>
                    {(img.location || img.locationAr) && (
                      <p className="text-white/70 text-sm mb-3">
                        {img.location || img.locationAr}
                      </p>
                    )}
                    {(img.description || img.descriptionAr) && (
                      <p className="text-white/60 text-xs line-clamp-2">
                        {img.description || img.descriptionAr}
                      </p>
                    )}
                  </div>
                </div>

                  {/* Title Bar */}
                  <div className="p-4">
                    <p className="text-white font-medium truncate">
                      {img.title || img.titleAr || "Photo"}
                    </p>
                    {img.category && (
                      <p className="text-white/40 text-xs mt-1">
                        {categories_display[img.category as keyof typeof categories_display] || img.category}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
