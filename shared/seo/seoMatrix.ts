export interface SEOMetadata {
  route: string;
  metaTitle: string;
  metaDescription: string;
  seoContent: string;
}

export type SEOMatrix = Record<string, SEOMetadata>;

/**
 * Naming convention:
 * - Core/service pages keep plain keys (e.g. "home", "hotels", "private-jet")
 * - Destination pages use "destination-{slug}" (e.g. "destination-dubai")
 *
 * Expansion pattern for destination sub-routes:
 * - Add one root destination entry for `/destinations/{slug}`
 * - Any deeper route (e.g. `/destinations/{slug}/hotels`) inherits that root SEO
 *   unless a future exact route is added to this matrix.
 */
export const vanirSeoMatrix: SEOMatrix = {
  home: {
    route: "/",
    metaTitle: "Vanir Group | Ultra-Luxury Travel Concierge & Private Aviation",
    metaDescription:
      "Welcome to Vanir Group. We orchestrate uncompromising luxury travel experiences, private jet charters, elite villa bookings, and bespoke global concierge services.",
    seoContent:
      "Vanir Group stands as the pinnacle of elite travel management. We blend ancient heritage, meticulous modern execution, and absolute confidential security to deliver unparalleled global itineraries for world leaders, executives, and discerning families.",
  },
  about: {
    route: "/about",
    metaTitle: "The Sovereign Standard | About Vanir Group",
    metaDescription:
      "Discover the philosophy behind Vanir Group. We are global connoisseurs dedicated to redefining the benchmarks of luxury tourism and elite logistics.",
    seoContent:
      "At Vanir Group, we believe that time and privacy are the ultimate luxuries. Our global network of premium partners enables us to execute flawlessly across aviation, hospitality, and custom private expeditions, delivering absolute peace of mind.",
  },
  hotels: {
    route: "/hotels",
    metaTitle: "Luxury Hotels & Elite Resorts Worldwide | Vanir Group",
    metaDescription:
      "Discover an uncompromising collection of ultra-luxury hotels and premium resorts with Vanir Group. Experience bespoke five-star hospitality globally.",
    seoContent:
      "Vanir Group curates an uncompromising collection of the world's most prestigious hospitality properties. From private overwater villas in the Maldives to elite architectural icons, our portfolio redefines luxury with absolute privacy and highly personalized butler services.",
  },
  "day-trips": {
    route: "/day-trips",
    metaTitle: "Bespoke Luxury Day Trips & Private Escapes | Vanir Group",
    metaDescription:
      "Elevate your limited time with exclusive single-day luxury journeys. Private yachts, helicopter transfers, and custom day tours tailored perfectly.",
    seoContent:
      "Time is the ultimate luxury. Our exclusively tailored single-day expeditions are curated for those who demand immediate, high-impact immersion. Whether chartering a private luxury yacht across the Mediterranean or boarding a private helicopter for a secluded vineyard lunch.",
  },
  mice: {
    route: "/mice",
    metaTitle: "Elite MICE Corporate Events & Summits | Vanir Group",
    metaDescription:
      "Seamless end-to-end event management for international board meetings, corporate conferences, and high-profile luxury exhibitions worldwide.",
    seoContent:
      "Elevate your corporate events into legendary global benchmarks. Vanir Group provides end-to-end management for high-profile board meetings, international symposia, and luxury exhibitions, securing top-tier high-security venues and advanced technical infrastructure.",
  },
  "private-jet": {
    route: "/private-jet",
    metaTitle: "Private Jet Charter & Luxury Aviation | Vanir Group",
    metaDescription:
      "Access a world-class fleet of private jets on demand. Fly globally on your own schedule with absolute confidential security and fine dining.",
    seoContent:
      "Transcend the constraints of commercial travel. Vanir Group grants you on-demand access to a world-class fleet of heavy jets, ultra-long-range aircraft, and executive airliners. Experience absolute confidential security inside state-of-the-art airborne boardrooms.",
  },
  "fast-track": {
    route: "/fast-track",
    metaTitle: "VIP Airport Fast Track & Concierge Services | Vanir Group",
    metaDescription:
      "Bypass airport crowds with our luxury Fast Track concierge. Secure rapid customs clearance and private tarmac-side transfers worldwide.",
    seoContent:
      "Arrive with absolute peace of mind. Our elite global Fast Track services transform chaotic airport terminals into serene, rapid transitions. From tarmac-side luxury sedan transfers to dedicated customs clearance officers and exclusive access to high-end private lounges.",
  },
  visa: {
    route: "/visa",
    metaTitle: "Premium Diplomatic & Corporate Visa Assistance | Vanir Group",
    metaDescription:
      "Accelerate your global mobility. Vanir Group provides high-priority concierge visa processing and multi-entry permit management for elite clients.",
    seoContent:
      "Acquire freedom of movement across continents with our premium diplomatic visa assistance. Specializing in high-priority processing, multi-entry corporate permits, and urgent elite travel document expediting, our expert legal agents manage all institutional paperwork.",
  },
  esim: {
    route: "/esim",
    metaTitle: "Premium International eSIM Solutions | Vanir Group",
    metaDescription:
      "Secure immediate, high-bandwidth global data network access across 190+ countries with Vanir Group's encrypted enterprise-grade eSIM.",
    seoContent:
      "Stay seamlessly connected across 190+ countries without the inconvenience of physical SIM cards or dropped data roaming connections. Vanir Group's premium eSIM profiles deliver immediate, high-bandwidth enterprise-grade data networks the moment your private aircraft touches down.",
  },
  "flights-booking": {
    route: "/flights-booking",
    metaTitle: "First-Class Commercial Flights & Suite Bookings | Vanir Group",
    metaDescription:
      "Reserve unlisted first-class ticket inventories, private commercial cabins, and luxury long-haul flight segments through our elite flight desk.",
    seoContent:
      "For journeys where commercial flight paths are preferred, Vanir Group secures premier allocation in the world's most advanced double-bed suites, private commercial cabins, and ultra-exclusive long-haul segments. Access unlisted ticket inventories managed around the clock.",
  },
  "hotels-booking": {
    route: "/hotels-booking",
    metaTitle: "Luxury Hotel Booking Portal & Suite Upgrades | Vanir Group",
    metaDescription:
      "Secure instant suite upgrades and elite hospitality benefits by booking through the Vanir Group direct luxury reservation platform.",
    seoContent:
      "Experience our seamless real-time booking engine integrated directly with the world's finest boutique resorts and luxury collection five-star networks. Booking your suites through Vanir Group automatically unlocks premier privileges and suite upgrades.",
  },
  tours: {
    route: "/tours",
    metaTitle: "Curated Heritage Tours & Private Explorations | Vanir Group",
    metaDescription:
      "Unveil ancient wonders with exclusive after-hours access and private tours led by world-renowned experts and Egyptologists. Luxury redefined.",
    seoContent:
      "Unveil the profound secrets of human civilization with private, after-hours access to historically significant monuments, restricted museum vaults, and elite architectural treasures. Led exclusively by world-renowned Egyptologists and academic experts.",
  },
  insurance: {
    route: "/insurance",
    metaTitle: "Elite Travel Insurance Shields & Asset Protection | Vanir Group",
    metaDescription:
      "Comprehensive travel insurance shields designed for ultra-high-net-worth portfolios. Secure multi-million dollar asset and medical protection.",
    seoContent:
      "Safeguard your global movements with travel insurance packages designed specifically for ultra-high-net-worth portfolios. Vanir Group coordinates massive global asset protections, immediate private jet medical evacuation guarantees, and high-value personal effects coverage.",
  },
  groups: {
    route: "/groups",
    metaTitle: "Private Family Retreats & Group Travel Logistics | Vanir Group",
    metaDescription:
      "Masterfully synchronized logistics for private group retreats, corporate getaways, and exclusive island or luxury estate takeovers worldwide.",
    seoContent:
      "Coordinating multi-generational travel or private family escapes requires absolute precision. Vanir Group specializes in synchronized logistics, private island takeovers, and curated multi-villa luxury operations, matching specific wellness and security preferences.",
  },
  news: {
    route: "/news",
    metaTitle: "The Vanir Chronicle | Luxury Travel News & Insights",
    metaDescription:
      "Stay informed with curated market reviews, upcoming travel hotspot analyses, and exclusive editorial perspectives from the pinnacle of luxury tourism.",
    seoContent:
      "Stay ahead of the global trend line with Vanir Group's exclusive editorial publication. From critical reviews of newly opened super-luxury properties to secret luxury yacht destinations and insider lifestyle shifts, our content team presents sharp, curated analyses.",
  },
  affiliated: {
    route: "/affiliated",
    metaTitle: "Elite Strategic Partnerships & Affiliation | Vanir Group",
    metaDescription:
      "Connect with our ultra-luxury global network. Discover strategic affiliate partnerships for concierge firms, private aviation, and luxury brands.",
    seoContent:
      "Vanir Group partners exclusively with premier concierge networks, luxury automotive makers, top-tier private wealth managers, and certified aviation brokers globally. Our affiliate network is built on trust, impeccable delivery, and mutual brand elevation.",
  },
  packages: {
    route: "/packages",
    metaTitle: "Curated Seasonal Luxury Travel Packages | Vanir Group",
    metaDescription:
      "End-to-end fully orchestrated seasonal masterpieces combining private air transit, finest penthouse suites, and custom luxury experiences.",
    seoContent:
      "Our legendary travel packages represent completely seamless, end-to-end masterpieces of luxury tourism. Combining private air transit, finest penthouse suite allocations, personal diplomatic security detail, and completely exclusive private event access.",
  },
  "destination-egypt": {
    route: "/destinations/egypt",
    metaTitle: "Luxury Travel Egypt & Private Heritage Expeditions | Vanir Group",
    metaDescription:
      "Experience Egypt like never before. Exclusive access to ancient wonders, private Nile cruises, and high-end stays in Cairo and the Red Sea.",
    seoContent:
      "Vanir Group merges Egypt's timeless, ancient civilization with ultra-modern luxury execution. We arrange elite, private after-hours tours of the Giza Pyramids, luxury yacht charters along the Red Sea, and premier accommodations at the New Administrative Capital's finest properties.",
  },
  "destination-dubai": {
    route: "/destinations/dubai",
    metaTitle: "Elite Dubai Ultra-Luxury Experiences & Yacht Charters | Vanir Group",
    metaDescription:
      "Immerse yourself in Dubai's premier luxury ecosystem. Private penthouse allocations, superyacht charters, and exclusive VIP desert safaris.",
    seoContent:
      "Dubai represents the frontier of modern architectural luxury. Vanir Group secures unlisted high-floor suites at the city's most iconic properties, schedules private mega-yacht voyages across the Dubai Marina, and grants on-demand access to high-security elite environments.",
  },
  "destination-maldives": {
    route: "/destinations/maldives",
    metaTitle: "Private Island Takeovers & Luxury Maldives Retreats | Vanir Group",
    metaDescription:
      "Escape to absolute privacy. Vanir Group curates exclusive overwater villa reservations and private island takeovers in the Maldives.",
    seoContent:
      "Discover unmatched seclusion in the Indian Ocean. Our luxury travel desk coordinates private seaplane transfers, deep-sea exploration charters, and completely customized wellness retreats across the Maldives' most secluded five-star private islands.",
  },
  "destination-switzerland": {
    route: "/destinations/switzerland",
    metaTitle: "Elite Alpine Chalets & Luxury Switzerland Escapes | Vanir Group",
    metaDescription:
      "Experience the pinnacle of alpine luxury. Private helicopter transit, exclusive ski chalets in Zermatt, and premium medical wellness retreats.",
    seoContent:
      "Switzerland offers unparalleled serene luxury. Vanir Group delivers turnkey alpine travel, managing confidential private estate takeovers in St. Moritz and Zermatt, alongside premium private aviation handling across Switzerland's elite airfields.",
  },
  "destination-greece": {
    route: "/destinations/greece",
    metaTitle: "Bespoke Aegean Sea Yacht Charters & Luxury Greece | Vanir Group",
    metaDescription:
      "Sail the Greek islands in absolute elegance. Exclusive luxury villa bookings in Mykonos and Santorini paired with private catamaran charters.",
    seoContent:
      "Experience the vibrant heritage of the Aegean under our meticulous care. Vanir Group crafts bespoke island-hopping itineraries utilizing premium private yachts, securing clifftop infinity suites away from public crowds, and arranging private after-hours fine dining.",
  },
  "destination-italy": {
    route: "/destinations/italy",
    metaTitle: "Curated Cultural Epics & Luxury Italy Journeys | Vanir Group",
    metaDescription:
      "Bespoke historical immersions in Rome, elite private villas in Lake Como, and exclusive vineyard tours in Tuscany with Vanir Group.",
    seoContent:
      "Italy is a masterclass in art, culture, and luxury living. Vanir Group grants exclusive after-hours access to historical landmarks, books private lakeside palazzos in Como, and coordinates custom culinary expeditions tailored to the world's most discerning palates.",
  },
};

