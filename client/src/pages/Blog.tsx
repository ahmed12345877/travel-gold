/*
 * Design: Art Deco Luxe - Black & Gold
 * Blog List Page: SEO-optimized travel articles
 */
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, Eye, ArrowRight, Search, Tag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import PageMeta from "@/components/PageMeta";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WatermarkImage from "@/components/WatermarkImage";

const CATEGORIES = [
  "All",
  "Destinations",
  "Experiences",
  "Travel Tips",
  "Culture",
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts, isLoading } = trpc.blog.list.useQuery(
    selectedCategory === "All"
      ? { limit: 20 }
      : { limit: 20, category: selectedCategory },
  );

  const filteredPosts = posts?.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // JSON-LD for Blog page
  const blogJsonLd = {
    "@type": "Blog",
    name: "VANIR GROUP Travel Blog",
    description:
      "Expert travel guides, tips, and insights for luxury Egypt tours. Discover pyramids, Nile cruises, Red Sea diving, and Egyptian culture.",
    url: "https://vanirgroup.com/blog",
    publisher: {
      "@type": "Organization",
      name: "VANIR GROUP",
      logo: {
        "@type": "ImageObject",
        url: "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <PageMeta
        title="Travel Blog - Expert Egypt Travel Guides & Tips"
        description="Explore our expert travel guides, tips, and insights for luxury Egypt tours. Discover pyramids, Nile cruises, Red Sea diving, and Egyptian culture with VANIR GROUP."
        keywords="egypt travel blog, travel guides egypt, pyramids guide, nile cruise tips, egypt tourism, luxury travel articles"
        canonicalPath="/blog"
        jsonLd={blogJsonLd}
      />
      <Navbar />

      {/* Hero Banner */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/manus-storage/hero-blog_16ca6aef.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-background)]/80 via-[var(--theme-background)]/70 to-[var(--theme-background)]" />
        </div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
              Our Journal
            </span>
            <h1 className="font-[var(--font-display)] text-3xl sm:text-2xl sm:text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:text-6xl font-bold text-white mb-6">
              Travel Blog & Guides
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Expert insights, travel tips, and destination guides to help you
              plan your perfect Egyptian adventure.
            </p>
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="pb-8">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-[var(--theme-primary)]/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 border ${
                    selectedCategory === cat
                      ? "bg-[var(--theme-primary)] text-[var(--theme-background)] border-[var(--theme-primary)]"
                      : "bg-transparent text-white/60 border-white/10 hover:border-[var(--theme-primary)]/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="pb-24">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/8 animate-pulse"
                >
                  <div className="h-52 bg-white/10" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 bg-white/10 w-1/3" />
                    <div className="h-5 bg-white/10 w-full" />
                    <div className="h-3 bg-white/10 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-[var(--theme-surface)] border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/30 transition-all duration-500"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <WatermarkImage
                      src={post.coverImageUrl || ""}
                      alt={post.title}
                      className="h-52"
                      imgClassName="group-hover:scale-110 transition-transform duration-700"
                      watermarkPosition="bottom-right"
                      watermarkOpacity={0.3}
                      watermarkSize="h-6 md:h-7"
                      loading="lazy"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/60 to-transparent" />
                      {post.category && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--theme-primary)]/90 text-[var(--theme-background)] text-xs font-semibold uppercase tracking-wider">
                            <Tag size={10} />
                            {post.category}
                          </span>
                        </div>
                      )}
                    </WatermarkImage>

                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4 text-xs text-[var(--theme-primary)]/60">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )
                            : "Draft"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {post.readingTime || 5} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {(post.viewCount || 0).toLocaleString()}
                        </span>
                      </div>

                      <h2 className="font-[var(--font-display)] text-lg font-semibold text-white mb-3 group-hover:text-[var(--theme-primary)] transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <span className="inline-flex items-center gap-2 text-[var(--theme-primary)] text-sm font-medium group-hover:text-white transition-colors">
                        Read More
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/40 text-lg">No articles found.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
