/*
 * Design: Art Deco Luxe - Black & Gold
 * WatermarkImage: Reusable component that overlays the VANIR GROUP logo
 * as a transparent watermark on destination/travel images.
 * Supports multiple positions and opacity levels.
 */
import { ASSETS } from "@/config/assets";

type WatermarkPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "center";

interface WatermarkImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  watermarkPosition?: WatermarkPosition;
  watermarkOpacity?: number;
  watermarkSize?: string;
  loading?: "lazy" | "eager";
  children?: React.ReactNode;
}

const positionClasses: Record<WatermarkPosition, string> = {
  "bottom-right": "bottom-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "top-right": "top-3 right-3",
  "top-left": "top-3 left-3",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

export default function WatermarkImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  watermarkPosition = "bottom-right",
  watermarkOpacity = 0.35,
  watermarkSize = "h-8 md:h-10",
  loading,
  children,
}: WatermarkImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imgClassName}`}
        loading={loading}
      />
      {/* Watermark logo overlay */}
      <div
        className={`absolute ${positionClasses[watermarkPosition]} z-10 pointer-events-none`}
        style={{ opacity: watermarkOpacity }}
      >
        <img
          src={ASSETS.LOGO_WATERMARK}
          alt="VANIR GROUP watermark"
          className={`${watermarkSize} w-auto object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]`}
          draggable={false}
        />
      </div>
      {children}
    </div>
  );
}