const seoByRoute = Object.values(vanirSeoMatrix).reduce<Record<string, SEOMetadata>>((acc, entry) => {
  acc[entry.route] = entry;
  return acc;
}, {});

export function normalizeRoute(route: string): string {
  const clean = (route || "/").split("#")[0].split("?")[0].trim() || "/";
  if (clean === "/") return clean;
  return clean.endsWith("/") ? clean.slice(0, -1) : clean;
}

export function getSEOMetadata(route: string): SEOMetadata | null {
  const normalizedRoute = normalizeRoute(route);
  const exactMatch = seoByRoute[normalizedRoute];
  if (exactMatch) return exactMatch;

  if (normalizedRoute.startsWith("/destinations/")) {
    const routeParts = normalizedRoute.split("/");
    const destinationSlug = routeParts[2];
    if (!destinationSlug) return null;
    const fallbackRoute = `/destinations/${destinationSlug}`;
    return seoByRoute[fallbackRoute] ?? null;
  }

  return null;
}

export function getMetaTitle(route: string): string | undefined {
  return getSEOMetadata(route)?.metaTitle;
}

export function getMetaDescription(route: string): string | undefined {
  return getSEOMetadata(route)?.metaDescription;
}

export function getSeoContent(route: string): string | undefined {
  return getSEOMetadata(route)?.seoContent;
}
