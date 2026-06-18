import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { GalleryImage, GalleryCategory } from "@/types/gallery";
import { getGalleryErrorMessage } from "@/lib/errorUtils";

export default function GallerySection() {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | "all">("all");
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  // Fetch gallery items from server (uses permanent Firebase URLs)
  const { data: images = [], isLoading, error } = trpc.gallery.listVisible.useQuery<GalleryImage[]>(
    undefined,
    { 
      staleTime: 10 * 60 * 1000,
      enabled: true,
    }
  );

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

  // Filter images by category
  const filteredImages = selectedCategory === "all"
    ? images
    : images.filter((img) => img.category === selectedCategory);

  // Get unique categories
  const categories: (GalleryCategory | "all")[] = ["all", ...Array.from(
    new Set(images.map((img) => img.category))
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

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-400">Error Loading Gallery</p>
            <p className="text-white/40 text-sm mt-2">
              {getGalleryErrorMessage(error)}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredImages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No photos available in this category</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && !error && filteredImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
          >
            {filteredImages.map((img, index) => {
              const isBroken = brokenImages.has(img.id);
              return (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.6) }}
                  className="group relative bg-[var(--theme-surface)] border border-white/8 overflow-hidden cursor-pointer hover:border-[var(--theme-primary)]/40 transition-all duration-500"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-black overflow-hidden">
                    <img
                      src={isBroken ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3EImage Error%3C/text%3E%3C/svg%3E" : img.imageUrl}
                      alt={img.title || img.titleAr || img.description || img.descriptionAr || "Gallery photo from Vanir Travel"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        if (isBroken) return; // Prevent error loops
                        console.error("[GallerySection] Image failed to load:", {
                          url: img.imageUrl,
                          title: img.title,
                          id: img.id,
                        });
                        setBrokenImages(prev => new Set([...prev, img.id]));
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
