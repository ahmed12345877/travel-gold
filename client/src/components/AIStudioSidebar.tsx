import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  Home,
  Grid3x3,
  Image,
  Play,
  Zap,
  Maximize2,
  MoreHorizontal,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  badge?: string;
}

export default function AIStudioSidebar() {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const { user, logout, isAuthenticated } = useAuth();

  const navItems: NavItem[] = [
    { icon: <Home size={18} />, label: "Home", path: "/" },
    { icon: <Grid3x3 size={18} />, label: "Library", path: "/ai-studio" },
    { icon: <Image size={18} />, label: "Image", path: "/ai-image-generator" },
    { icon: <Play size={18} />, label: "Video", path: "/ai-studio" },
    {
      icon: <Zap size={18} />,
      label: "Blueprints",
      path: "/ai-studio",
      badge: "NEW",
    },
    { icon: <Maximize2 size={18} />, label: "Upscaler", path: "/ai-studio" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-[var(--card)] p-2 rounded-lg border border-[var(--theme-primary)]/20"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-16 bg-[var(--theme-background)] border-r border-[var(--theme-primary)]/20 flex flex-col items-center py-6 z-40 transition-all duration-300 ${
          !isOpen ? "-translate-x-full lg:translate-x-0" : ""
        }`}
      >
        {/* Logo - Clickable to go home */}
        <button
          onClick={handleLogoClick}
          className="mb-8 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          title="Go to Home"
        >
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663477605010/hMv7CdB7RdAWDPc2Ku9pP8/vanir-logo-correct_2a805e1d.png"
            alt="VANIR"
            className="h-10 w-10 object-contain"
          />
        </button>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-3 flex-1">
          {navItems.map((item, idx) => (
            <div key={`nav-item-${idx}`} className="relative group">
              <button
                onClick={() => handleNavigation(item.path)}
                className="w-10 h-10 rounded-lg bg-[var(--card)] hover:bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)] flex items-center justify-center text-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-all"
              >
                {item.icon}
                {item.badge && (
                  <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full text-[10px]">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--card)] border border-[var(--theme-primary)]/20 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.label}
              </div>
            </div>
          ))}
        </nav>

        {/* More Button */}
        <div key="more-button" className="relative group mb-3">
          <button className="w-10 h-10 rounded-lg bg-[var(--card)] hover:bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)] flex items-center justify-center text-[var(--theme-primary)] hover:text-[var(--theme-primary)] transition-all">
            <MoreHorizontal size={18} />
          </button>

          {/* Tooltip */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-[var(--card)] border border-[var(--theme-primary)]/20 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            More
          </div>
        </div>

        {/* Divider */}
        <div className="w-6 h-px bg-[var(--theme-primary)]/20 mb-3" />

        {/* Auth Buttons */}
        <div className="flex flex-col gap-2 w-full px-1">
          {!isAuthenticated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                className="w-full text-xs h-8 border-[var(--theme-primary)]/20 hover:border-[var(--theme-primary)] text-[var(--theme-primary)] px-2"
              >
                Sign Up
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                className="w-full text-xs h-8 bg-gradient-to-r from-[var(--theme-primary)] to-[#B8860B] hover:from-[#E6C200] hover:to-[var(--theme-primary)] text-black px-2"
              >
                Sign In
              </Button>
            </>
          ) : (
            <>
              <div className="text-xs text-[var(--theme-primary)] text-center truncate px-1 py-1">
                {user?.name || "User"}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full text-xs h-8 border-[var(--theme-primary)]/20 hover:border-red-500 text-[var(--theme-primary)] hover:text-red-500 px-2"
              >
                <LogOut size={12} />
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
