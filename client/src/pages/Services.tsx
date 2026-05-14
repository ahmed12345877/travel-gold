/*
 * Design: Art Deco Luxe - Black & Gold
 * Services Page: Comprehensive travel services with images and details
 */
import { motion } from "framer-motion";
import {
  Plane,
  Hotel,
  MapPin,
  FileText,
  Shield,
  Users,
  Phone,
  Car,
  Crown,
  Globe,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageMeta from "@/components/PageMeta";
import WatermarkImage from "@/components/WatermarkImage";

const CDN =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8";

type Service = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  image: string;
  icon: typeof Plane;
  features: string[];
  highlight?: boolean;
};

const services: Service[] = [
  {
    id: 1,
    title: "VIP Airport Services",
    subtitle: "Fast Track & Luxury Transfers",
    description:
      "Skip the queues with our VIP fast-track immigration and enjoy luxury limousine transfers to your destination.",
    longDescription:
      "Our VIP airport service includes meet & greet at the gate, fast-track through immigration and customs, porter service for your luggage, and a luxury limousine waiting to take you directly to your hotel or destination.",
    image: `${CDN}/limousine-airport_133f2e61.jpg`,
    icon: Car,
    features: [
      "Meet & Greet at Gate",
      "Fast-Track Immigration",
      "Luxury Limousine",
      "Porter Service",
      "24/7 Availability",
    ],
    highlight: true,
  },
  {
    id: 2,
    title: "Hotel Reservations",
    subtitle: "From Boutique to 5-Star Luxury",
    description:
      "Access exclusive rates at Egypt's finest hotels and resorts, from boutique gems to world-renowned luxury properties.",
    longDescription:
      "We partner with over 500 hotels across Egypt and the Middle East, offering you exclusive rates and complimentary upgrades. Whether you prefer a historic palace hotel or a modern beachfront resort, we find the perfect match.",
    image: `${CDN}/hotel-reception_36ceab25.jpg`,
    icon: Hotel,
    features: [
      "Exclusive Rates",
      "Complimentary Upgrades",
      "500+ Partner Hotels",
      "Instant Confirmation",
      "Free Cancellation",
    ],
    highlight: true,
  },
  {
    id: 3,
    title: "Visa Assistance",
    subtitle: "Hassle-Free Documentation",
    description:
      "Complete visa processing and documentation support for all nationalities traveling to Egypt and beyond.",
    longDescription:
      "Our visa team handles the entire process — from application preparation and document verification to embassy submission and follow-up. We support tourist, business, and transit visas for over 50 countries.",
    image: `${CDN}/visa-assistance_f384e024.jpg`,
    icon: FileText,
    features: [
      "Full Application Support",
      "Document Preparation",
      "Embassy Liaison",
      "Express Processing",
      "50+ Countries",
    ],
  },
  {
    id: 4,
    title: "Concierge Service",
    subtitle: "Your Personal Travel Assistant",
    description:
      "A dedicated concierge to handle every detail of your trip — from restaurant reservations to private tours.",
    longDescription:
      "Our premium concierge service assigns you a personal travel assistant who manages your entire itinerary. From securing hard-to-get restaurant reservations to arranging private museum tours and exclusive experiences.",
    image: `${CDN}/concierge-service_0454a2d8.webp`,
    icon: Crown,
    features: [
      "Personal Assistant",
      "Restaurant Reservations",
      "Private Tours",
      "Event Tickets",
      "24/7 Availability",
    ],
    highlight: true,
  },
  {
    id: 5,
    title: "Travel Insurance",
    subtitle: "Travel with Peace of Mind",
    description:
      "Comprehensive travel insurance covering medical emergencies, trip cancellation, lost luggage, and more.",
    longDescription:
      "Our travel insurance plans are designed specifically for travelers to Egypt and the Middle East. Coverage includes medical emergencies up to $500,000, trip cancellation, baggage loss, flight delays, and emergency evacuation.",
    image: `${CDN}/travel-insurance_dc3ba418.png`,
    icon: Shield,
    features: [
      "Medical Coverage $500K",
      "Trip Cancellation",
      "Lost Luggage",
      "Flight Delay",
      "Emergency Evacuation",
    ],
  },
  {
    id: 6,
    title: "Group & MICE Travel",
    subtitle: "Corporate Events & Conferences",
    description:
      "Specialized packages for corporate groups, conferences, incentive trips, and team-building events in Egypt.",
    longDescription:
      "We organize end-to-end corporate travel including venue selection, accommodation, transportation, team activities, and gala dinners. Our MICE team has organized events for groups of 10 to 2,000 participants.",
    image: `${CDN}/office-meeting_d934f6c0.png`,
    icon: Users,
    features: [
      "Venue Selection",
      "Group Accommodation",
      "Team Activities",
      "Gala Dinners",
      "Up to 2,000 Participants",
    ],
  },
  {
    id: 7,
    title: "Flight Booking",
    subtitle: "Domestic & International",
    description:
      "Book flights at competitive rates with flexible options, including business and first-class upgrades.",
    longDescription:
      "Access the best fares across all major airlines with our flight booking service. We offer flexible booking options, seat selection, special meal requests, and last-minute deals for both domestic and international routes.",
    image: `${CDN}/airport-concierge_b1da3a56.jpg`,
    icon: Plane,
    features: [
      "Best Fare Guarantee",
      "Flexible Booking",
      "Business Class",
      "Seat Selection",
      "24/7 Support",
    ],
  },
  {
    id: 8,
    title: "VIP Lounge Access",
    subtitle: "Exclusive Airport Lounges",
    description:
      "Relax in premium airport lounges with complimentary food, drinks, Wi-Fi, and shower facilities.",
    longDescription:
      "Enjoy access to over 1,200 airport lounges worldwide. Our VIP lounge service includes complimentary gourmet food and beverages, high-speed Wi-Fi, shower facilities, and quiet work areas — perfect for business travelers.",
    image: `${CDN}/vip-lounge_6e90c366.jpg`,
    icon: Sparkles,
    features: [
      "1,200+ Lounges",
      "Gourmet Food",
      "High-Speed Wi-Fi",
      "Shower Facilities",
      "Business Center",
    ],
  },
  {
    id: 9,
    title: "Custom Tour Design",
    subtitle: "Tailored to Your Vision",
    description:
      "Work with our travel designers to create a completely bespoke itinerary matching your exact preferences.",
    longDescription:
      "Our experienced travel designers sit with you to understand your interests, pace, budget, and style. We then craft a unique itinerary that includes hidden gems, local experiences, and exclusive access that standard tours can't offer.",
    image: `${CDN}/luxury-agency_f12d8ad7.jpg`,
    icon: MapPin,
    features: [
      "Personal Consultation",
      "Custom Itinerary",
      "Hidden Gems",
      "Local Experiences",
      "Flexible Budget",
    ],
  },
  {
    id: 10,
    title: "24/7 Travel Support",
    subtitle: "Always Here for You",
    description:
      "Round-the-clock multilingual support for any travel emergency or assistance you may need.",
    longDescription:
      "Our support team is available 24 hours a day, 7 days a week, in Arabic, English, French, and German. Whether you need to change a booking, report an emergency, or simply need local recommendations, we're just a call away.",
    image: `${CDN}/sharm-balcony_d1ac82aa.jpg`,
    icon: Phone,
    features: [
      "24/7 Availability",
      "Multilingual (AR/EN/FR/DE)",
      "Emergency Response",
      "Booking Changes",
      "Local Recommendations",
    ],
  },
];

