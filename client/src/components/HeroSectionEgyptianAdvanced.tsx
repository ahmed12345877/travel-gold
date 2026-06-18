/*
 * Advanced Egyptian-Modern Hero Section with Integrated Search
 * Features: SVG masking, GSAP animations, particle effects, embedded search form
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight, Sparkles, MapPin, Calendar, Users } from 'lucide-react';

interface HeroAdvancedProps {
  videoSrc?: string;
  imageSrc?: string;
  title: string;
  subtitle: string;
}

/**
 * Advanced SVG Mask - More complex Egyptian patterns
 */
function AdvancedEgyptianMask({ id }: { id: string }) {
  return (
    <svg
      id={id}
      width="0"
      height="0"
      style={{ position: 'absolute', pointerEvents: 'none' }}
    >
      <defs>
        <mask id={`advanced-mask-${id}`} maskUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
          <rect width="100%" height="100%" fill="white" />

          {/* Main pyramid */}
          <polygon points="50,0 0,40 100,40" fill="black" opacity="0.9" />

          {/* Ornamental bands */}
          <rect x="0%" y="38%" width="100%" height="8%" fill="black" opacity="0.7" />
          <rect x="0%" y="52%" width="100%" height="6%" fill="black" opacity="0.5" />
          <rect x="0%" y="68%" width="100%" height="5%" fill="black" opacity="0.4" />

          {/* Decorative circles (inspired by lotus flowers) */}
          {[12, 25, 38, 50, 62, 75, 88].map((x) => (
            <circle
              key={`circle-${x}`}
              cx={`${x}%`}
              cy="45%"
              r="3%"
              fill="black"
              opacity="0.6"
            />
          ))}

          {/* Eye of Horus elements */}
          <ellipse cx="20%" cy="30%" rx="4%" ry="6%" fill="black" opacity="0.5" />
          <ellipse cx="80%" cy="30%" rx="4%" ry="6%" fill="black" opacity="0.5" />

          {/* Vertical pillars */}
          {[5, 20, 35, 50, 65, 80, 95].map((x) => (
            <rect
              key={`pillar-${x}`}
              x={`${x - 1}%`}
              y="45%"
              width="2%"
              height="40%"
              fill="black"
              opacity="0.3"
            />
          ))}

          {/* Bottom fade */}
          <rect x="0%" y="85%" width="100%" height="15%" fill="black" opacity="0.4" />
        </mask>
      </defs>
    </svg>
  );
}

/**
 * Floating search card with smooth animations
 */
function FloatingSearchCard() {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [guests, setGuests] = useState('2');
  const cardRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 60, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 1, delay: 1.2, ease: 'back.out' }
    );

    // Floating effect
    gsap.to(cardRef.current, {
      y: -20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  const handleSearch = () => {
    if (destination) {
      navigate(`/destinations?search=${encodeURIComponent(destination)}`);
    }
  };

  return (
    <div
      ref={cardRef}
      className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-30"
    >
      <div
        className="bg-slate-900/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-amber-500/30 shadow-2xl"
        style={{
          boxShadow: `
            0 20px 50px rgba(0, 0, 0, 0.8),
            inset 0 0 60px rgba(212, 168, 83, 0.1)
          `,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Destination Input */}
          <div className="relative">
            <label className="block text-sm font-semibold text-amber-100 mb-2">
              الوجهة
            </label>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-3 border border-amber-500/20 focus-within:border-amber-500/50 transition-colors">
              <MapPin size={18} className="text-amber-400" />
              <input
                type="text"
                placeholder="اختر الوجهة..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent flex-1 outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Check-in Date */}
          <div className="relative">
            <label className="block text-sm font-semibold text-amber-100 mb-2">
              التاريخ
            </label>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-3 border border-amber-500/20 focus-within:border-amber-500/50 transition-colors">
              <Calendar size={18} className="text-amber-400" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent flex-1 outline-none text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Guests Count */}
          <div className="relative">
            <label className="block text-sm font-semibold text-amber-100 mb-2">
              عدد الأشخاص
            </label>
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-4 py-3 border border-amber-500/20 focus-within:border-amber-500/50 transition-colors">
              <Users size={18} className="text-amber-400" />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-transparent flex-1 outline-none text-white"
              >
                <option value="1">1 شخص</option>
                <option value="2">2 شخص</option>
                <option value="3">3 أشخاص</option>
                <option value="4">4 أشخاص</option>
                <option value="5">5+ أشخاص</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="mt-6 w-full md:w-auto md:float-right group relative px-8 py-3 text-base font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 rounded-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-amber-400/50"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent" />
          <div className="relative flex items-center gap-2 justify-center md:justify-start">
            <Sparkles size={18} />
            ابحث الآن
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}

/**
 * Animated scarab beetle decoration
 */
function AnimatedScarab({ delay = 0 }: { delay?: number }) {
  const scarabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scarabRef.current) return;

    const randomDelay = delay + Math.random() * 0.5;
    gsap.fromTo(
      scarabRef.current,
      {
        opacity: 0,
        scale: 0,
        rotation: 180,
      },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1,
        delay: randomDelay,
        ease: 'back.out',
      }
    );

    // Rotation animation
    gsap.to(scarabRef.current, {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: 'none',
      delay: randomDelay + 1,
    });
  }, [delay]);

  return (
    <div
      ref={scarabRef}
      className="absolute text-5xl opacity-40"
      style={{
        textShadow: '0 0 30px rgba(212, 168, 83, 0.8)',
        pointerEvents: 'none',
      }}
    >
      ⟐
    </div>
  );
}

