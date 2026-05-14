import React, { useState, useRef, useEffect, ImgHTMLAttributes } from "react";

type AnimationStyle = "fade" | "blur-up" | "scale" | "slide-up" | "none";

interface OptimizedImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "onLoad" | "onError"
> {
  /** The image source URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Optional blur placeholder color (default: dark gray) */
  placeholderColor?: string;
  /** Optional aspect ratio for container (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
  /** Whether to use native lazy loading (default: true) */
  lazy?: boolean;
  /** Additional container className */
  containerClassName?: string;
  /** Animation style on load (default: "blur-up") */
  animation?: AnimationStyle;
  /** Stagger delay in ms for grid animations (default: 0) */
  staggerDelay?: number;
  /** Whether to show gold shimmer placeholder (default: false) */
  goldShimmer?: boolean;
  /** Callback when image loads successfully */
  onImageLoad?: () => void;
  /** Callback when image fails to load */
  onImageError?: () => void;
}

/**
 * OptimizedImage - Performance-optimized image component with progressive loading
 *
 * Features:
 * - Native lazy loading (loading="lazy")
 * - Intersection Observer for advanced lazy loading
 * - Multiple animation styles: blur-up, fade, scale, slide-up
 * - Gold shimmer placeholder (VANIR brand)
 * - Stagger delay for grid animations
 * - Smooth progressive reveal on load
 * - Error state handling with fallback
 * - Aspect ratio container to prevent CLS
 * - decoding="async" for non-blocking decode
 */
export default function OptimizedImage({
  src,
  alt,
  placeholderColor = "#1a1a2e",
  aspectRatio,
  lazy = true,
  containerClassName = "",
  className = "",
  animation = "blur-up",
  staggerDelay = 0,
  goldShimmer = false,
  onImageLoad,
  onImageError,
  ...imgProps
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px 0px",
        threshold: 0.01,
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    // Apply stagger delay for grid animations
    if (staggerDelay > 0) {
      setTimeout(() => {
        setIsLoaded(true);
        setShowImage(true);
        onImageLoad?.();
      }, staggerDelay);
    } else {
      setIsLoaded(true);
      setShowImage(true);
      onImageLoad?.();
    }
  };

  const handleError = () => {
    setHasError(true);
    onImageError?.();
  };

  // Animation classes based on style
  const getAnimationClasses = () => {
    if (animation === "none") {
      return showImage ? "opacity-100" : "opacity-0";
    }

    const base = "transition-all ease-out";

    switch (animation) {
      case "blur-up":
        return `${base} duration-700 ${
          showImage
            ? "opacity-100 blur-0 scale-100"
            : "opacity-0 blur-sm scale-[1.02]"
        }`;
      case "scale":
        return `${base} duration-600 ${
          showImage ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`;
      case "slide-up":
        return `${base} duration-600 ${
          showImage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`;
      case "fade":
      default:
        return `${base} duration-500 ${
          showImage ? "opacity-100" : "opacity-0"
        }`;
    }
  };

  // Shimmer gradient based on brand
  const shimmerGradient = goldShimmer
    ? "from-transparent via-[var(--theme-primary)]/10 to-transparent"
    : "from-transparent via-white/5 to-transparent";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{
        backgroundColor: placeholderColor,
        aspectRatio: aspectRatio || undefined,
      }}
    >
      {/* Progressive shimmer placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: placeholderColor }}
        >
          {/* Skeleton pulse */}
          <div
            className="absolute inset-0 animate-pulse opacity-30"
            style={{
              background: goldShimmer
                ? "linear-gradient(135deg, rgba(212,168,83,0.1) 0%, rgba(212,168,83,0.05) 50%, rgba(212,168,83,0.1) 100%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 100%)",
            }}
          />
          {/* Sliding shimmer */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${shimmerGradient}`}
            style={{
              animation: "shimmer-slide 2s ease-in-out infinite",
              backgroundSize: "200% 100%",
            }}
          />
          {/* Center icon placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className={`w-6 h-6 ${goldShimmer ? "text-[var(--theme-primary)]/20" : "text-white/10"} animate-pulse`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card)]">
          <div className="text-center text-gray-500">
            <svg
              className="w-8 h-8 mx-auto mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Actual image with progressive reveal */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`${getAnimationClasses()} ${className}`}
          {...imgProps}
        />
      )}
    </div>
  );
}

/**
 * ImageGrid - Renders a grid of OptimizedImages with staggered loading
 */
export function ImageGrid({
  images,
  columns = 3,
  gap = "gap-4",
  animation = "blur-up",
  staggerInterval = 100,
  goldShimmer = false,
  aspectRatio,
  imageClassName = "",
  containerClassName = "",
  onImageClick,
}: {
  images: { src: string; alt: string; id?: string | number }[];
  columns?: 2 | 3 | 4 | 5;
  gap?: string;
  animation?: AnimationStyle;
  staggerInterval?: number;
  goldShimmer?: boolean;
  aspectRatio?: string;
  imageClassName?: string;
  containerClassName?: string;
  onImageClick?: (
    image: { src: string; alt: string; id?: string | number },
    index: number,
  ) => void;
}) {
  const colsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  }[columns];

  return (
    <div className={`grid ${colsClass} ${gap} ${containerClassName}`}>
      {images.map((image, index) => (
        <div
          key={image.id || index}
          className={`group cursor-pointer overflow-hidden rounded-lg ${
            onImageClick
              ? "hover:ring-2 hover:ring-[var(--theme-primary)]/50 transition-all duration-300"
              : ""
          }`}
          onClick={() => onImageClick?.(image, index)}
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            animation={animation}
            staggerDelay={index * staggerInterval}
            goldShimmer={goldShimmer}
            aspectRatio={aspectRatio || "4/3"}
            containerClassName="w-full"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            lazy={true}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * ImageSkeleton - Standalone skeleton placeholder for loading states
 */
export function ImageSkeleton({
  count = 1,
  columns = 3,
  gap = "gap-4",
  aspectRatio = "4/3",
  goldShimmer = false,
  containerClassName = "",
}: {
  count?: number;
  columns?: 2 | 3 | 4 | 5;
  gap?: string;
  aspectRatio?: string;
  goldShimmer?: boolean;
  containerClassName?: string;
}) {
  const colsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  }[columns];

  const shimmerBg = goldShimmer
    ? "from-[var(--theme-primary)]/5 via-[var(--theme-primary)]/10 to-[var(--theme-primary)]/5"
    : "from-white/3 via-white/5 to-white/3";

  return (
    <div className={`grid ${colsClass} ${gap} ${containerClassName}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-lg bg-[var(--card)]"
          style={{ aspectRatio }}
        >
          <div className="absolute inset-0 animate-pulse opacity-50">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${shimmerBg}`}
              style={{
                animation: `shimmer-slide 2s ease-in-out infinite`,
                animationDelay: `${i * 150}ms`,
                backgroundSize: "200% 100%",
              }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className={`w-8 h-8 ${goldShimmer ? "text-[var(--theme-primary)]/15" : "text-white/8"} animate-pulse`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
