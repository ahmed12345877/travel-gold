/*
 * Egyptian-Modern Hero Section
 * Combines: Ancient Egyptian patterns + Modern animations + SVG masking
 * Features: GSAP animations, SVG masks, particle effects, smooth transitions
 */

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { ArrowRight, Sparkles } from 'lucide-react';

interface EgyptianMaskProps {
  videoSrc?: string;
  imageSrc?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

/**
 * Ancient Egyptian SVG Mask Generator
 * Creates decorative pyramid patterns combined with modern shapes
 */
function EgyptianSVGMask({ id }: { id: string }) {
  return (
    <svg
      id={id}
      width="0"
      height="0"
      style={{ position: 'absolute', pointerEvents: 'none' }}
    >
      <defs>
        <mask id={`egyptian-mask-${id}`} maskUnits="objectBoundingBox" x="0%" y="0%" width="100%" height="100%">
          {/* Main pyramid shape combined with modern elements */}
          <rect width="100%" height="100%" fill="white" />

          {/* Top section - Ancient pyramid */}
          <polygon
            points="50,0 0,35 100,35"
            fill="black"
            opacity="0.85"
          />

          {/* Middle ornamental band - Egyptian pattern */}
          <rect x="5%" y="32%" width="90%" height="15%" fill="black" opacity="0.6" />

          {/* Geometric elements - Modern twist on hieroglyphics */}
          <circle cx="15%" cy="40%" r="3%" fill="black" opacity="0.7" />
          <circle cx="85%" cy="40%" r="3%" fill="black" opacity="0.7" />

          {/* Lower ornamental sections */}
          <path
            d="M 0,50 Q 25,45 50,50 T 100,50 L 100,70 Q 50,75 0,70 Z"
            fill="black"
            opacity="0.5"
          />

          {/* Hieroglyphic-inspired vertical lines */}
          {[10, 30, 50, 70, 90].map((x) => (
            <line
              key={x}
              x1={`${x}%`}
              y1="60%"
              x2={`${x}%`}
              y2="85%"
              stroke="black"
              strokeWidth="1.5%"
              opacity="0.4"
            />
          ))}

          {/* Scarab beetles - iconic Egyptian element */}
          <circle cx="20%" cy="75%" r="2.5%" fill="black" opacity="0.6" />
          <circle cx="80%" cy="75%" r="2.5%" fill="black" opacity="0.6" />

          {/* Bottom fade gradient */}
          <rect x="0%" y="85%" width="100%" height="15%" fill="black" opacity="0.3" />
        </mask>
      </defs>
    </svg>
  );
}

/**
 * Animated Egyptian ornament element
 */
function AnimatedOrnament({ delay = 0 }: { delay?: number }) {
  const ornamentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ornamentRef.current) return;

    gsap.fromTo(
      ornamentRef.current,
      {
        opacity: 0,
        y: 30,
        rotation: -15,
      },
      {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 1.2,
        delay,
        ease: 'power3.out',
      }
    );

    // Floating animation
    gsap.to(ornamentRef.current, {
      y: -15,
      duration: 3,
      delay: delay + 1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, [delay]);

  return (
    <div
      ref={ornamentRef}
      className="absolute text-6xl opacity-20"
      style={{
        textShadow: '0 0 20px rgba(212, 168, 83, 0.6)',
        pointerEvents: 'none',
      }}
    >
      ⟐
    </div>
  );
}

/**
 * Particle system for mystical ambiance
 */
function EgyptianParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const particlesCount = 20;
    const particles = [];

