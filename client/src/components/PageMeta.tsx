import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { getSEOMetadata } from "@shared/seo/seoMatrix";

interface PageMetaProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalPath?: string;
  noIndex?: boolean;
  /** JSON-LD structured data */
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = "VANIR GROUP";
const SITE_URL = "https://vanirgroup.com";
const DEFAULT_OG_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/hero-bg-YvjFWtPTFizkPySUcokQvt.webp";

export default function PageMeta({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonicalPath,
  noIndex = false,
  jsonLd,
}: PageMetaProps) {
  const [location] = useLocation();
  const routeMetadata = getSEOMetadata(canonicalPath || location);
  const effectiveTitle = routeMetadata?.metaTitle ?? title;
  const effectiveDescription = routeMetadata?.metaDescription ?? description;
  let fullTitle = effectiveTitle;
  if (!routeMetadata && effectiveTitle !== SITE_NAME) {
    fullTitle = `${effectiveTitle} | ${SITE_NAME}`;
  }
  const canonicalRoute = canonicalPath || routeMetadata?.route;
  const canonical = canonicalRoute ? `${SITE_URL}${canonicalRoute}` : undefined;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={effectiveDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={effectiveDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={effectiveDescription} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify({ "@context": "https://schema.org", ...jsonLd })}
        </script>
      )}
    </Helmet>
  );
}
