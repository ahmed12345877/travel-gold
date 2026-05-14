import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Booking from "./pages/Booking";
import Reviews from "./pages/Reviews";
import Offers from "./pages/Offers";
import CaseStudies from "./pages/CaseStudies";
import Destinations from "./pages/Destinations";
import Programs from "./pages/Programs";
import Services from "./pages/Services";
import Vanir from "./pages/Vanir";
import AIStudio from "./pages/AIStudio";
import AIImageGenerator from "./pages/AIImageGenerator";
import AIDashboard from "./pages/AIDashboard";
import AIPricing from "./pages/AIPricing";
import Login from "./pages/Login";
import ComponentShowcase from "./pages/ComponentShowcase";
// import PromoNotifications from "./components/PromoNotifications"; // Removed: Disabled popup notifications
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminOffers from "./pages/admin/AdminOffers";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminAIStudio from "./pages/admin/AdminAIStudio";
import AdminUsers from "./pages/admin/AdminUsers";
import DestinationsAdmin from "./pages/admin/DestinationsAdmin";
import OffersAdmin from "./pages/admin/OffersAdmin";
import BlogAdmin from "./pages/admin/BlogAdmin";
import HeroAdmin from "./pages/admin/HeroAdmin";
import PagesAdmin from "./pages/admin/PagesAdmin";
import NavbarAdmin from "./pages/admin/NavbarAdmin";
import SettingsAdmin from "./pages/admin/SettingsAdmin";
import TestimonialsAdmin from "./pages/admin/TestimonialsAdmin";
import BookingsAdmin from "./pages/admin/BookingsAdmin";
import CreditsAdmin from "./pages/admin/CreditsAdmin";
import AnalyticsAdmin from "./pages/admin/AnalyticsAdmin";
import AuditLogAdmin from "./pages/admin/AuditLogAdmin";
import PermissionsAdmin from "./pages/admin/PermissionsAdmin";
import ActivitiesAdmin from "./pages/admin/ActivitiesAdmin";
import ReviewsAdmin from "./pages/admin/ReviewsAdmin";
import MessagesAdmin from "./pages/admin/MessagesAdmin";
import ThemeAdmin from "./pages/admin/ThemeAdmin";
import SEOAdmin from "./pages/admin/SEOAdmin";
import MediaLibrary from "./pages/admin/MediaLibrary";
import BackupExport from "./pages/admin/BackupExport";
import AICommandCenter from "./pages/admin/AICommandCenter";
import Profile from "./pages/Profile";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import MarketingSuite from "./pages/MarketingSuite";
import SocialMediaGenerator from "./pages/marketing/SocialMediaGenerator";
import EmailGenerator from "./pages/marketing/EmailGenerator";
import TripDescriptionGenerator from "./pages/marketing/TripDescriptionGenerator";
import BlogSEOGenerator from "./pages/marketing/BlogSEOGenerator";
import AdCopyGenerator from "./pages/marketing/AdCopyGenerator";
import ContentCalendar from "./pages/marketing/ContentCalendar";
import { HelmetProvider } from "react-helmet-async";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/about"} component={About} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/booking"} component={Booking} />
      <Route path={"/reviews"} component={Reviews} />
      <Route path={"/offers"} component={Offers} />
      <Route path={"/case-studies"} component={CaseStudies} />
      <Route path={"/destinations"} component={Destinations} />
      <Route path={"/programs"} component={Programs} />
      <Route path={"/services"} component={Services} />
      <Route path={"/vanir"} component={Vanir} />
      <Route path={"/ai-studio"} component={AIStudio} />
      <Route path={"/ai-image-generator"} component={AIImageGenerator} />
      <Route path={"/ai-dashboard"} component={AIDashboard} />
      <Route path={"/ai-pricing"} component={AIPricing} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Login} />
      <Route path={"/sign-in"} component={Login} />
      <Route path={"/sign-up"} component={Login} />
      <Route path={"/register"} component={Login} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/marketing"} component={MarketingSuite} />
      <Route
        path={"/marketing/social-media"}
        component={SocialMediaGenerator}
      />
      <Route path={"/marketing/email"} component={EmailGenerator} />
      <Route
        path={"/marketing/trip-description"}
        component={TripDescriptionGenerator}
      />
      <Route path={"/marketing/blog-seo"} component={BlogSEOGenerator} />
      <Route path={"/marketing/ad-copy"} component={AdCopyGenerator} />
      <Route path={"/marketing/calendar"} component={ContentCalendar} />
      <Route path={"/components"} component={ComponentShowcase} />

      {/* Admin Routes */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout>
          <AnalyticsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/destinations">
        <AdminLayout>
          <DestinationsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/offers">
        <AdminLayout>
          <OffersAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/blog">
        <AdminLayout>
          <BlogAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/activities">
        <AdminLayout>
          <ActivitiesAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/gallery">
        <AdminLayout>
          <AdminGallery />
        </AdminLayout>
      </Route>
      <Route path="/admin/reviews">
        <AdminLayout>
          <ReviewsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/bookings">
        <AdminLayout>
          <BookingsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/messages">
        <AdminLayout>
          <MessagesAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </Route>
      <Route path="/admin/credits">
        <AdminLayout>
          <CreditsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/hero">
        <AdminLayout>
          <HeroAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/navbar">
        <AdminLayout>
          <NavbarAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/pages">
        <AdminLayout>
          <PagesAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/ai-studio">
        <AdminLayout>
          <AdminAIStudio />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <SettingsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/permissions">
        <AdminLayout>
          <PermissionsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/audit-log">
        <AdminLayout>
          <AuditLogAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/testimonials">
        <AdminLayout>
          <TestimonialsAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/theme">
        <AdminLayout>
          <ThemeAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/seo">
        <AdminLayout>
          <SEOAdmin />
        </AdminLayout>
      </Route>
      <Route path="/admin/media">
        <AdminLayout>
          <MediaLibrary />
        </AdminLayout>
      </Route>
      <Route path="/admin/backup">
        <AdminLayout>
          <BackupExport />
        </AdminLayout>
      </Route>
      <Route path="/admin/ai-command">
        <AdminLayout>
          <AICommandCenter />
        </AdminLayout>
      </Route>

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            {/* <PromoNotifications /> */}{" "}
            {/* Disabled: Removed popup notifications and offers */}
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
