import { serial, pgTable, text, timestamp, varchar, bigint, decimal, json, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  packageName: varchar("packageName", { length: 255 }).notNull(),
  packageCategory: varchar("packageCategory", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  checkInDate: bigint("checkInDate", { mode: "number" }),
  checkOutDate: bigint("checkOutDate", { mode: "number" }),
  adults: integer("adults").default(1),
  children: integer("children").default(0),
  roomType: varchar("roomType", { length: 100 }),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  paymentMethod: text("paymentMethod").$type<"credit_card" | "paypal" | "bank_transfer">(),
  paymentStatus: text("paymentStatus").$type<"pending" | "paid" | "failed" | "refunded">().default("pending").notNull(),
  promoCode: varchar("promoCode", { length: 50 }),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }),
  specialRequests: text("specialRequests"),
  billingAddress: json("billingAddress"),
  status: text("status").$type<"pending" | "confirmed" | "cancelled" | "completed">().default("pending").notNull(),
  confirmationCode: varchar("confirmationCode", { length: 20 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  guestName: varchar("guestName", { length: 255 }),
  guestAvatarUrl: text("guestAvatarUrl"),
  tripName: varchar("tripName", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  photoUrls: json("photoUrls"),
  travelDate: bigint("travelDate", { mode: "number" }),
  adminReply: text("adminReply"),
  adminReplyAt: timestamp("adminReplyAt"),
  isApproved: text("isApproved").$type<"pending" | "approved" | "rejected">().default("pending").notNull(),
  helpfulCount: integer("helpfulCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  discountType: text("discountType").$type<"percentage" | "fixed">().notNull(),
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(),
  promoCode: varchar("promoCode", { length: 50 }).unique(),
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  endDate: bigint("endDate", { mode: "number" }).notNull(),
  category: varchar("category", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  imageUrl: text("imageUrl"),
  totalSpots: integer("totalSpots"),
  bookedSpots: integer("bookedSpots").default(0),
  isActive: text("isActive").$type<"active" | "inactive" | "expired">().default("active").notNull(),
  badgeText: varchar("badgeText", { length: 50 }),
  badgeColor: varchar("badgeColor", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 500 }),
  message: text("message").notNull(),
  status: text("status").$type<"new" | "read" | "replied" | "archived">().default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: integer("fileSize"),
  purpose: varchar("purpose", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;

export const galleryItems = pgTable("gallery_items", {
  id: serial("id").primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  category: varchar("category", { length: 100 }).notNull(),
  categoryAr: varchar("categoryAr", { length: 100 }),
  location: varchar("location", { length: 255 }),
  locationAr: varchar("locationAr", { length: 255 }),
  featured: text("featured").$type<"yes" | "no">().default("no").notNull(),
  aspect: text("aspect").$type<"landscape" | "portrait" | "square">().default("landscape").notNull(),
  sortOrder: integer("sortOrder").default(0),
  isVisible: text("isVisible").$type<"visible" | "hidden">().default("visible").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

export const galleryVideos = pgTable("gallery_videos", {
  id: serial("id").primaryKey(),
  thumbnailUrl: text("thumbnailUrl").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  youtubeId: varchar("youtubeId", { length: 20 }).notNull(),
  duration: varchar("duration", { length: 20 }),
  views: varchar("views", { length: 20 }),
  sortOrder: integer("sortOrder").default(0),
  isVisible: text("isVisible").$type<"visible" | "hidden">().default("visible").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type GalleryVideo = typeof galleryVideos.$inferSelect;
export type InsertGalleryVideo = typeof galleryVideos.$inferInsert;

export const aiSubscriptions = pgTable("ai_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  plan: text("plan").$type<"free" | "pro" | "enterprise">().default("free").notNull(),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0"),
  status: text("status").$type<"active" | "cancelled" | "expired">().default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  renewalDate: bigint("renewalDate", { mode: "number" }),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AISubscription = typeof aiSubscriptions.$inferSelect;
export type InsertAISubscription = typeof aiSubscriptions.$inferInsert;

export const aiCredits = pgTable("ai_credits", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull().unique(),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  totalUsed: decimal("totalUsed", { precision: 12, scale: 2 }).default("0").notNull(),
  lastResetDate: bigint("lastResetDate", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type AICredit = typeof aiCredits.$inferSelect;
export type InsertAICredit = typeof aiCredits.$inferInsert;

export const aiUsage = pgTable("ai_usage", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  type: text("type").$type<"image" | "video" | "edit">().notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  prompt: text("prompt").notNull(),
  resultUrl: text("resultUrl"),
  resultKey: varchar("resultKey", { length: 500 }),
  creditsCost: decimal("creditsCost", { precision: 10, scale: 2 }).notNull(),
  imageSize: varchar("imageSize", { length: 50 }),
  videoDuration: integer("videoDuration"),
  status: text("status").$type<"pending" | "completed" | "failed">().default("pending").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIUsage = typeof aiUsage.$inferSelect;
export type InsertAIUsage = typeof aiUsage.$inferInsert;

export const aiTransactions = pgTable("ai_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  type: text("type").$type<"purchase" | "refund" | "monthly_allowance" | "bonus">().notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  status: text("status").$type<"pending" | "completed" | "failed">().default("pending").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AITransaction = typeof aiTransactions.$inferSelect;
export type InsertAITransaction = typeof aiTransactions.$inferInsert;

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  metaTitle: varchar("metaTitle", { length: 70 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: varchar("metaKeywords", { length: 500 }),
  coverImageUrl: text("coverImageUrl"),
  category: varchar("category", { length: 100 }),
  tags: json("tags"),
  authorId: integer("authorId").references(() => users.id),
  authorName: varchar("authorName", { length: 255 }).default("VANIR GROUP"),
  status: text("status").$type<"draft" | "published" | "archived">().default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  viewCount: integer("viewCount").default(0),
  readingTime: integer("readingTime").default(5),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

export const marketingContent = pgTable("marketing_content", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  type: text("type").$type<"social_media" | "email" | "trip_description" | "blog_seo" | "ad_copy">().notNull(),
  platform: varchar("platform", { length: 50 }),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  prompt: text("prompt").notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  tone: varchar("tone", { length: 50 }),
  destination: varchar("destination", { length: 255 }),
  hashtags: json("hashtags"),
  creditsCost: decimal("creditsCost", { precision: 10, scale: 2 }).default("1"),
  isFavorite: text("isFavorite").$type<"yes" | "no">().default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketingContent = typeof marketingContent.$inferSelect;
export type InsertMarketingContent = typeof marketingContent.$inferInsert;

export const marketingCalendar = pgTable("marketing_calendar", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  contentId: integer("contentId").references(() => marketingContent.id),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  platform: varchar("platform", { length: 50 }),
  scheduledDate: bigint("scheduledDate", { mode: "number" }).notNull(),
  status: text("status").$type<"draft" | "scheduled" | "published" | "cancelled">().default("draft").notNull(),
  colorTag: varchar("colorTag", { length: 20 }).default("#D4A853"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MarketingCalendarEntry = typeof marketingCalendar.$inferSelect;
export type InsertMarketingCalendarEntry = typeof marketingCalendar.$inferInsert;

export const marketingTemplates = pgTable("marketing_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: text("type").$type<"social_media" | "email" | "trip_description" | "blog_seo" | "ad_copy">().notNull(),
  platform: varchar("platform", { length: 50 }),
  templateContent: text("templateContent").notNull(),
  systemPrompt: text("systemPrompt"),
  category: varchar("category", { length: 100 }),
  icon: varchar("icon", { length: 50 }),
  isBuiltIn: text("isBuiltIn").$type<"yes" | "no">().default("no").notNull(),
  sortOrder: integer("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketingTemplate = typeof marketingTemplates.$inferSelect;
export type InsertMarketingTemplate = typeof marketingTemplates.$inferInsert;

export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  pricePerPerson: decimal("pricePerPerson", { precision: 10, scale: 2 }).default("0"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5"),
  imageUrl: text("imageUrl"),
  highlights: text("highlights"),
  bestTimeToVisit: varchar("bestTimeToVisit", { length: 255 }),
  duration: varchar("duration", { length: 100 }),
  difficulty: text("difficulty").$type<"easy" | "moderate" | "hard">(),
  groupSize: varchar("groupSize", { length: 100 }),
  inclusions: text("inclusions"),
  exclusions: text("exclusions"),
  isActive: text("isActive").$type<"active" | "inactive">().default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull(),
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  settingValue: text("setting_value"),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
