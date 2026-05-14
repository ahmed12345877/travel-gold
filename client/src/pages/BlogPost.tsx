/*
 * Design: Art Deco Luxe - Black & Gold
 * Blog Post Page: Individual article with full SEO and Schema markup
 */
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ArrowLeft, User, Tag, Share2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import PageMeta from "@/components/PageMeta";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Related posts (same category, excluding current)
  const { data: relatedPosts } = trpc.blog.list.useQuery(
    { limit: 3, category: post?.category || undefined },
    { enabled: !!post?.category }
  );

  const filteredRelated = relatedPosts?.filter((p) => p.slug !== slug).slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Article JSON-LD
  const articleJsonLd = post
    ? {
        "@type": "Article",
        headline: post.title,
        description: post.metaDescription || post.excerpt,
        image: post.coverImageUrl,
        datePublished: post.publishedAt
          ? new Date(post.publishedAt).toISOString()
          : undefined,
        dateModified: new Date(post.updatedAt).toISOString(),
        author: {
          "@type": "Organization",
          name: post.authorName || "VANIR GROUP",
        },
        publisher: {
          "@type": "Organization",
          name: "VANIR GROUP",
          logo: {
            "@type": "ImageObject",
            url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://vanirgroup.com/blog/${slug}`,
        },
        wordCount: post.content?.split(/\s+/).length || 0,
        articleSection: post.category || "Travel",
      }
    : undefined;

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://vanirgroup.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://vanirgroup.com/blog",
      },
      ...(post
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: post.title,
              item: `https://vanirgroup.com/blog/${slug}`,
            },
          ]
        : []),
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <Navbar />
        <div className="pt-32 pb-24">
          <div className="container max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-4 bg-white/10 w-1/4" />
              <div className="h-10 bg-white/10 w-3/4" />
              <div className="h-64 bg-white/10" />
              <div className="space-y-3">
                <div className="h-4 bg-white/10 w-full" />
                <div className="h-4 bg-white/10 w-5/6" />
                <div className="h-4 bg-white/10 w-4/6" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)]">
        <Navbar />
        <div className="pt-32 pb-24 text-center">
          <div className="container">
            <h1 className="font-[var(--font-display)] text-3xl font-bold text-white mb-4">
              Article Not Found
            </h1>
            <p className="text-white/50 mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--theme-primary)] text-[var(--theme-background)] font-semibold hover:bg-[var(--theme-primary-light)] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tags: string[] = Array.isArray(post.tags) ? (post.tags as string[]) : [];

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <PageMeta
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        keywords={post.metaKeywords || undefined}
        ogImage={post.coverImageUrl || undefined}
        ogType="article"
        canonicalPath={`/blog/${slug}`}
        jsonLd={articleJsonLd}
      />
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            ...breadcrumbJsonLd,
          }),
        }}
      />
      <Navbar />

      {/* Article Header */}
      <section className="pt-32 pb-12">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
              <Link href="/" className="hover:text-[var(--theme-primary)] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-[var(--theme-primary)] transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-white/60 truncate">{post.title}</span>
            </nav>

            {/* Category */}
            {post.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] text-xs font-semibold uppercase tracking-wider border border-[var(--theme-primary)]/20 mb-4">
                <Tag size={10} />
                {post.category}
              </span>
            )}

            {/* Title */}
            <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-8">
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-[var(--theme-primary)]" />
                {post.authorName || "VANIR GROUP"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--theme-primary)]" />
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Draft"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-[var(--theme-primary)]" />
                {post.readingTime || 5} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-[var(--theme-primary)]" />
                {(post.viewCount || 0).toLocaleString()} views
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-[var(--theme-primary)] transition-colors ml-auto"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <section className="pb-12">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden border border-white/10"
            >
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-background)]/30 to-transparent" />
            </motion.div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <article className="pb-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-[var(--font-display)] prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-l-2 prose-h2:border-[var(--theme-primary)] prose-h2:pl-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-[var(--theme-primary)]/90
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-a:text-[var(--theme-primary)] prose-a:no-underline hover:prose-a:text-[var(--theme-primary-light)]
              prose-strong:text-white prose-strong:font-semibold
              prose-li:text-white/70
              prose-table:border-white/10
              prose-th:text-[var(--theme-primary)] prose-th:border-white/10
              prose-td:border-white/10 prose-td:text-white/60
              prose-blockquote:border-[var(--theme-primary)] prose-blockquote:text-white/60
              prose-code:text-[var(--theme-primary)] prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5
            "
          >
            <Streamdown>{post.content}</Streamdown>
          </motion.div>
        </div>
      </article>

      {/* Tags */}
      {tags.length > 0 && (
        <section className="pb-12">
          <div className="container max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 pt-8 border-t border-white/10">
              <span className="text-white/40 text-sm mr-2">Tags:</span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs bg-white/5 text-white/50 border border-white/10 hover:border-[var(--theme-primary)]/30 hover:text-[var(--theme-primary)] transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="pb-16">
        <div className="container max-w-4xl">
          <div className="bg-gradient-to-r from-[var(--theme-primary)]/10 to-[var(--theme-primary)]/5 border border-[var(--theme-primary)]/20 p-8 md:p-12 text-center">
            <h3 className="font-[var(--font-display)] text-2xl font-bold text-white mb-3">
              Ready to Experience Egypt?
            </h3>
            <p className="text-white/60 mb-6 max-w-lg mx-auto">
              Let VANIR GROUP craft your perfect luxury Egyptian adventure. From
              pyramids to beaches, we handle every detail.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-background)] font-semibold hover:bg-[var(--theme-primary-light)] transition-colors"
            >
              Book Your Journey
              <ArrowLeft size={16} className="rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {filteredRelated && filteredRelated.length > 0 && (
        <section className="pb-24">
          <div className="container max-w-4xl">
            <h3 className="font-[var(--font-display)] text-2xl font-bold text-white mb-8">
              Related Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredRelated.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group bg-[var(--theme-surface)] border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/30 transition-all duration-500"
                >
                  {related.coverImageUrl && (
                    <img
                      src={related.coverImageUrl}
                      alt={related.title}
                      className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-[var(--font-display)] text-sm font-semibold text-white group-hover:text-[var(--theme-primary)] transition-colors line-clamp-2">
                      {related.title}
                    </h4>
                    <p className="text-white/40 text-xs mt-2">
                      {related.readingTime || 5} min read
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
