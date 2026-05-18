/*
 * Design: Misty Dark Theme
 * Footer: Multi-column footer with glass morphism and subtle fog effects
 */
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Destinations", href: "/booking" },
  { label: "Offers", href: "/offers" },
  { label: "Activities", href: "/#activities" },
  { label: "Blog", href: "/#blog" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact Us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[var(--theme-surface)] border-t border-white/5 relative overflow-hidden"
    >
      {/* Subtle fog background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.03]"
          style={{
            background:
              "radial-gradient(circle, rgba(100,140,180,1) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.02]"
          style={{
            background:
              "radial-gradient(circle, rgba(212,168,83,1) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main footer */}
      <div className="container relative py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
          {/* Brand - spans full width on mobile */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="inline-block mb-4">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-white_74cd1f52.png"
                alt="VANIR GROUP"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              />
            </a>
            <p className="text-white/40 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-[var(--font-body)]">
              Your gateway to extraordinary travel experiences. We craft luxury
              journeys that create lasting memories.
            </p>
            <div className="flex gap-3">
              {[
                {
                  Icon: Facebook,
                  href: "https://www.facebook.com/share/1DvRyfaQRC/",
                  label: "Facebook",
                },
                {
                  Icon: Instagram,
                  href: "https://www.instagram.com/vanir.group?igsh=cnpjczFsZzdrMDhi",
                  label: "Instagram",
                },
                { Icon: Twitter, href: "#", label: "Twitter" },
                { Icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  onClick={
                    href === "#"
                      ? (e) => {
                          e.preventDefault();
                          toast("Feature coming soon");
                        }
                      : undefined
                  }
                  className="w-9 h-9 border border-white/10 rounded-lg flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300"
                  aria-label={label}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-[var(--font-display)] text-white font-semibold mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group flex items-center gap-2 text-white/40 text-sm hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]"
                  >
                    <ArrowRight
                      size={12}
                      className="text-transparent group-hover:text-[var(--theme-primary)] transition-all"
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-[var(--font-display)] text-white font-semibold mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm uppercase tracking-wider">
              Our Services
            </h4>
            <ul className="space-y-3">
              {[
                "Tent Camping",
                "Mountain Hiking",
                "Fishing & Boat",
                "Island Climbing",
                "Valley Trekking",
                "Desert Safari",
              ].map((service) => (
                <li key={service}>
                  <a
                    href="/#activities"
                    className="group flex items-center gap-2 text-white/40 text-sm hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]"
                  >
                    <ArrowRight
                      size={12}
                      className="text-transparent group-hover:text-[var(--theme-primary)] transition-all"
                    />
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-[var(--font-display)] text-white font-semibold mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm uppercase tracking-wider">
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin
                  size={16}
                  className="text-[var(--theme-primary)] mt-0.5 shrink-0"
                />
                <span className="text-white/40 text-sm font-[var(--font-body)]">
                  203 SALAHSALEEM, SET, CAIRO, EGYPT
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail
                  size={16}
                  className="text-[var(--theme-primary)] shrink-0"
                />
                <a
                  href="mailto:info@vanirgroup.com"
                  className="text-white/40 text-sm hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]"
                >
                  info@vanirgroup.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone
                  size={16}
                  className="text-[var(--theme-primary)] shrink-0"
                />
                <a
                  href="tel:+201123988882"
                  className="text-white/40 text-sm hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]"
                >
                  +201123988882
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5 relative">
        <div className="container py-4 sm:py-6 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-white/20 text-[10px] sm:text-xs font-[var(--font-body)]">
            &copy; 2026 VANIR GROUP. All rights reserved.
          </p>
          <div className="flex gap-3 sm:gap-6 flex-wrap justify-center">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-white/20 text-xs hover:text-[var(--theme-primary)] transition-colors font-[var(--font-body)]"
                >
                  {link}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
