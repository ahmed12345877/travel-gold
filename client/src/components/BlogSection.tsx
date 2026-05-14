/*
 * Design: Art Deco Luxe - Black & Gold
 * Blog: Latest travel articles with gold accents and watermark
 */
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import WatermarkImage from "@/components/WatermarkImage";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const EGYPT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-egypt-YcosuhKLMYbaJ475QVrVxy.webp";
const SHARM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/destination-sharm-Fh2PhqqrRQGfdg6EtwXedu.webp";

const fallbackBlogs = [
  {
    slug: "ultimate-guide-pyramids-of-giza",
    image: EGYPT_IMG,
    title: "Discover the Ancient Wonders of Egypt",
    excerpt: "Explore the timeless beauty of pyramids, temples, and the Nile River on an unforgettable journey.",
    date: "Mar 15, 2026",
    author: "VANIR GROUP",
  },
  {
    slug: "luxury-nile-cruise-experience",
    image: SHARM_IMG,
    title: "Luxury Nile Cruise: A Journey Through Ancient Egypt's Heart",
    excerpt: "Discover why a Nile cruise remains the most enchanting way to explore Egypt.",
    date: "Mar 10, 2026",
    author: "VANIR GROUP",
  },
  {
    slug: "top-10-egypt-travel-tips-2026",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=600&h=400&fit=crop",
    title: "Top 10 Essential Egypt Travel Tips",
    excerpt: "Planning your first trip to Egypt? These essential tips will help you navigate culture, currency, and more.",
    date: "Mar 05, 2026",
    author: "VANIR GROUP",
  },
];

export default function BlogSection() {
  const { ref, inView } = useInView({ threshold: 0.1 });
  const { data: dbPosts } = trpc.blog.list.useQuery({ limit: 3 });

  const blogs = dbPosts && dbPosts.length > 0
    ? dbPosts.map(p => ({
        slug: p.slug,
        image: p.coverImageUrl || EGYPT_IMG,
        title: p.title,
        excerpt: p.excerpt,
        date: p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "",
        author: p.authorName || "VANIR GROUP",
      }))
    : fallbackBlogs;

  return (
    <section id="blog" className="py-12 sm:py-16 md:py-24 bg-[var(--theme-surface)]" ref={ref}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-lg sm:text-xl mb-2 sm:mb-3 block">
            Latest Articles
          </span>
          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Travel Blog & News
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {blogs.map((blog, index) => (
            <motion.article
              key={blog.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group bg-[var(--theme-surface)] border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/30 transition-all duration-500"
            >
              <WatermarkImage
                src={blog.image}
                alt={blog.title}
                className="h-40 sm:h-48 md:h-52"
                imgClassName="group-hover:scale-110 transition-transform duration-700"
                watermarkPosition="bottom-right"
                watermarkOpacity={0.3}
                watermarkSize="h-6 md:h-7"
                loading="lazy"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)]/60 to-transparent" />
              </WatermarkImage>

              <div className="p-4 sm:p-5 md:p-6">
                <div className="flex items-center gap-4 mb-4 text-xs text-[var(--theme-primary)]/60">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {blog.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {blog.author}
                  </span>
                </div>

                <h3 className="font-[var(--font-display)] text-lg font-semibold text-white mb-3 group-hover:text-[var(--theme-primary)] transition-colors leading-snug">
                  {blog.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  {blog.excerpt}
                </p>

                <Link
                  href={`/blog/${blog.slug}`}
                  className="group/btn inline-flex items-center gap-2 text-[var(--theme-primary)] text-sm font-medium hover:text-white transition-colors"
                >
                  Read More
                  <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
