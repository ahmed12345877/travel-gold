/*
 * Elegant Visual Effects - Subtle, refined, non-intrusive
 * Includes: Floating gold particles, ambient glow, grid pattern overlay
 * These are designed to add depth without being distracting
 */
import { useMemo } from "react";
import { motion } from "framer-motion";

/* ─── Floating Gold Dust Particles ─── */
interface DustMote {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function GoldDustParticles({
  count = 20,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const motes = useMemo<DustMote[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 12,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, [count]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {motes.map((m) => (
        <motion.div
          key={m.id}
          className="absolute rounded-full bg-[var(--theme-primary)]"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: m.size,
            height: m.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [m.opacity, m.opacity * 1.5, m.opacity],
          }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Ambient Gold Glow - Soft radial glow effect ─── */
export function AmbientGlow({
  position = "center",
  size = "md",
  className = "",
}: {
  position?:
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const posMap = {
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "top-left": "top-0 left-0 -translate-x-1/3 -translate-y-1/3",
    "top-right": "top-0 right-0 translate-x-1/3 -translate-y-1/3",
    "bottom-left": "bottom-0 left-0 -translate-x-1/3 translate-y-1/3",
    "bottom-right": "bottom-0 right-0 translate-x-1/3 translate-y-1/3",
  };
  const sizeMap = {
    sm: "w-[300px] h-[300px]",
    md: "w-[500px] h-[500px]",
    lg: "w-[700px] h-[700px]",
  };

  return (
    <div
      className={`absolute ${posMap[position]} ${sizeMap[size]} rounded-full pointer-events-none ${className}`}
      style={{
        background:
          "radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)",
        filter: "blur(60px)",
      }}
    />
  );
}

/* ─── Subtle Grid Pattern Overlay ─── */
export function GridPattern({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none opacity-[0.02] ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(212,168,83,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,168,83,0.3) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

/* ─── Decorative Line Divider ─── */
export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[var(--theme-primary)]/40" />
      <div className="w-2 h-2 rotate-45 border border-[var(--theme-primary)]/40" />
      <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[var(--theme-primary)]/40" />
    </div>
  );
}

/* ─── Animated Section Reveal ─── */
export function SectionReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Glowing Border Card ─── */
export function GlowCard({
  children,
  className = "",
  hoverGlow = true,
}: {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-sm overflow-hidden transition-all duration-500 ${
        hoverGlow
          ? "hover:border-[var(--theme-primary)]/20 hover:shadow-lg hover:shadow-[var(--theme-primary)]/5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