export default function Services() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1 });
  const { ref: gridRef, inView: gridInView } = useInView({ threshold: 0.05 });
  const { ref: whyRef, inView: whyInView } = useInView({ threshold: 0.1 });

  return (
    <>
      <Navbar />
      <PageMeta
        title="Services - VIP Travel, Hotels & Concierge"
        description="VANIR GROUP offers premium travel services: VIP airport fast-track, luxury hotel reservations, visa assistance, concierge service, travel insurance, and MICE events."
        keywords="VIP airport service Egypt, hotel reservation Cairo, visa assistance Egypt, travel concierge, travel insurance, MICE Egypt, corporate travel"
        canonicalPath="/services"
      />

      <div className="min-h-screen bg-[var(--theme-background)]">
        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-28 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={`${CDN}/vip-lounge_6e90c366.jpg`}
              alt="VIP Lounge"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--theme-background)]/85 via-[var(--theme-background)]/60 to-[var(--theme-background)]" />
          </div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Premium Services
              </span>
              <h1 className="font-[var(--font-display)] text-3xl sm:text-2xl sm:text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Exceptional Travel{" "}
                <span className="text-[var(--theme-primary)]">Services</span>
              </h1>
              <p className="text-white/70 text-lg md:text-xl max-w-2xl mb-8">
                From VIP airport fast-track to personal concierge — we handle
                every detail so you can focus on the experience.
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-8 mt-8">
                {[
                  { value: "10+", label: "Premium Services" },
                  { value: "500+", label: "Partner Hotels" },
                  { value: "24/7", label: "Support Available" },
                  { value: "50+", label: "Countries Covered" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <span className="font-[var(--font-display)] text-2xl font-bold text-[var(--theme-primary)]">
                      {stat.value}
                    </span>
                    <p className="text-white/50 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Highlighted Services - Large Cards */}
        <section className="py-12 sm:py-16 md:py-20 bg-[var(--theme-background)]">
          <div className="container">
            <div className="text-center mb-12">
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                Most Requested
              </span>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Signature Services
              </h2>
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
            </div>

            <div className="space-y-8">
              {services
                .filter((s) => s.highlight)
                .map((service, i) => {
                  const Icon = service.icon;
                  const isReversed = i % 2 !== 0;
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: i * 0.15 }}
                      className={`group flex flex-col ${
                        isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
                      } border border-white/8 overflow-hidden hover:border-[var(--theme-primary)]/30 transition-all duration-500`}
                    >
                      {/* Image */}
                      <div className="lg:w-1/2">
                        <WatermarkImage
                          src={service.image}
                          alt={service.title}
                          className="h-72 lg:h-full"
                          imgClassName="group-hover:scale-105 transition-transform duration-700"
                          watermarkPosition="bottom-right"
                          watermarkOpacity={0.25}
                          watermarkSize="h-6"
                          loading="lazy"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-background)]/40 to-transparent" />
                        </WatermarkImage>
                      </div>

                      {/* Content */}
                      <div className="lg:w-1/2 p-8 lg:p-10 flex flex-col justify-center bg-[var(--theme-background)]">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 border border-[var(--theme-primary)]/30">
                            <Icon
                              size={20}
                              className="text-[var(--theme-primary)]"
                            />
                          </div>
                          <span className="text-[var(--theme-primary)]/60 text-xs uppercase tracking-wider">
                            {service.subtitle}
                          </span>
                        </div>

                        <h3 className="font-[var(--font-display)] text-2xl lg:text-3xl font-bold text-white mb-3 group-hover:text-[var(--theme-primary)] transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-white/50 text-sm mb-6 leading-relaxed">
                          {service.longDescription}
                        </p>

                        <div className="grid grid-cols-2 gap-2 mb-6">
                          {service.features.map((f) => (
                            <span
                              key={f}
                              className="flex items-center gap-2 text-xs text-white/60"
                            >
                              <Check
                                size={12}
                                className="text-[var(--theme-primary)] shrink-0"
                              />
                              {f}
                            </span>
                          ))}
                        </div>

                        <a
                          href="/booking"
                          className="inline-flex items-center gap-2 text-[var(--theme-primary)] text-sm font-medium hover:underline w-fit"
                        >
                          Request This Service
                          <ArrowRight size={14} />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </div>
        </section>

        {/* All Services Grid */}
        <section
          ref={gridRef}
          className="py-12 sm:py-16 md:py-20 bg-[var(--theme-background)]"
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                All Services
              </h2>
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={gridInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="group bg-[var(--theme-background)] border border-white/8 p-5 hover:border-[var(--theme-primary)]/40 transition-all duration-500"
                  >
                    <div className="p-2 border border-[var(--theme-primary)]/20 w-fit mb-4 group-hover:border-[var(--theme-primary)]/50 transition-colors">
                      <Icon size={20} className="text-[var(--theme-primary)]" />
                    </div>
                    <h3 className="font-[var(--font-display)] text-sm font-semibold text-white mb-2 group-hover:text-[var(--theme-primary)] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-white/40 text-xs mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    <a
                      href="/booking"
                      className="text-[var(--theme-primary)]/60 text-xs hover:text-[var(--theme-primary)] transition-colors flex items-center gap-1"
                    >
                      Learn More <ArrowRight size={10} />
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section
          ref={whyRef}
          className="py-12 sm:py-16 md:py-20 bg-[var(--theme-background)] border-t border-white/5"
        >
          <div className="container">
            <div className="text-center mb-12">
              <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
                The VANIR Difference
              </span>
              <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Why Choose Our Services
              </h2>
              <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Crown,
                  title: "Premium Quality",
                  desc: "Every service meets our exacting standards of luxury and excellence.",
                },
                {
                  icon: Globe,
                  title: "Global Network",
                  desc: "Partnerships with top hotels, airlines, and service providers worldwide.",
                },
                {
                  icon: Phone,
                  title: "24/7 Support",
                  desc: "Round-the-clock multilingual assistance wherever you are.",
                },
                {
                  icon: Shield,
                  title: "Trusted & Secure",
                  desc: "Licensed, insured, and trusted by thousands of travelers.",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={whyInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="text-center p-6"
                  >
                    <div className="inline-flex p-3 border border-[var(--theme-primary)]/30 mb-4">
                      <Icon size={24} className="text-[var(--theme-primary)]" />
                    </div>
                    <h3 className="font-[var(--font-display)] text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/40 text-sm">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 md:py-20 bg-[var(--theme-background)] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent, transparent 35px, #D4A853 35px, #D4A853 36px)",
              }}
            />
          </div>
          <div className="container relative z-10 text-center">
            <span className="font-[var(--font-script)] text-[var(--theme-primary)] text-xl mb-3 block">
              Ready to Experience the Difference?
            </span>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Let Us Handle Everything
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-8">
              Contact our team to discuss your travel needs and let us create a
              seamless, luxurious experience for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/booking"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--theme-primary)] text-[var(--theme-background)] font-semibold hover:bg-[var(--theme-primary-light)] transition-colors"
              >
                Book a Service
                <ArrowRight size={16} />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 border border-[var(--theme-primary)]/30 text-[var(--theme-primary)] font-semibold hover:bg-[var(--theme-primary)] hover:text-[var(--theme-background)] transition-all"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
