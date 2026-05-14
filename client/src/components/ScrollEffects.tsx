/*
 * Advanced Scroll Transition Effects
 * Elegant, performant scroll-triggered animations for section transitions.
 * Uses Framer Motion + Intersection Observer for smooth reveal effects.
 */
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* ─── 1. Scroll Reveal - Multiple animation variants ─── */
type RevealVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "scale-up"
  | "scale-down"
  | "rotate-in"
  | "blur-in"
  | "clip-up"
  | "clip-left";

const variantMap: Record<RevealVariant, { hidden: object; visible: object }> = {
  "fade-up": {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-down": {
    hidden: { opacity: 0, y: -60 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0 },
  },
  "scale-up": {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1 },
  },
  "scale-down": {
    hidden: { opacity: 0, scale: 1.15 },
    visible: { opacity: 1, scale: 1 },
  },
  "rotate-in": {
    hidden: { opacity: 0, rotate: -5, y: 40 },
    visible: { opacity: 1, rotate: 0, y: 0 },
  },
  "blur-in": {
    hidden: { opacity: 0, filter: "blur(12px)", y: 30 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
  "clip-up": {
    hidden: { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" },
    visible: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
  },
  "clip-left": {
    hidden: { opacity: 0, clipPath: "inset(0% 100% 0% 0%)" },
    visible: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" },
  },
};

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.8,
  className = "",
  once = true,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px 0px" });
  const v = variantMap[variant];

  return (
    <motion.div
      ref={ref}
      initial={v.hidden as any}
      animate={(isInView ? v.visible : v.hidden) as any}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── 2. Stagger Children - Animate children one by one ─── */
export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  variant = "fade-up",
  className = "",
}: {
  children: ReactNode;
  staggerDelay?: number;
  variant?: RevealVariant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });
  const v = variantMap[variant];

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: v.hidden as any,
                visible: {
                  ...(v.visible as any),
                  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

/* ─── 3. Parallax Section - Depth effect on scroll ─── */
export function ParallaxSection({
  children,
  speed = 0.15,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, -speed * 100]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ position: "relative" }}>
      <motion.div style={{ y: smoothY }}>{children}</motion.div>
    </div>
  );
}

/* ─── 4. Scroll Progress Bar (gold accent) ─── */
export function ScrollProgressIndicator() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #D4A853, #F5E6B8, #D4A853)",
      }}
    />
  );
}

/* ─── 5. Animated Section Divider ─── */
type DividerStyle = "gold-line" | "diamond" | "wave" | "fade" | "dots";

export function AnimatedDivider({
  style = "gold-line",
  className = "",
}: {
  style?: DividerStyle;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px 0px" });

  if (style === "gold-line") {
    return (
      <div ref={ref} className={`flex items-center justify-center py-6 ${className}`}>
        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="w-20 sm:w-32 h-[1px] bg-gradient-to-r from-transparent to-[var(--theme-primary)]/50" />
          <motion.div
            className="w-2.5 h-2.5 rotate-45 border border-[var(--theme-primary)]/50"
            animate={isInView ? { rotate: [45, 225, 405] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <div className="w-20 sm:w-32 h-[1px] bg-gradient-to-l from-transparent to-[var(--theme-primary)]/50" />
        </motion.div>
      </div>
    );
  }

  if (style === "diamond") {
    return (
      <div ref={ref} className={`flex items-center justify-center py-8 gap-3 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rotate-45 bg-[var(--theme-primary)]/30"
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15, ease: "backOut" }}
          />
        ))}
      </div>
    );
  }

  if (style === "wave") {
    return (
      <div ref={ref} className={`relative py-4 overflow-hidden ${className}`}>
        <motion.svg
          viewBox="0 0 1200 40"
          className="w-full h-8"
          preserveAspectRatio="none"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.path
            d="M0,20 Q150,0 300,20 Q450,40 600,20 Q750,0 900,20 Q1050,40 1200,20"
            fill="none"
            stroke="rgba(212,168,83,0.25)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.svg>
      </div>
    );
  }

  if (style === "dots") {
    return (
      <div ref={ref} className={`flex items-center justify-center py-6 gap-2 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="rounded-full bg-[var(--theme-primary)]/30"
            style={{ width: i === 2 ? 6 : 4, height: i === 2 ? 6 : 4 }}
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          />
        ))}
      </div>
    );
  }

  // fade
  return (
    <div ref={ref} className={`py-4 ${className}`}>
      <motion.div
        className="mx-auto h-[1px] max-w-xs"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(212,168,83,0.3), transparent)",
        }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
        transition={{ duration: 1.2 }}
      />
    </div>
  );
}

/* ─── 6. Scroll-linked Opacity Fade ─── */
export function ScrollFade({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  return (
    <motion.div ref={ref} style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

/* ─── 7. Counter Animation on Scroll ─── */
export function AnimatedCounter({
  value,
  suffix = "",
  duration = 2,
  className = "",
}: {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const springValue = useSpring(0, { duration: duration * 1000 });

  if (isInView) {
    springValue.set(value);
  }

  return (
    <motion.span ref={ref} className={className}>
      {isInView ? (
        <motion.span>{springValue}</motion.span>
      ) : (
        "0"
      )}
      {suffix}
    </motion.span>
  );
}