    for (let i = 0; i < particlesCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 rounded-full';
      particle.style.background = `rgba(212, 168, 83, ${Math.random() * 0.6 + 0.2})`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;

      containerRef.current.appendChild(particle);
      particles.push(particle);

      // Animate each particle
      gsap.to(particle, {
        y: -Math.random() * 200 - 100,
        x: Math.random() * 100 - 50,
        opacity: 0,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        delay: Math.random() * 2,
        ease: 'power1.inOut',
      });
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

/**
 * Main Hero Section Component
 */
export default function HeroSectionEgyptian({
  videoSrc = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-bg.mp4',
  imageSrc = 'https://images.unsplash.com/photo-1565008576549-bdde41d9b9a7?w=1920&h=1080&fit=crop',
  title = 'استكشف مصر الخالدة',
  subtitle = 'رحلة عبر الزمن بين الحضارة العريقة والعصرية المتحركة',
  ctaText = 'ابدأ الآن',
  ctaLink = '/destinations',
}: EgyptianMaskProps) {
  const [, navigate] = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Timeline for synchronized animations
    const tl = gsap.timeline();

    // Background media entrance
    tl.fromTo(
      mediaRef.current,
      { scale: 1.1, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: 'power2.inOut' },
      0
    );

    // Title animation - character by character
    if (titleRef.current) {
      const titleText = titleRef.current.textContent || '';
      titleRef.current.innerHTML = titleText
        .split('')
        .map((char, i) => `<span class="inline-block" style="opacity: 0;">${char}</span>`)
        .join('');

      const titleSpans = titleRef.current.querySelectorAll('span');
      tl.to(
        titleSpans,
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.4,
          ease: 'back.out',
        },
        0.3
      );
    }

    // Subtitle fade and slide
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      0.6
    );

    // CTA button animation
    tl.fromTo(
      ctaRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out' },
      0.8
    );

    // Continuous subtle movement - store reference for cleanup
    const floatTween = gsap.to(mediaRef.current, {
      y: 20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Cleanup: Kill all GSAP animations on unmount
    return () => {
      tl.kill();
      floatTween.kill();
      gsap.set(mediaRef.current, { clearProps: 'all' });
    };
  }, []);

  // Handle CTA click
  const handleCTAClick = () => {
    if (ctaRef.current) {
      gsap.to(ctaRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => navigate(ctaLink),
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-amber-900 via-amber-950 to-slate-950"
    >
      {/* Background Media - Full coverage without mask for better image display */}
      <div
        ref={mediaRef}
        className="absolute inset-0"
      >
        {videoSrc ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{
              filter: 'brightness(0.6) saturate(1.1) contrast(1.05)',
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
              filter: 'brightness(0.65) saturate(1.1) contrast(1.05)',
            }}
          />
        )}
      </div>

      {/* Gradient Overlay - Enhanced for golden Egyptian theme */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-amber-900/30 to-transparent z-10" />

      {/* Particle Effects */}
      <EgyptianParticles />

      {/* Decorative Ornaments */}
      <AnimatedOrnament delay={0.5} />
      <div className="absolute top-20 right-10">
        <AnimatedOrnament delay={0.8} />
      </div>
      <div className="absolute bottom-32 left-10">
        <AnimatedOrnament delay={1.1} />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col items-center justify-center px-4">
        {/* Glow effect behind text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-96 h-96 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(212, 168, 83, 0.3) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        {/* Title */}
        <motion.h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold text-center mb-6 text-white"
          style={{
            textShadow: `
              0 0 30px rgba(212, 168, 83, 0.6),
              0 0 60px rgba(212, 168, 83, 0.3)
            `,
            fontFamily: 'serif',
            letterSpacing: '0.05em',
          }}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg md:text-2xl text-center mb-10 max-w-2xl text-amber-100"
          style={{
            textShadow: '0 0 20px rgba(212, 168, 83, 0.4)',
            fontFamily: 'serif',
            fontStyle: 'italic',
            letterSpacing: '0.02em',
          }}
        >
          {subtitle}
        </p>

        {/* CTA Button */}
        <button
          ref={ctaRef}
          onClick={handleCTAClick}
          className="group relative px-8 py-4 text-lg font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-400/50"
          style={{
            boxShadow: '0 0 20px rgba(212, 168, 83, 0.3)',
          }}
        >
          {/* Animated background shine */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite',
            }}
          />

          <div className="relative flex items-center gap-2">
            <Sparkles size={20} />
            {ctaText}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-amber-400 rounded-full flex items-center justify-center">
            <div className="w-1 h-3 bg-amber-400 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* Styling for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
