/*
 * Design: Art Deco Luxe - Black & Gold
 * Home Page: Assembles all sections with advanced scroll transition effects
 * Color palette: Black (#0d1117), Gold (#D4A853), Light Gold (#F5E6B8)
 */
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SearchForm from "@/components/SearchForm";
import AboutSection from "@/components/AboutSection";
import ActivitiesSection from "@/components/ActivitiesSection";
import CTASection from "@/components/CTASection";
import PopularPlaces from "@/components/PopularPlaces";
import DestinationsSection from "@/components/DestinationsSection";
import StatsSection from "@/components/StatsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import SEO from "@/components/SEO";
import PageMeta from "@/components/PageMeta";
import {
  ScrollReveal,
  AnimatedDivider,
  ScrollProgressIndicator,
  ParallaxSection,
} from "@/components/ScrollEffects";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--theme-surface)]">
      <PageMeta
        title="VANIR GROUP - We Plan For Happiness | Luxury Egypt Travel"
        description="VANIR GROUP offers luxury travel packages to Egypt. Explore pyramids, Nile cruises, Red Sea resorts, and curated cultural experiences with our expert team."
        keywords="luxury travel Egypt, Nile cruise, pyramids tour, VANIR GROUP, Egypt tours, Red Sea resort, Cairo travel, luxury vacation Egypt"
        canonicalPath="/"
      />
      <SEO
        title="Luxury Travel Packages to Egypt"
        description="VANIR GROUP offers luxury travel packages to Egypt. Explore pyramids, Nile cruises, and curated cultural experiences."
        keywords="luxury travel Egypt, Nile cruise, pyramids tour, VANIR GROUP, Egypt tours, Red Sea resort, Cairo travel"
      />

      {/* Scroll Progress Bar */}
      <ScrollProgressIndicator />

      <Navbar />
      <HeroSection />

      {/* About Section - Fade up reveal */}
      <ScrollReveal variant="fade-up" duration={0.9}>
        <AboutSection />
      </ScrollReveal>

      <AnimatedDivider style="wave" />

      {/* Search Form - Scale up reveal */}
      <ScrollReveal variant="scale-up" duration={0.7}>
        <SearchForm />
      </ScrollReveal>

      <AnimatedDivider style="diamond" />

      {/* Activities - Slide from left */}
      <ScrollReveal variant="fade-left" duration={0.9}>
        <ActivitiesSection />
      </ScrollReveal>

      <AnimatedDivider style="gold-line" />

      {/* CTA - Blur in for dramatic effect */}
      <ScrollReveal variant="blur-in" duration={1}>
        <CTASection />
      </ScrollReveal>

      <AnimatedDivider style="dots" />

      {/* Popular Places - Parallax depth + fade up */}
      <ParallaxSection speed={0.08}>
        <ScrollReveal variant="fade-up" duration={0.9}>
          <PopularPlaces />
        </ScrollReveal>
      </ParallaxSection>

      <AnimatedDivider style="wave" />

      {/* Destinations - Slide from right */}
      <ScrollReveal variant="fade-right" duration={0.9}>
        <DestinationsSection />
      </ScrollReveal>

      <AnimatedDivider style="gold-line" />

      {/* Stats - Scale up for impact */}
      <ScrollReveal variant="scale-up" duration={0.8}>
        <StatsSection />
      </ScrollReveal>

      <AnimatedDivider style="diamond" />

      {/* Testimonials - Blur in for elegance */}
      <ScrollReveal variant="blur-in" duration={1}>
        <TestimonialsSection />
      </ScrollReveal>

      <AnimatedDivider style="fade" />

      {/* Blog - Clip up reveal */}
      <ScrollReveal variant="clip-up" duration={1}>
        <BlogSection />
      </ScrollReveal>

      <Footer />
      <BackToTop />
    </div>
  );
}
