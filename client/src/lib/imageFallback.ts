const LUXURY_PLACEHOLDER_URL =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2000&q=80";

const IMAGE_FALLBACK_DATA_ATTR = "data-luxury-fallback-applied";

export function getLuxuryPlaceholderImageUrl() {
  return LUXURY_PLACEHOLDER_URL;
}

export function applyLuxuryImageFallback(image: HTMLImageElement): void {
  if (image.getAttribute(IMAGE_FALLBACK_DATA_ATTR) === "true") return;
  image.setAttribute(IMAGE_FALLBACK_DATA_ATTR, "true");
  image.src = LUXURY_PLACEHOLDER_URL;
}

export function installGlobalImageErrorHandler(): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    applyLuxuryImageFallback(target);
  };

  window.addEventListener("error", handler, true);
  return () => window.removeEventListener("error", handler, true);
}
