import React from "react";

type SkeletonVariant = "hero" | "gallery" | "cards" | "dashboard" | "form" | "ai-studio";

interface PageLoadingSkeletonProps {
  /** The variant of skeleton to display */
  variant?: SkeletonVariant;
  /** Whether to use gold shimmer (VANIR brand) */
  goldShimmer?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * PageLoadingSkeleton - Brand-consistent loading skeletons for page transitions
 * Uses VANIR gold (#D4A853) shimmer effect for brand consistency
 */
export default function PageLoadingSkeleton({
  variant = "hero",
  goldShimmer = true,
  className = "",
}: PageLoadingSkeletonProps) {
  const shimmerClass = goldShimmer
    ? "bg-gradient-to-r from-[#1a1a2e] via-[var(--theme-primary)]/5 to-[#1a1a2e]"
    : "bg-gradient-to-r from-[#1a1a2e] via-white/5 to-[#1a1a2e]";

  const pulseBar = (w: string, h: string = "h-4", delay: string = "0ms") => (
    <div
      className={`${w} ${h} rounded bg-[var(--card)] overflow-hidden`}
      style={{ animationDelay: delay }}
    >
      <div
        className={`w-full h-full ${shimmerClass} animate-pulse`}
        style={{
          backgroundSize: "200% 100%",
          animation: "shimmer-slide 2s ease-in-out infinite",
          animationDelay: delay,
        }}
      />
    </div>
  );

  const skeletonCard = (index: number) => (
    <div
      key={index}
      className="rounded-xl overflow-hidden bg-[var(--theme-surface)] border border-[var(--theme-primary)]/10"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="aspect-video bg-[var(--card)] relative overflow-hidden">
        <div
          className={`absolute inset-0 ${shimmerClass}`}
          style={{
            backgroundSize: "200% 100%",
            animation: "shimmer-slide 2s ease-in-out infinite",
            animationDelay: `${index * 150}ms`,
          }}
        />
      </div>
      <div className="p-4 space-y-3">
        {pulseBar("w-3/4", "h-4", `${index * 100}ms`)}
        {pulseBar("w-1/2", "h-3", `${index * 100 + 50}ms`)}
      </div>
    </div>
  );

  switch (variant) {
    case "hero":
      return (
        <div className={`min-h-screen bg-[var(--theme-background)] ${className}`}>
          {/* Navbar skeleton */}
          <div className="h-16 bg-[var(--theme-surface)]/80 border-b border-[var(--theme-primary)]/10 flex items-center px-6">
            <div className="w-10 h-10 rounded bg-[var(--card)] animate-pulse" />
            <div className="flex gap-6 ml-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-16 h-3 rounded bg-[var(--card)] animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
          {/* Hero skeleton */}
          <div className="relative h-[70vh] bg-[var(--theme-surface)] overflow-hidden">
            <div
              className={`absolute inset-0 ${shimmerClass}`}
              style={{
                backgroundSize: "200% 100%",
                animation: "shimmer-slide 3s ease-in-out infinite",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-start justify-center px-12 space-y-6">
              {pulseBar("w-48", "h-3")}
              {pulseBar("w-96", "h-12", "100ms")}
              {pulseBar("w-80", "h-12", "200ms")}
              {pulseBar("w-72", "h-4", "300ms")}
              <div className="flex gap-4 mt-4">
                <div className="w-40 h-12 rounded-lg bg-[var(--theme-primary)]/10 animate-pulse" style={{ animationDelay: "400ms" }} />
                <div className="w-40 h-12 rounded-lg bg-[var(--card)] animate-pulse" style={{ animationDelay: "500ms" }} />
              </div>
            </div>
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className={`min-h-screen bg-[var(--theme-background)] p-8 ${className}`}>
          {/* Filter bar skeleton */}
          <div className="flex gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-24 h-9 rounded-full bg-[var(--card)] animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          {/* Gallery grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-[var(--theme-surface)]">
                <div
                  className={`${i % 3 === 0 ? "aspect-[3/4]" : i % 3 === 1 ? "aspect-square" : "aspect-video"} bg-[var(--card)] relative overflow-hidden`}
                >
                  <div
                    className={`absolute inset-0 ${shimmerClass}`}
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "shimmer-slide 2s ease-in-out infinite",
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[var(--theme-primary)]/15 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDelay: `${i * 100}ms` }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {pulseBar("w-2/3", "h-3", `${i * 100}ms`)}
                  {pulseBar("w-1/3", "h-2", `${i * 100 + 50}ms`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "cards":
      return (
        <div className={`min-h-screen bg-[var(--theme-background)] p-8 ${className}`}>
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 space-y-3">
              {pulseBar("w-64", "h-8")}
              {pulseBar("w-96", "h-4", "100ms")}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => skeletonCard(i))}
            </div>
          </div>
        </div>
      );

    case "dashboard":
      return (
        <div className={`min-h-screen bg-[var(--theme-background)] p-8 ${className}`}>
          <div className="max-w-7xl mx-auto">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-primary)]/10 space-y-3">
                  {pulseBar("w-8", "h-8", `${i * 80}ms`)}
                  {pulseBar("w-16", "h-6", `${i * 80 + 40}ms`)}
                  {pulseBar("w-24", "h-3", `${i * 80 + 80}ms`)}
                </div>
              ))}
            </div>
            {/* Chart area */}
            <div className="rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-primary)]/10 p-6 mb-8">
              {pulseBar("w-48", "h-5")}
              <div className="mt-4 h-64 bg-[var(--card)] rounded-lg relative overflow-hidden">
                <div
                  className={`absolute inset-0 ${shimmerClass}`}
                  style={{
                    backgroundSize: "200% 100%",
                    animation: "shimmer-slide 2.5s ease-in-out infinite",
                  }}
                />
              </div>
            </div>
            {/* Table skeleton */}
            <div className="rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-primary)]/10 p-6">
              {pulseBar("w-32", "h-5")}
              <div className="mt-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 items-center py-3 border-b border-[var(--theme-primary)]/5">
                    <div className="w-10 h-10 rounded-full bg-[var(--card)] animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
                    {pulseBar("w-32", "h-3", `${i * 60}ms`)}
                    {pulseBar("w-24", "h-3", `${i * 60 + 30}ms`)}
                    {pulseBar("w-16", "h-3", `${i * 60 + 60}ms`)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case "ai-studio":
      return (
        <div className={`min-h-screen bg-[var(--theme-background)] flex ${className}`}>
          {/* Sidebar skeleton */}
          <div className="w-16 bg-[var(--theme-surface)] border-r border-[var(--theme-primary)]/10 flex flex-col items-center py-4 gap-4">
            <div className="w-8 h-8 rounded bg-[var(--card)] animate-pulse" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-8 h-8 rounded bg-[var(--card)] animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          {/* Main content */}
          <div className="flex-1 p-8">
            {/* Hero area */}
            <div className="h-[40vh] rounded-2xl bg-[var(--theme-surface)] relative overflow-hidden mb-8">
              <div
                className={`absolute inset-0 ${shimmerClass}`}
                style={{
                  backgroundSize: "200% 100%",
                  animation: "shimmer-slide 3s ease-in-out infinite",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                {pulseBar("w-72", "h-10")}
                <div className="w-[500px] h-12 rounded-full bg-[var(--card)] animate-pulse" style={{ animationDelay: "200ms" }} />
              </div>
            </div>
            {/* Service icons */}
            <div className="flex justify-center gap-8 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl bg-[var(--card)] animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  {pulseBar("w-14", "h-2", `${i * 100 + 50}ms`)}
                </div>
              ))}
            </div>
            {/* Featured grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg bg-[var(--card)] relative overflow-hidden">
                  <div
                    className={`absolute inset-0 ${shimmerClass}`}
                    style={{
                      backgroundSize: "200% 100%",
                      animation: "shimmer-slide 2s ease-in-out infinite",
                      animationDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "form":
      return (
        <div className={`min-h-screen bg-[var(--theme-background)] p-8 ${className}`}>
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 space-y-3">
              {pulseBar("w-48", "h-8")}
              {pulseBar("w-72", "h-4", "100ms")}
            </div>
            <div className="space-y-6 p-8 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-primary)]/10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  {pulseBar("w-24", "h-3", `${i * 80}ms`)}
                  <div className="w-full h-11 rounded-lg bg-[var(--card)] animate-pulse" style={{ animationDelay: `${i * 80 + 40}ms` }} />
                </div>
              ))}
              <div className="space-y-2">
                {pulseBar("w-24", "h-3", "400ms")}
                <div className="w-full h-28 rounded-lg bg-[var(--card)] animate-pulse" style={{ animationDelay: "440ms" }} />
              </div>
              <div className="w-full h-12 rounded-lg bg-[var(--theme-primary)]/10 animate-pulse" style={{ animationDelay: "500ms" }} />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
