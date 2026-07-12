/**
 * Gallery Image Type Definition
 * Ensures type safety across gallery-related components
 * Used in GallerySection, AdminGallery, and DestinationsAdmin
 */

export type GalleryCategory = "luxury" | "safari" | "beach" | "cuisine" | "culture" | "adventure";
export type FeaturedStatus = "yes" | "no";
export type VisibilityStatus = "visible" | "hidden";

export interface GalleryImage {
  // Required fields
  id: string; // Stable unique identifier from Firestore (docId)
  imageUrl: string; // Permanent Firebase Storage URL
  category: GalleryCategory; // Image classification

  // Display fields
  title?: string; // English title
  titleAr?: string; // Arabic title
  description?: string; // English description
  descriptionAr?: string; // Arabic description

  // Metadata fields
  location?: string; // English location
  locationAr?: string; // Arabic location
  featured?: FeaturedStatus; // Whether image is featured (default: "no")
  isVisible?: VisibilityStatus; // Visibility status (default: "visible")

  // Optional fields for destinations
  rating?: number; // 1-5 rating
  pricePerPerson?: number; // Price in currency units
  duration?: string; // Trip duration (e.g., "3 days")
  groupSize?: number; // Max group size
  difficulty?: "easy" | "moderate" | "hard"; // Activity difficulty
  highlights?: string; // Arabic comma-separated highlights
  bestTimeToVisit?: string; // Best season/month to visit
  inclusions?: string; // What's included
  exclusions?: string; // What's not included

  // Metadata
  createdAt?: Date | string; // Creation timestamp
  updatedAt?: Date | string; // Last update timestamp
}

/**
 * Gallery image with thumbnail URL for optimized display
 * Used when serving multiple image sizes for responsive images
 */
export interface GalleryImageWithThumbnail extends GalleryImage {
  thumbnailUrl?: string; // Small preview image (e.g., 400x300)
}

/**
 * Gallery upload response from server
 * Returned after successful image upload
 */
export interface GalleryUploadResponse {
  id: string; // Document ID in Firestore
  url: string; // Public Firebase Storage URL for display
  fileKey: string; // Storage path for reference/deletion
  thumbnailUrl?: string; // Optional thumbnail URL if generated
}

/**
 * Gallery list query response
 * Used for typing trpc.gallery.listVisible() and similar queries
 */
export interface GalleryListResponse {
  items: GalleryImage[];
  total: number;
  hasMore: boolean;
}
