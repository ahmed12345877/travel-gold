import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  CalendarCheck,
  Star,
  MessageSquare,
  Tag,
  Image,
  LogOut,
  PanelLeft,
  ArrowLeft,
  Crown,
  Sparkles,
  Users,
  MapPin,
  BookOpen,
  Compass,
  FileText,
  BarChart3,
  ShieldCheck,
  Coins,
  Settings,
  PanelTop,
  Navigation,
  FileStack,
  Palette,
  Globe,
  FolderOpen,
  HardDrive,
  Brain,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/admin", group: "main" },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/admin/analytics",
    group: "main",
  },
  {
    icon: MapPin,
    label: "Destinations",
    path: "/admin/destinations",
    group: "content",
  },
  { icon: Tag, label: "Offers", path: "/admin/offers", group: "content" },
  { icon: BookOpen, label: "Blog", path: "/admin/blog", group: "content" },
  {
    icon: Compass,
    label: "Activities",
    path: "/admin/activities",
    group: "content",
  },
  { icon: Image, label: "Gallery", path: "/admin/gallery", group: "content" },
  { icon: Star, label: "Reviews", path: "/admin/reviews", group: "content" },
  {
    icon: CalendarCheck,
    label: "Bookings",
    path: "/admin/bookings",
    group: "operations",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    path: "/admin/messages",
    group: "operations",
  },
  { icon: Users, label: "Users", path: "/admin/users", group: "operations" },
  {
    icon: Coins,
    label: "Credits",
    path: "/admin/credits",
    group: "operations",
  },
  {
    icon: PanelTop,
    label: "Hero Section",
    path: "/admin/hero",
    group: "design",
  },
  { icon: Navigation, label: "Navbar", path: "/admin/navbar", group: "design" },
  { icon: FileStack, label: "Pages", path: "/admin/pages", group: "design" },
  {
    icon: Palette,
    label: "Theme & Colors",
    path: "/admin/theme",
    group: "design",
  },
  {
    icon: Brain,
    label: "AI Command Center",
    path: "/admin/ai-command",
    group: "tools",
  },
  {
    icon: Sparkles,
    label: "AI Studio",
    path: "/admin/ai-studio",
    group: "tools",
  },
  { icon: Globe, label: "SEO Management", path: "/admin/seo", group: "tools" },
  {
    icon: FolderOpen,
    label: "Media Library",
    path: "/admin/media",
    group: "tools",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/admin/settings",
    group: "system",
  },
  {
    icon: ShieldCheck,
    label: "Permissions",
    path: "/admin/permissions",
    group: "system",
  },
  {
    icon: FileText,
    label: "Audit Log",
    path: "/admin/audit-log",
    group: "system",
  },
  {
    icon: HardDrive,
    label: "Backup & Export",
    path: "/admin/backup",
    group: "system",
  },
];

const SIDEBAR_WIDTH_KEY = "admin-sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--theme-surface)]">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center">
            <Crown size={28} className="text-[var(--theme-primary)]" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-2xl font-[var(--font-display)] font-bold text-white text-center">
              Admin Access Required
            </h1>
            <p className="text-sm text-white/50 font-[var(--font-body)] text-center max-w-sm">
              Sign in with your admin account to access the management
              dashboard.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="w-full bg-[var(--theme-primary)] text-[var(--theme-surface)] hover:bg-[var(--theme-primary-light)] font-[var(--font-body)] font-semibold shadow-lg hover:shadow-xl transition-all"
            size="lg"
          >
            Sign in
          </Button>
          <Link
            href="/"
            className="text-[var(--theme-primary)]/60 hover:text-[var(--theme-primary)] text-sm font-[var(--font-body)] flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} /> Back to website
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--theme-surface)]">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <Crown size={28} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-[var(--font-display)] font-bold text-white text-center">
            Access Denied
          </h1>
          <p className="text-sm text-white/50 font-[var(--font-body)] text-center">
            You don't have admin privileges. Contact the site owner for access.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--theme-primary)] text-[var(--theme-surface)] font-[var(--font-body)] font-semibold text-sm rounded-lg hover:bg-[var(--theme-primary-light)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to website
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <AdminLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </AdminLayoutContent>
    </SidebarProvider>
  );
}

type AdminLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function AdminLayoutContent({
  children,
  setSidebarWidth,
}: AdminLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = adminMenuItems.find((item) => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0 bg-[var(--theme-surface)]"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center border-b border-white/5">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-[var(--theme-primary)]/10 rounded-lg transition-colors focus:outline-none shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-[var(--theme-primary)]/60" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Crown
                    size={16}
                    className="text-[var(--theme-primary)] shrink-0"
                  />
                  <span className="font-[var(--font-display)] font-semibold text-white tracking-tight truncate text-sm">
                    Admin Panel
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-[var(--theme-surface)] overflow-y-auto">
            <SidebarMenu className="px-2 py-3">
              {(() => {
                const groups = [
                  { key: "main", label: "" },
                  { key: "content", label: "Content" },
                  { key: "operations", label: "Operations" },
                  { key: "design", label: "Design" },
                  { key: "tools", label: "Tools" },
                  { key: "system", label: "System" },
                ];
                return groups.map((group) => {
                  const items = adminMenuItems.filter(
                    (i) => i.group === group.key,
                  );
                  if (items.length === 0) return null;
                  return (
                    <div key={group.key}>
                      {group.label && !isCollapsed && (
                        <p className="text-[10px] uppercase tracking-wider text-white/20 font-semibold px-3 pt-4 pb-1">
                          {group.label}
                        </p>
                      )}
                      {group.label && isCollapsed && <div className="h-2" />}
                      {items.map((item) => {
                        const isActive = location === item.path;
                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              isActive={isActive}
                              onClick={() => setLocation(item.path)}
                              tooltip={item.label}
                              className={`h-9 transition-all font-[var(--font-body)] text-sm ${
                                isActive
                                  ? "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)] border border-white/10"
                                  : "text-white/60 hover:text-white hover:bg-[var(--theme-primary)]/5"
                              }`}
                            >
                              <item.icon
                                className={`h-4 w-4 ${isActive ? "text-[var(--theme-primary)]" : ""}`}
                              />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-white/5 bg-[var(--theme-surface)]">
            {/* Back to website link - moved to footer to prevent overlap */}
            <SidebarMenu className="mb-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setLocation("/")}
                  tooltip="Back to website"
                  className="h-9 text-white/40 hover:text-[var(--theme-primary)] hover:bg-[var(--theme-primary)]/5 font-[var(--font-body)] text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Website</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-[var(--theme-primary)]/5 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none">
                  <Avatar className="h-9 w-9 border border-[var(--theme-primary)]/30 shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-[var(--font-body)] font-medium truncate leading-none text-white">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-white/40 truncate mt-1.5 font-[var(--font-body)]">
                      Admin
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-[var(--theme-surface)] border-white/10"
              >
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-[var(--font-body)]">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--theme-primary)]/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="bg-[var(--theme-surface)]">
        {isMobile && (
          <div className="flex border-b border-white/5 h-14 items-center justify-between bg-[var(--theme-surface)]/95 px-2 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-[var(--theme-surface)]" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-white font-[var(--font-body)]">
                    {activeMenuItem?.label ?? "Admin"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
