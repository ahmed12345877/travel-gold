/*
 * Design: Art Deco Luxe - Black & Gold
 * News Page: Latest news and insights from VANIR GROUP
 */
import { motion } from "framer-motion";
import { ArrowRight, Crown, Calendar, User, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";

const articles = [
  {
    id: 1,
    title: "Egypt Records 14.9 Million International Visitors in 2024: What It Means for Luxury Travel",
    excerpt: "Egypt's tourism ministry announces record-breaking arrivals, with high-net-worth travelers driving the premium segment growth. VANIR GROUP shares its perspective on the transformation of Egypt's luxury travel landscape.",
    image: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=800&q=80",
    category: "Industry Insights",
    author: "VANIR Editorial",
    date: "June 15, 2025",
    readTime: "5 min read",
    featured: true,
  },
  {
    id: 2,
    title: "The Rise of Private Aviation in the Middle East: A New Standard for Executive Travel",
    excerpt: "Private jet demand across Egypt and the GCC has surged 40% year-on-year. We explore what's driving this shift and how VANIR's aviation desk is responding to the growing demand for on-demand air travel.",
    image: "https://images.unsplash.com/photo-1559628233-100c798642c0?w=800&q=80",
    category: "Aviation",
    author: "VANIR Aviation Desk",
    date: "May 28, 2025",
    readTime: "7 min read",
    featured: true,
  },
  {
    id: 3,
    title: "VANIR GROUP Expands MICE Operations to Three New Cairo Convention Venues",
    excerpt: "We announce the expansion of our corporate events portfolio with exclusive partnerships at three of Cairo's newest and most prestigious conference and event venues.",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80",
    category: "Company News",
    author: "VANIR GROUP",
    date: "May 10, 2025",
    readTime: "4 min read",
  },
  {
    id: 4,
    title: "Luxury Travel Trends 2025: What Egypt's Most Demanding Visitors Want",
    excerpt: "From hyperpersonalization to regenerative luxury experiences, we examine the defining trends reshaping how ultra-high-net-worth individuals are choosing to explore Egypt.",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80",
    category: "Trends",
    author: "VANIR Research",
    date: "April 22, 2025",
    readTime: "9 min read",
  },
  {
    id: 5,
    title: "Exclusive: Inside Egypt's Most Remote and Extraordinary Luxury Desert Camp",
    excerpt: "Deep in the White Desert, a new luxury tented camp is redefining the meaning of eco-luxury. VANIR GROUP takes an exclusive first look at this extraordinary new property.",
    image: "https://images.unsplash.com/photo-1500514966906-fe245eea9344?w=800&q=80",
    category: "Destinations",
    author: "VANIR Editorial",
    date: "April 8, 2025",
    readTime: "6 min read",
  },
  {
    id: 6,
    title: "VANIR GROUP Partners with Red Sea Yacht Club for Exclusive Maritime Experiences",
    excerpt: "A new partnership brings premium yacht charters, fishing expeditions, and marine experiences under the VANIR umbrella for our discerning clientele.",
    image: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=800&q=80",
    category: "Company News",
    author: "VANIR GROUP",
    date: "March 15, 2025",
    readTime: "3 min read",
  },
];

const categories = ["All", "Company News", "Industry Insights", "Aviation", "Destinations", "Trends"];

export default function News() {
  const featured = articles.filter((a) => a.featured);
  const rest = articles.filter((a) => !a.featured);

  return (
    <>
      <PageMeta
        title="News & Insights | VANIR GROUP"
        description="Latest news, industry insights, and travel inspiration from VANIR GROUP — Egypt's premier luxury travel company."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative py-32 flex items-center justify-center bg-black border-b border-[#D4AF37]/20">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-px w-16 bg-[#D4AF37]" />
              <Crown size={18} className="text-[#D4AF37]" />
              <div className="h-px w-16 bg-[#D4AF37]" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 font-[var(--font-display)]">
              News &amp; <span className="text-[#D4AF37]">Insights</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              The latest from VANIR GROUP — industry analysis, destination spotlights, company announcements, and the trends shaping the future of luxury travel.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-10 font-[var(--font-display)]">
            <span className="text-[#D4AF37]">Featured</span> Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {featured.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group bg-zinc-900 border border-[#D4AF37]/30 overflow-hidden hover:border-[#D4AF37]/70 transition-all duration-500"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-4 left-4 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">
                    {article.category}
                  </div>
                </div>
                <div className="p-7">
                  <h3 className="text-white text-xl font-bold mb-3 font-[var(--font-display)] group-hover:text-[#D4AF37] transition-colors duration-300">
                    {article.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-white/40 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {article.date}</span>
                      <span className="flex items-center gap-1"><User size={11} /> {article.author}</span>
                    </div>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* More Articles */}
          <h2 className="text-2xl font-bold text-white mb-10 font-[var(--font-display)]">
            Latest <span className="text-[#D4AF37]">Articles</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rest.map((article, idx) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-zinc-900 border border-white/10 overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-500"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-2">{article.category}</div>
                  <h3 className="text-white text-base font-bold mb-2 font-[var(--font-display)] group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 text-white/40 text-xs mt-3">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {article.date}</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-zinc-950 border-t border-[#D4AF37]/20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4 font-[var(--font-display)]">
            Stay <span className="text-[#D4AF37]">Informed</span>
          </h2>
          <p className="text-white/60 mb-8">Subscribe to the VANIR newsletter for exclusive insights, travel inspiration, and company updates delivered monthly.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold px-10 py-4 text-sm uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all duration-300"
          >
            Subscribe <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