/**
 * Main Advanced Hero Component
 */
export default function HeroSectionEgyptianAdvanced({
  videoSrc = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-bg.mp4',
  imageSrc = 'https://images.unsplash.com/photo-1565008576549-bdde41d9b9a7?w=1920&h=1080&fit=crop',
  title = 'استكشف مصر الخالدة',
  subtitle = 'رحلة عبر الزمن بين الحضارة العريقة والعصرية المتحركة',
}: HeroAdvancedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline();

    // Media entrance with parallax
    tl.fromTo(
      mediaRef.current,
      { scale: 1.15, opacity: 0, filter: 'blur(10px)' },
      { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 2, ease: 'power2.inOut' },
      0
    );

    // Title stagger animation
    if (titleRef.current) {
      const titleText = titleRef.current.textContent || '';
      titleRef.current.innerHTML = titleText
        .split('')
        .map((char, i) => 
          char === ' ' 
            ? '<span class="inline-block" style="width: 0.3em;"></span>'
            : `<span class="inline-block" style="opacity: 0; transform: translateY(40px);">${char}</span>`
        )
        .join('');

      const titleSpans = titleRef.current.querySelectorAll('span');
      tl.to(
        titleSpans,
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.6,
          ease: 'back.out',
        },
        0.4
      );
    }

    // Subtitle
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 30, filter: 'blur(5px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' },
      0.8
    );

    // Continuous motion
    gsap.to(mediaRef.current, {
      y: 30,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
    >
      {/* SVG Masks */}
      <AdvancedEgyptianMask id="hero-advanced" />

      {/* Animated Background with Mask */}
      <div
        ref={mediaRef}
        className="absolute inset-0"
        style={{
          maskImage: `url(#advanced-mask-hero-advanced)`,
          WebkitMaskImage: `url(#advanced-mask-hero-advanced)`,
          maskSize: 'cover',
          WebkitMaskSize: 'cover',
        }}
      >
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{
              filter: 'brightness(0.65) saturate(1.3) hue-rotate(5deg)',
            }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img
            src={imageSrc}
            alt="Hero Background"
            className="w-full h-full object-cover"
            style={{
              filter: 'brightness(0.65) saturate(1.3) hue-rotate(5deg)',
            }}
          />
        )}
      </div>

      {/* Multi-layer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-900/60 to-slate-950 z-10" />

      {/* Golden glow effects */}
      <div className="absolute top-0 left-1/2 w-96 h-96 opacity-30 pointer-events-none z-5" style={{
        background: 'radial-gradient(circle, rgba(212, 168, 83, 0.4) 0%, transparent 70%)',
        filter: 'blur(80px)',
        transform: 'translate(-50%, -50%)',
      }} />

      {/* Decorative scarabs */}
      <AnimatedScarab delay={0.3} />
      <div className="absolute top-32 right-12">
        <AnimatedScarab delay={0.6} />
      </div>
      <div className="absolute bottom-40 left-12">
        <AnimatedScarab delay={0.9} />
      </div>

      {/* Content Container */}
      <div className="relative z-20 h-screen flex flex-col items-center justify-center px-4">
        {/* Title */}
        <motion.h1
          ref={titleRef}
          className="text-5xl md:text-8xl font-bold text-center mb-6 text-white leading-tight"
          style={{
            textShadow: `
              0 0 40px rgba(212, 168, 83, 0.8),
              0 0 80px rgba(212, 168, 83, 0.4),
              0 4px 20px rgba(0, 0, 0, 0.9)
            `,
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-xl md:text-3xl text-center mb-16 max-w-3xl text-amber-100 font-light"
          style={{
            textShadow: '0 0 30px rgba(212, 168, 83, 0.5)',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            letterSpacing: '0.03em',
            lineHeight: '1.8',
          }}
        >
          {subtitle}
        </p>

        {/* Search Card */}
        <FloatingSearchCard />
      </div>

      {/* Bottom decorative line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 z-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.8), transparent)',
          boxShadow: '0 0 30px rgba(212, 168, 83, 0.6)',
        }}
      />
    </div>
  );
}
