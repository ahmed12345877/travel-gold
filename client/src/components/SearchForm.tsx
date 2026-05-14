/*
 * Design: Art Deco Luxe - Black & Gold
 * Search Form: Floating card with gold accents overlapping hero section
 * Mobile-optimized: vertical stacking on small screens
 */
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, Search } from "lucide-react";
import { toast } from "sonner";

export default function SearchForm() {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Feature coming soon", {
      description: "Search functionality will be available soon.",
    });
  };

  return (
    <div className="relative z-20 -mt-12 sm:-mt-16 md:-mt-20 mb-10 sm:mb-16">
      <div className="container">
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 p-4 sm:p-6 md:p-8 shadow-2xl shadow-[var(--theme-primary)]/5 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-[var(--theme-primary)] text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                <MapPin size={14} className="sm:w-4 sm:h-4" />
                Location
              </label>
              <select className="w-full bg-[var(--theme-surface)] border border-white/10 text-white/80 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-[var(--theme-primary)] focus:outline-none transition-colors appearance-none rounded-sm">
                <option value="">Where are you going?</option>
                <option value="egypt">Egypt</option>
                <option value="sharm">Sharm El Sheikh</option>
                <option value="luxor">Luxor</option>
                <option value="aswan">Aswan</option>
              </select>
            </div>

            {/* Check In */}
            <div>
              <label className="flex items-center gap-2 text-[var(--theme-primary)] text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                <Calendar size={14} className="sm:w-4 sm:h-4" />
                Check In
              </label>
              <input
                type="date"
                className="w-full bg-[var(--theme-surface)] border border-white/10 text-white/80 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-[var(--theme-primary)] focus:outline-none transition-colors rounded-sm"
              />
            </div>

            {/* Check Out */}
            <div>
              <label className="flex items-center gap-2 text-[var(--theme-primary)] text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                <Calendar size={14} className="sm:w-4 sm:h-4" />
                Check Out
              </label>
              <input
                type="date"
                className="w-full bg-[var(--theme-surface)] border border-white/10 text-white/80 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-[var(--theme-primary)] focus:outline-none transition-colors rounded-sm"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="flex items-center gap-2 text-[var(--theme-primary)] text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                <Users size={14} className="sm:w-4 sm:h-4" />
                Guests
              </label>
              <select className="w-full bg-[var(--theme-surface)] border border-white/10 text-white/80 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-[var(--theme-primary)] focus:outline-none transition-colors appearance-none rounded-sm">
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex justify-center md:justify-end">
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 px-8 sm:px-10 py-2.5 sm:py-3 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-semibold text-xs sm:text-sm tracking-wide hover:bg-[var(--theme-primary-light)] transition-all duration-300 w-full sm:w-auto"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
