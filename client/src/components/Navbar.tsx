/*
 * Design: Misty Dark Theme
 * Navbar: Fully responsive design with mobile-first approach
 * White links with gold hover, glass-blur background on scroll
 */
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  MoreHorizontal,
  User,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useThemeMode } from "@/contexts/ThemeModeProvider";

/* ─── Navigation Structure ─── */
interface NavLink {
  label: string;
  href: string;
}

interface NavGroup {
  label: string;
  children: NavLink[];
}

type NavItem = NavLink | NavGroup;

function isGroup(item: NavItem): item is NavGroup {
  return "children" in item;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [location] = useLocation();
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Main navigation items
  const mainNavItems: NavItem[] = [
    { label: "Home", href: isHome ? "#" : "/" },
    {
      label: "AI Studio",
      children: [
        { label: "AI Studio Home", href: "/ai-studio" },
        { label: "Image Generator", href: "/ai-image-generator" },
        { label: "Marketing Suite", href: "/marketing" },
        { label: "My Dashboard", href: "/ai-dashboard" },
      ],
    },
    {
      label: "Destinations",
      children: [
        { label: "View All Destinations", href: "/destinations" },
        { label: "Book a Trip", href: "/booking" },
        { label: "Special Offers", href: "/offers" },
      ],
    },
    {
      label: "Programs",
      children: [
        { label: "View All Programs", href: "/programs" },
        { label: "Packages", href: "/programs#packages" },
        { label: "Hotels", href: "/programs#hotels" },
        { label: "Day Trips & Excursions", href: "/programs#day-trips" },
        { label: "MICE", href: "/programs#mice" },
        { label: "Private Jet", href: "/programs#private-jet" },
        {
          label: "Fast Track & Airport Transfer",
          href: "/programs#fast-track",
        },
        { label: "Visa Assistance & Meet and Greet", href: "/programs#visa" },
        { label: "eSIM Purchase", href: "/programs#esim" },
      ],
    },
    {
      label: "Services",
      children: [
        { label: "View All Services", href: "/services" },
        { label: "Flight Booking", href: "/services#flights" },
        { label: "Hotel Reservations", href: "/services#hotels" },
        { label: "Tour Packages", href: "/services#tours" },
        { label: "Travel Insurance", href: "/services#insurance" },
        { label: "Group Travel", href: "/services#groups" },
      ],
    },
    { label: "Blog", href: "/blog" },
  ];

  // More menu items (hidden in desktop, shown in "More" dropdown)
  const moreMenuItems: NavItem[] = [
    {
      label: "VANIR GROUP",
      children: [
        { label: "About VANIR GROUP", href: "/vanir" },
        { label: "VANIR GROUP News", href: "/vanir#news" },
        { label: "International Offices", href: "/vanir#offices" },
        { label: "Affiliated Companies", href: "/vanir#affiliated" },
        { label: "About Us", href: "/about" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    { label: "Blog", href: "/blog" },
  ];

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && href !== "#" && location === href) return true;
    return false;
  };

  const isGroupActive = (group: NavGroup) => {
    return group.children.some((child) => isActiveLink(child.href));
  };

  return (
    <>
      {/* Main navbar - fully transparent, blends with background */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[var(--theme-surface)] shadow-lg shadow-black/20 border-b border-white/5"
            : isHome
              ? "bg-gradient-to-b from-black/40 to-transparent border-b border-transparent"
              : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between py-3 sm:py-4 md:py-5">
          {/* Logo + Brand Name */}
          <a
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 shrink-0 group"
          >
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-correct_2a805e1d.png"
              alt="VANIR GROUP"
              className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto object-contain"
            />
            <span className="text-white font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-[0.1em] font-[var(--font-display)] group-hover:text-[var(--theme-primary)] transition-colors duration-300 hidden sm:inline">
              VANIR
              <span className="text-[var(--theme-primary)] group-hover:text-white transition-colors duration-300">
                {" "}
                GROUP
              </span>
            </span>
          </a>

          {/* Desktop nav links - hidden on md and below */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {mainNavItems.map((item) =>
              isGroup(item) ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className={`flex items-center gap-0.5 px-2 xl:px-2.5 py-1.5 text-xs xl:text-sm font-medium tracking-tight uppercase transition-all duration-300 whitespace-nowrap ${
                      isGroupActive(item) || openDropdown === item.label
                        ? "text-[var(--theme-primary)]"
                        : "text-white/80 hover:text-white"
                    }`}
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === item.label ? null : item.label,
                      )
                    }
                  >
                    {item.label}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-300 ${
                        openDropdown === item.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {openDropdown === item.label && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                        animate={{ opacity: 1, y: 0, scaleY: 1 }}
                        exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-1 min-w-[200px] xl:min-w-[220px] origin-top z-50"
                        onMouseEnter={() => handleDropdownEnter(item.label)}
                        onMouseLeave={handleDropdownLeave}
                      >
                        <div className="glass-card rounded-lg shadow-xl shadow-black/40 overflow-hidden">
                          <div className="h-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary-light)] to-[var(--theme-primary)]" />
                          <div className="py-2">
                            {item.children.map((child) => (
                              <a
                                key={child.label}
                                href={child.href}
                                onClick={() => setOpenDropdown(null)}
                                className={`group flex items-center px-4 py-2 text-xs font-medium tracking-tight transition-all duration-300 ${
                                  isActiveLink(child.href)
                                    ? "text-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                                    : "text-white/80 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full mr-2 transition-all duration-300 ${
                                    isActiveLink(child.href)
                                      ? "bg-[var(--theme-primary)]"
                                      : "bg-white/20 group-hover:bg-[var(--theme-primary)]"
                                  }`}
                                />
                                {child.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative px-2 xl:px-2.5 py-1.5 text-xs xl:text-sm font-medium tracking-tight uppercase transition-all duration-300 group whitespace-nowrap ${
                    isActiveLink(item.href)
                      ? "text-[var(--theme-primary)]"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-2 xl:left-2.5 right-2 xl:right-2.5 h-[1px] bg-[var(--theme-primary)] transition-all duration-300 ${
                      isActiveLink(item.href)
                        ? "w-[calc(100%-1rem)] xl:w-[calc(100%-1.25rem)]"
                        : "w-0 group-hover:w-[calc(100%-1rem)] xl:group-hover:w-[calc(100%-1.25rem)]"
                    }`}
                  />
                </a>
              ),
            )}

            {/* More menu dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleDropdownEnter("more")}
              onMouseLeave={handleDropdownLeave}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={`flex items-center gap-0.5 px-1.5 xl:px-2 py-1.5 text-xs xl:text-sm font-medium tracking-tight transition-all duration-300 ${
                  openDropdown === "more"
                    ? "text-[var(--theme-primary)]"
                    : "text-white/80 hover:text-white"
                }`}
                onClick={() =>
                  setOpenDropdown(openDropdown === "more" ? null : "more")
                }
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>

              <AnimatePresence>
                {openDropdown === "more" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-1 min-w-[200px] origin-top z-50"
                    onMouseEnter={() => handleDropdownEnter("more")}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="glass-card rounded-lg shadow-xl shadow-black/40 overflow-hidden">
                      <div className="h-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary-light)] to-[var(--theme-primary)]" />
                      <div className="py-2">
                        {moreMenuItems.map((item) =>
                          isGroup(item) ? (
                            <div key={item.label}>
                              <div className="px-4 py-2 text-xs font-bold text-[var(--theme-primary)] uppercase tracking-tight border-b border-white/10">
                                {item.label}
                              </div>
                              {item.children.map((child) => (
                                <a
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className={`group flex items-center px-4 py-2 text-xs font-medium tracking-tight transition-all duration-300 ${
                                    isActiveLink(child.href)
                                      ? "text-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                                      : "text-white/80 hover:text-white hover:bg-white/5"
                                  }`}
                                >
                                  <span
                                    className={`w-1 h-1 rounded-full mr-2 transition-all duration-300 ${
                                      isActiveLink(child.href)
                                        ? "bg-[var(--theme-primary)]"
                                        : "bg-white/20 group-hover:bg-[var(--theme-primary)]"
                                    }`}
                                  />
                                  {child.label}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <a
                              key={item.label}
                              href={item.href}
                              onClick={() => setOpenDropdown(null)}
                              className={`group flex items-center px-4 py-2 text-xs font-medium tracking-tight transition-all duration-300 ${
                                isActiveLink(item.href)
                                  ? "text-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                                  : "text-white/80 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span
                                className={`w-1 h-1 rounded-full mr-2 transition-all duration-300 ${
                                  isActiveLink(item.href)
                                    ? "bg-[var(--theme-primary)]"
                                    : "bg-white/20 group-hover:bg-[var(--theme-primary)]"
                                }`}
                              />
                              {item.label}
                            </a>
                          ),
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right actions - compressed for mobile */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleMode}
              className="text-white/50 hover:text-[var(--theme-primary)] transition-colors p-1 rounded-md hover:bg-white/5"
              title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
            >
              {mode === "light" ? (
                <Moon size={16} className="sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Sun size={16} className="sm:w-[18px] sm:h-[18px]" />
              )}
            </button>

            {/* Search */}
            <button className="text-white/50 hover:text-white transition-colors p-1">
              <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            {/* Auth-aware Login/Profile Button - hidden on sm and below */}
            {isAuthenticated ? (
              <div
                className="relative hidden md:block"
                onMouseEnter={() => handleDropdownEnter("user-menu")}
                onMouseLeave={handleDropdownLeave}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 text-white text-xs lg:text-sm font-medium tracking-tight hover:text-[var(--theme-primary)] transition-all duration-300 whitespace-nowrap"
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "user-menu" ? null : "user-menu",
                    )
                  }
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover border border-[var(--theme-primary)]/30"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--theme-primary)]/20 flex items-center justify-center">
                      <User size={12} className="text-[var(--theme-primary)]" />
                    </div>
                  )}
                  <span className="hidden lg:inline">
                    {user?.name?.split(" ")[0] || "Profile"}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-300 ${openDropdown === "user-menu" ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {openDropdown === "user-menu" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      animate={{ opacity: 1, y: 0, scaleY: 1 }}
                      exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-1 min-w-[180px] origin-top z-50"
                      onMouseEnter={() => handleDropdownEnter("user-menu")}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="glass-card rounded-lg shadow-xl shadow-black/40 overflow-hidden">
                        <div className="h-[2px] bg-gradient-to-r from-[var(--theme-primary)] via-[var(--theme-primary-light)] to-[var(--theme-primary)]" />
                        <div className="py-2">
                          <a
                            href="/profile"
                            onClick={() => setOpenDropdown(null)}
                            className="group flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-tight text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300"
                          >
                            <User
                              size={14}
                              className="text-[var(--theme-primary)]/60"
                            />
                            My Profile
                          </a>
                          <a
                            href="/ai-dashboard"
                            onClick={() => setOpenDropdown(null)}
                            className="group flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-tight text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300"
                          >
                            <span className="w-3.5 h-3.5 text-[var(--theme-primary)]/60">
                              ✨
                            </span>
                            AI Dashboard
                          </a>
                          {user?.role === "admin" && (
                            <a
                              href="/admin"
                              onClick={() => setOpenDropdown(null)}
                              className="group flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-tight text-white/80 hover:text-white hover:bg-white/5 transition-all duration-300"
                            >
                              <span className="w-3.5 h-3.5 text-[var(--theme-primary)]/60">
                                ⚙️
                              </span>
                              Admin Panel
                            </a>
                          )}
                          <div className="border-t border-white/10 mt-1 pt-1">
                            <button
                              onClick={async () => {
                                setOpenDropdown(null);
                                await logout();
                                window.location.href = "/";
                              }}
                              className="w-full group flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-tight text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300"
                            >
                              <LogOut size={14} />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <a
                href="/login"
                className="hidden md:inline-flex items-center px-2 lg:px-2.5 py-1.5 text-white text-xs lg:text-sm font-medium tracking-tight hover:text-[var(--theme-primary)] transition-all duration-300 whitespace-nowrap"
              >
                Login
              </a>
            )}

            {/* Request Quote Button - hidden on sm and below */}
            <a
              href="/contact"
              className="hidden md:inline-flex items-center px-2 lg:px-2.5 py-1.5 border border-white/20 text-white text-xs lg:text-sm font-medium tracking-tight rounded hover:bg-white hover:text-[var(--theme-surface)] transition-all duration-300 whitespace-nowrap"
            >
              Quote
            </a>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-white p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden bg-[var(--theme-surface)]/95 backdrop-blur-xl border-t border-white/5"
            >
              <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-1">
                {[...mainNavItems, ...moreMenuItems].map((item) =>
                  isGroup(item) ? (
                    <div key={item.label}>
                      <button
                        onClick={() =>
                          setMobileExpanded(
                            mobileExpanded === item.label ? null : item.label,
                          )
                        }
                        className={`w-full flex items-center justify-between py-3 text-sm sm:text-base font-medium tracking-tight uppercase border-b border-white/5 transition-colors duration-300 ${
                          mobileExpanded === item.label || isGroupActive(item)
                            ? "text-[var(--theme-primary)]"
                            : "text-white hover:text-white/80"
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${
                            mobileExpanded === item.label ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 py-2 space-y-1 border-b border-white/5">
                              {item.children.map((child) => (
                                <a
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => {
                                    setMobileOpen(false);
                                    setMobileExpanded(null);
                                  }}
                                  className={`flex items-center gap-2 py-3 text-sm font-medium tracking-tight transition-colors duration-300 ${
                                    isActiveLink(child.href)
                                      ? "text-[var(--theme-primary)]"
                                      : "text-white/70 hover:text-white"
                                  }`}
                                >
                                  <span
                                    className={`w-0.5 h-0.5 rounded-full ${
                                      isActiveLink(child.href)
                                        ? "bg-[var(--theme-primary)]"
                                        : "bg-white/30"
                                    }`}
                                  />
                                  {child.label}
                                </a>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`py-3 text-sm sm:text-base font-medium tracking-tight uppercase border-b border-white/5 transition-colors duration-300 ${
                        isActiveLink(item.href)
                          ? "text-[var(--theme-primary)]"
                          : "text-white hover:text-white/80"
                      }`}
                    >
                      {item.label}
                    </a>
                  ),
                )}
                {isAuthenticated ? (
                  <>
                    <a
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="py-3 text-sm sm:text-base font-medium tracking-tight uppercase border-b border-white/5 text-[var(--theme-primary)] transition-colors duration-300"
                    >
                      My Profile
                    </a>
                    <button
                      onClick={async () => {
                        setMobileOpen(false);
                        await logout();
                        window.location.href = "/";
                      }}
                      className="py-3 text-sm sm:text-base font-medium tracking-tight uppercase border-b border-white/5 text-red-400 hover:text-red-300 transition-colors duration-300 text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <a
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-xs font-medium tracking-tight uppercase border-b border-white/5 text-white hover:text-white/80 transition-colors duration-300"
                  >
                    Login
                  </a>
                )}
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-3 py-2 border border-white/20 text-white text-xs font-medium tracking-tight rounded hover:bg-white hover:text-[var(--theme-surface)] transition-all duration-300 mt-2 w-full"
                >
                  Request A Quote
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
