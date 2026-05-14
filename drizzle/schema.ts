import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  avatarUrl: text("avatarUrl"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bookings table - stores travel booking records
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  /** Guest name for non-authenticated bookings */
  guestName: varchar("guestName", { length: 255 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  guestPhone: varchar("guestPhone", { length: 32 }),
  /** Package details */
  packageName: varchar("packageName", { length: 255 }).notNull(),
  packageCategory: varchar("packageCategory", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  /** Trip details */
  checkInDate: bigint("checkInDate", { mode: "number" }),
  checkOutDate: bigint("checkOutDate", { mode: "number" }),
  adults: int("adults").default(1),
  children: int("children").default(0),
  roomType: varchar("roomType", { length: 100 }),
  /** Pricing */
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  /** Payment */
  paymentMethod: mysqlEnum("paymentMethod", [
    "credit_card",
    "paypal",
    "bank_transfer",
  ]),
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending",
    "paid",
    "failed",
    "refunded",
  ])
    .default("pending")
    .notNull(),
  /** Promo code if applied */
  promoCode: varchar("promoCode", { length: 50 }),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }),
  /** Special requests */
  specialRequests: text("specialRequests"),
  /** Billing address as JSON */
  billingAddress: json("billingAddress"),
  /** Booking status */
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "cancelled",
    "completed",
  ])
    .default("pending")
    .notNull(),
  /** Confirmation code */
  confirmationCode: varchar("confirmationCode", { length: 20 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Reviews table - stores user reviews and ratings
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  /** Guest info for non-authenticated reviews */
  guestName: varchar("guestName", { length: 255 }),
  guestAvatarUrl: text("guestAvatarUrl"),
  /** Review content */
  tripName: varchar("tripName", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }),
  rating: int("rating").notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  /** Optional photo URLs as JSON array */
  photoUrls: json("photoUrls"),
  /** Travel date */
  travelDate: bigint("travelDate", { mode: "number" }),
  /** Admin reply */
  adminReply: text("adminReply"),
  adminReplyAt: timestamp("adminReplyAt"),
  /** Moderation */
  isApproved: mysqlEnum("isApproved", ["pending", "approved", "rejected"])
    .default("pending")
    .notNull(),
  /** Helpful votes */
  helpfulCount: int("helpfulCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Offers table - stores promotional offers and discounts
 */
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  /** Discount details */
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: decimal("discountValue", {
    precision: 10,
    scale: 2,
  }).notNull(),
  /** Promo code */
  promoCode: varchar("promoCode", { length: 50 }).unique(),
  /** Validity */
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  endDate: bigint("endDate", { mode: "number" }).notNull(),
  /** Offer metadata */
  category: varchar("category", { length: 100 }),
  destination: varchar("destination", { length: 255 }),
  imageUrl: text("imageUrl"),
  /** Availability */
  totalSpots: int("totalSpots"),
  bookedSpots: int("bookedSpots").default(0),
  /** Status */
  isActive: mysqlEnum("isActive", ["active", "inactive", "expired"])
    .default("active")
    .notNull(),
  /** Badge text like "FLASH SALE", "EXCLUSIVE" */
  badgeText: varchar("badgeText", { length: 50 }),
  badgeColor: varchar("badgeColor", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/**
 * Contact messages table - stores contact form submissions
 */
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  subject: varchar("subject", { length: 500 }),
  message: text("message").notNull(),
  /** Status tracking */
  status: mysqlEnum("status", ["new", "read", "replied", "archived"])
    .default("new")
    .notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * File uploads table - tracks uploaded files metadata (actual bytes in S3)
 */
export const fileUploads = mysqlTable("file_uploads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  /** S3 reference */
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  /** File metadata */
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  /** Purpose: avatar, review_photo, document, etc. */
  purpose: varchar("purpose", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = typeof fileUploads.$inferInsert;

/**
 * Gallery items table - stores portfolio gallery images managed by admin
 */
export const galleryItems = mysqlTable("gallery_items", {
  id: int("id").autoincrement().primaryKey(),
  /** Image URL (CDN or S3) */
  imageUrl: text("imageUrl").notNull(),
  /** Titles */
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  /** Descriptions */
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  /** Category */
  category: varchar("category", { length: 100 }).notNull(),
  categoryAr: varchar("categoryAr", { length: 100 }),
  /** Location */
  location: varchar("location", { length: 255 }),
  locationAr: varchar("locationAr", { length: 255 }),
  /** Display options */
  featured: mysqlEnum("featured", ["yes", "no"]).default("no").notNull(),
  aspect: mysqlEnum("aspect", ["landscape", "portrait", "square"])
    .default("landscape")
    .notNull(),
  /** Sort order (lower = first) */
  sortOrder: int("sortOrder").default(0),
  /** Visibility */
  isVisible: mysqlEnum("isVisible", ["visible", "hidden"])
    .default("visible")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GalleryItem = typeof galleryItems.$inferSelect;
export type InsertGalleryItem = typeof galleryItems.$inferInsert;

/**
 * Gallery videos table - stores video gallery items
 */
export const galleryVideos = mysqlTable("gallery_videos", {
  id: int("id").autoincrement().primaryKey(),
  /** Thumbnail URL */
  thumbnailUrl: text("thumbnailUrl").notNull(),
  /** Titles */
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  /** YouTube video ID */
  youtubeId: varchar("youtubeId", { length: 20 }).notNull(),
  /** Display info */
  duration: varchar("duration", { length: 20 }),
  views: varchar("views", { length: 20 }),
  /** Sort order */
  sortOrder: int("sortOrder").default(0),
  /** Visibility */
  isVisible: mysqlEnum("isVisible", ["visible", "hidden"])
    .default("visible")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GalleryVideo = typeof galleryVideos.$inferSelect;
export type InsertGalleryVideo = typeof galleryVideos.$inferInsert;

/**
 * AI Studio Subscriptions - stores user subscription plans
 */
export const aiSubscriptions = mysqlTable("ai_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .references(() => users.id)
    .notNull(),
  /** Plan type */
  plan: mysqlEnum("plan", ["free", "pro", "enterprise"])
    .default("free")
    .notNull(),
  /** Pricing */
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default(
    "0",
  ),
  /** Subscription status */
  status: mysqlEnum("status", ["active", "cancelled", "expired"])
    .default("active")
    .notNull(),
  /** Stripe subscription ID */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  /** Dates */
  startDate: bigint("startDate", { mode: "number" }).notNull(),
  renewalDate: bigint("renewalDate", { mode: "number" }),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AISubscription = typeof aiSubscriptions.$inferSelect;
export type InsertAISubscription = typeof aiSubscriptions.$inferInsert;

/**
 * AI Studio Credits - tracks user credit balance
 */
export const aiCredits = mysqlTable("ai_credits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .references(() => users.id)
    .notNull()
    .unique(),
  /** Credit balance */
  balance: decimal("balance", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  /** Lifetime credits used */
  totalUsed: decimal("totalUsed", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  /** Last reset date */
  lastResetDate: bigint("lastResetDate", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AICredit = typeof aiCredits.$inferSelect;
export type InsertAICredit = typeof aiCredits.$inferInsert;

/**
 * AI Studio Usage - tracks individual generation requests
 */
export const aiUsage = mysqlTable("ai_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .references(() => users.id)
    .notNull(),
  /** Generation type */
  type: mysqlEnum("type", ["image", "video", "edit"]).notNull(),
  /** Model used */
  model: varchar("model", { length: 100 }).notNull(), // "dall-e-3", "runway-ml", etc
  /** Prompt/description */
  prompt: text("prompt").notNull(),
  /** Result */
  resultUrl: text("resultUrl"),
  resultKey: varchar("resultKey", { length: 500 }), // S3 key
  /** Cost in credits */
  creditsCost: decimal("creditsCost", { precision: 10, scale: 2 }).notNull(),
  /** Metadata */
  imageSize: varchar("imageSize", { length: 50 }), // "512x512", "1024x1024", etc
  videoDuration: int("videoDuration"), // in seconds
  status: mysqlEnum("status", ["pending", "completed", "failed"])
    .default("pending")
    .notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIUsage = typeof aiUsage.$inferSelect;
export type InsertAIUsage = typeof aiUsage.$inferInsert;

/**
 * AI Studio Transactions - tracks credit purchases and refunds
 */
export const aiTransactions = mysqlTable("ai_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .references(() => users.id)
    .notNull(),
  /** Transaction type */
  type: mysqlEnum("type", [
    "purchase",
    "refund",
    "monthly_allowance",
    "bonus",
  ]).notNull(),
  /** Amount */
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  /** Payment info */
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  /** Status */
  status: mysqlEnum("status", ["pending", "completed", "failed"])
    .default("pending")
    .notNull(),
  /** Description */
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AITransaction = typeof aiTransactions.$inferSelect;
export type InsertAITransaction = typeof aiTransactions.$inferInsert;

/**
 * Blog posts table - stores SEO-optimized travel articles
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  /** URL slug for SEO-friendly URLs */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  /** Content */
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  /** SEO fields */
  metaTitle: varchar("metaTitle", { length: 70 }),
  metaDescription: varchar("metaDescription", { length: 160 }),
  metaKeywords: varchar("metaKeywords", { length: 500 }),
  /** Media */
  coverImageUrl: text("coverImageUrl"),
  /** Categorization */
  category: varchar("category", { length: 100 }),
  tags: json("tags"),
  /** Author */
  authorId: int("authorId").references(() => users.id),
  authorName: varchar("authorName", { length: 255 }).default("VANIR GROUP"),
  /** Publishing */
  status: mysqlEnum("status", ["draft", "published", "archived"])
    .default("draft")
    .notNull(),
  publishedAt: timestamp("publishedAt"),
  /** Engagement */
  viewCount: int("viewCount").default(0),
  readingTime: int("readingTime").default(5),
  /** Timestamps */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Marketing Content - stores AI-generated marketing content
 */
export const marketingContent = mysqlTable("marketing_content", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .references(() => users.id)
    .notNull(),
  /** Content type */
  type: mysqlEnum("type", [
    "social_media",
    "email",
    "trip_description",
    "blog_seo",
    "ad_copy",
  ]).notNull(),
  /** Platform (for social media) */
  platform: varchar("platform", { length: 50 }), // instagram, facebook, twitter, linkedin, tiktok
  /** Content */
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  /** Generation metadata */
  prompt: text("prompt").notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  tone: varchar("tone", { length: 50 }), // professional, casual, luxurious, adventurous
  destination: varchar("destination", { length: 255 }),
  /** Hashtags (JSON array) */
  hashtags: json("hashtags"),
  /** Credits used */
  creditsCost: decimal("creditsCost", { precision: 10, scale: 2 }).default("1"),
  /** Status */
  isFavorite: mysqlEnum("isFavorite", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketingContent = typeof marketingContent.$inferSelect;
export type InsertMarketingContent = typeof marketingContent.$inferInsert;

/**
 * Marketing Calendar - content scheduling
 */
export const marketingCalendar = mysqlTable("marketing_calendar", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .references(() => users.id)
    .notNull(),
  /** Content reference */
  contentId: int("contentId").references(() => marketingContent.id),
  /** Calendar entry */
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  /** Platform */
  platform: varchar("platform", { length: 50 }),
  /** Scheduling */
  scheduledDate: bigint("scheduledDate", { mode: "number" }).notNull(),
  /** Status */
  status: mysqlEnum("status", ["draft", "scheduled", "published", "cancelled"])
    .default("draft")
    .notNull(),
  /** Color tag for calendar display */
  colorTag: varchar("colorTag", { length: 20 }).default("#D4A853"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketingCalendarEntry = typeof marketingCalendar.$inferSelect;
export type InsertMarketingCalendarEntry =
  typeof marketingCalendar.$inferInsert;

/**
 * Marketing Templates - pre-built templates for tourism content
 */
export const marketingTemplates = mysqlTable("marketing_templates", {
  id: int("id").autoincrement().primaryKey(),
  /** Template info */
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  /** Template type */
  type: mysqlEnum("type", [
    "social_media",
    "email",
    "trip_description",
    "blog_seo",
    "ad_copy",
  ]).notNull(),
  /** Platform */
  platform: varchar("platform", { length: 50 }),
  /** Template content (with placeholders like {{destination}}, {{price}}) */
  templateContent: text("templateContent").notNull(),
  /** System prompt for AI generation */
  systemPrompt: text("systemPrompt"),
  /** Category */
  category: varchar("category", { length: 100 }), // seasonal, promotional, informational, engagement
  /** Icon name from lucide */
  icon: varchar("icon", { length: 50 }),
  /** Is built-in (not deletable) */
  isBuiltIn: mysqlEnum("isBuiltIn", ["yes", "no"]).default("no").notNull(),
  /** Sort order */
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketingTemplate = typeof marketingTemplates.$inferSelect;
export type InsertMarketingTemplate = typeof marketingTemplates.$inferInsert;

/**
 * Destinations table - stores travel destinations
 */
export const destinations = mysqlTable("destinations", {
  id: int("id").autoincrement().primaryKey(),
  /** Basic info */
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  /** Pricing and rating */
  pricePerPerson: decimal("pricePerPerson", {
    precision: 10,
    scale: 2,
  }).default("0"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5"),
  /** Media */
  imageUrl: text("imageUrl"),
  /** Details */
  highlights: text("highlights"),
  bestTimeToVisit: varchar("bestTimeToVisit", { length: 255 }),
  duration: varchar("duration", { length: 100 }),
  difficulty: mysqlEnum("difficulty", ["easy", "moderate", "hard"]),
  groupSize: varchar("groupSize", { length: 100 }),
  inclusions: text("inclusions"),
  exclusions: text("exclusions"),
  /** Status */
  isActive: mysqlEnum("isActive", ["active", "inactive"])
    .default("active")
    .notNull(),
  /** Timestamps */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;

/**
 * Site Settings - key-value store for all admin-configurable settings.
 * Categories: social, company, theme, seo, connectors, navbar, backup
 */
export const siteSettings = mysqlTable("site_settings", {
  id: int("id").autoincrement().primaryKey(),
  /** Setting category for grouping */
  category: varchar("category", { length: 50 }).notNull(),
  /** Setting key (unique within category) */
  settingKey: varchar("setting_key", { length: 100 }).notNull(),
  /** Setting value (stored as text, parsed by app) */
  settingValue: text("setting_value"),
  /** Last updated by */
  updatedBy: int("updated_by").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
