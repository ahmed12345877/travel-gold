import React from "react";
import { Helmet } from "react-helmet-async";
import { getSEOMetadata, normalizeRoute } from "@shared/seo/seoMatrix";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SITE_NAME = "VANIR GROUP";
const BASE_URL = "https://vanirgroup.com";
const DEFAULT_OG_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/hero-bg-YvjFWtPTFizkPySUcokQvt.webp";

export default function SEO({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = "website",
  noIndex = false,
}: SEOProps) {
  const routeFromCanonical = canonicalUrl ? canonicalUrl.replace(BASE_URL, "") : undefined;
  const currentRoute = normalizeRoute(routeFromCanonical || (typeof window !== "undefined" ? window.location.pathname : "/"));
  const routeMetadata = getSEOMetadata(currentRoute);
  const effectiveTitle = routeMetadata?.metaTitle ?? title;
  const effectiveDescription = routeMetadata?.metaDescription ?? description;
  const fullTitle = routeMetadata ? effectiveTitle : `${effectiveTitle} | ${SITE_NAME}`;
  const image = ogImage || DEFAULT_OG_IMAGE;
  const canonicalRoute = routeFromCanonical || routeMetadata?.route || currentRoute;
  const canonical = canonicalUrl || `${BASE_URL}${canonicalRoute}`;

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
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={effectiveDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={effectiveDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
