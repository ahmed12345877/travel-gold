/**
 * Centralized asset URLs configuration
 * Maintains consistent branding assets across the application
 * Update these URLs here when assets are moved/updated
 */

export const ASSETS = {
  // Company Logo - Circular badge with gold V and airplane
  LOGO_MAIN: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1000149403-Ar0iziCBPWsdylRpW15pdWYcsJtrce.png",
  
  // Watermark Logo - White logo for overlays
  LOGO_WATERMARK: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png",
  
  // Hero Section Assets
  HERO_BG: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/misty-hero-bg-L7rPLhy7UyP6hQeLmG4RHw.webp",
  HERO_VIDEO: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12121%20hero-DivuXUVJHN9r3kCgOV0FpVWlEDdf9U.mp4",
} as const;

// Export individual constants for backward compatibility
export const LOGO_URL = ASSETS.LOGO_MAIN;
