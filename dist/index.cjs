"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc7) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc7 = __getOwnPropDesc(from, key)) || desc7.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/_core/index.ts
var index_exports = {};
__export(index_exports, {
  startServer: () => startServer
});
module.exports = __toCommonJS(index_exports);
var import_config = require("dotenv/config");
var import_express2 = __toESM(require("express"), 1);
var import_http = require("http");
var import_net = __toESM(require("net"), 1);
var import_express3 = require("@trpc/server/adapters/express");

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
var import_drizzle_orm = require("drizzle-orm");
var import_mysql2 = require("drizzle-orm/mysql2");

// drizzle/schema.ts
var import_mysql_core = require("drizzle-orm/mysql-core");
var users = (0, import_mysql_core.mysqlTable)("users", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  openId: (0, import_mysql_core.varchar)("openId", { length: 64 }).notNull().unique(),
  name: (0, import_mysql_core.text)("name"),
  email: (0, import_mysql_core.varchar)("email", { length: 320 }),
  phone: (0, import_mysql_core.varchar)("phone", { length: 32 }),
  loginMethod: (0, import_mysql_core.varchar)("loginMethod", { length: 64 }),
  avatarUrl: (0, import_mysql_core.text)("avatarUrl"),
  role: (0, import_mysql_core.mysqlEnum)("role", ["user", "admin"]).default("user").notNull(),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: (0, import_mysql_core.timestamp)("lastSignedIn").defaultNow().notNull()
});
var bookings = (0, import_mysql_core.mysqlTable)("bookings", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id),
  /** Guest name for non-authenticated bookings */
  guestName: (0, import_mysql_core.varchar)("guestName", { length: 255 }),
  guestEmail: (0, import_mysql_core.varchar)("guestEmail", { length: 320 }),
  guestPhone: (0, import_mysql_core.varchar)("guestPhone", { length: 32 }),
  /** Package details */
  packageName: (0, import_mysql_core.varchar)("packageName", { length: 255 }).notNull(),
  packageCategory: (0, import_mysql_core.varchar)("packageCategory", { length: 100 }),
  destination: (0, import_mysql_core.varchar)("destination", { length: 255 }),
  /** Trip details */
  checkInDate: (0, import_mysql_core.bigint)("checkInDate", { mode: "number" }),
  checkOutDate: (0, import_mysql_core.bigint)("checkOutDate", { mode: "number" }),
  adults: (0, import_mysql_core.int)("adults").default(1),
  children: (0, import_mysql_core.int)("children").default(0),
  roomType: (0, import_mysql_core.varchar)("roomType", { length: 100 }),
  /** Pricing */
  totalPrice: (0, import_mysql_core.decimal)("totalPrice", { precision: 10, scale: 2 }),
  currency: (0, import_mysql_core.varchar)("currency", { length: 10 }).default("USD"),
  /** Payment */
  paymentMethod: (0, import_mysql_core.mysqlEnum)("paymentMethod", ["credit_card", "paypal", "bank_transfer"]),
  paymentStatus: (0, import_mysql_core.mysqlEnum)("paymentStatus", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
  /** Promo code if applied */
  promoCode: (0, import_mysql_core.varchar)("promoCode", { length: 50 }),
  discountAmount: (0, import_mysql_core.decimal)("discountAmount", { precision: 10, scale: 2 }),
  /** Special requests */
  specialRequests: (0, import_mysql_core.text)("specialRequests"),
  /** Billing address as JSON */
  billingAddress: (0, import_mysql_core.json)("billingAddress"),
  /** Booking status */
  status: (0, import_mysql_core.mysqlEnum)("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  /** Confirmation code */
  confirmationCode: (0, import_mysql_core.varchar)("confirmationCode", { length: 20 }).unique(),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var reviews = (0, import_mysql_core.mysqlTable)("reviews", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id),
  /** Guest info for non-authenticated reviews */
  guestName: (0, import_mysql_core.varchar)("guestName", { length: 255 }),
  guestAvatarUrl: (0, import_mysql_core.text)("guestAvatarUrl"),
  /** Review content */
  tripName: (0, import_mysql_core.varchar)("tripName", { length: 255 }).notNull(),
  destination: (0, import_mysql_core.varchar)("destination", { length: 255 }),
  rating: (0, import_mysql_core.int)("rating").notNull(),
  title: (0, import_mysql_core.varchar)("title", { length: 500 }),
  content: (0, import_mysql_core.text)("content").notNull(),
  /** Optional photo URLs as JSON array */
  photoUrls: (0, import_mysql_core.json)("photoUrls"),
  /** Travel date */
  travelDate: (0, import_mysql_core.bigint)("travelDate", { mode: "number" }),
  /** Admin reply */
  adminReply: (0, import_mysql_core.text)("adminReply"),
  adminReplyAt: (0, import_mysql_core.timestamp)("adminReplyAt"),
  /** Moderation */
  isApproved: (0, import_mysql_core.mysqlEnum)("isApproved", ["pending", "approved", "rejected"]).default("pending").notNull(),
  /** Helpful votes */
  helpfulCount: (0, import_mysql_core.int)("helpfulCount").default(0),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var offers = (0, import_mysql_core.mysqlTable)("offers", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  title: (0, import_mysql_core.varchar)("title", { length: 255 }).notNull(),
  description: (0, import_mysql_core.text)("description"),
  /** Discount details */
  discountType: (0, import_mysql_core.mysqlEnum)("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: (0, import_mysql_core.decimal)("discountValue", { precision: 10, scale: 2 }).notNull(),
  /** Promo code */
  promoCode: (0, import_mysql_core.varchar)("promoCode", { length: 50 }).unique(),
  /** Validity */
  startDate: (0, import_mysql_core.bigint)("startDate", { mode: "number" }).notNull(),
  endDate: (0, import_mysql_core.bigint)("endDate", { mode: "number" }).notNull(),
  /** Offer metadata */
  category: (0, import_mysql_core.varchar)("category", { length: 100 }),
  destination: (0, import_mysql_core.varchar)("destination", { length: 255 }),
  imageUrl: (0, import_mysql_core.text)("imageUrl"),
  /** Availability */
  totalSpots: (0, import_mysql_core.int)("totalSpots"),
  bookedSpots: (0, import_mysql_core.int)("bookedSpots").default(0),
  /** Status */
  isActive: (0, import_mysql_core.mysqlEnum)("isActive", ["active", "inactive", "expired"]).default("active").notNull(),
  /** Badge text like "FLASH SALE", "EXCLUSIVE" */
  badgeText: (0, import_mysql_core.varchar)("badgeText", { length: 50 }),
  badgeColor: (0, import_mysql_core.varchar)("badgeColor", { length: 20 }),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var contactMessages = (0, import_mysql_core.mysqlTable)("contact_messages", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
  email: (0, import_mysql_core.varchar)("email", { length: 320 }).notNull(),
  phone: (0, import_mysql_core.varchar)("phone", { length: 32 }),
  subject: (0, import_mysql_core.varchar)("subject", { length: 500 }),
  message: (0, import_mysql_core.text)("message").notNull(),
  /** Status tracking */
  status: (0, import_mysql_core.mysqlEnum)("status", ["new", "read", "replied", "archived"]).default("new").notNull(),
  adminNotes: (0, import_mysql_core.text)("adminNotes"),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var fileUploads = (0, import_mysql_core.mysqlTable)("file_uploads", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id),
  /** S3 reference */
  fileKey: (0, import_mysql_core.varchar)("fileKey", { length: 500 }).notNull(),
  url: (0, import_mysql_core.text)("url").notNull(),
  /** File metadata */
  filename: (0, import_mysql_core.varchar)("filename", { length: 255 }).notNull(),
  mimeType: (0, import_mysql_core.varchar)("mimeType", { length: 100 }),
  fileSize: (0, import_mysql_core.int)("fileSize"),
  /** Purpose: avatar, review_photo, document, etc. */
  purpose: (0, import_mysql_core.varchar)("purpose", { length: 50 }),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
});
var galleryItems = (0, import_mysql_core.mysqlTable)("gallery_items", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  /** Image URL (CDN or S3) */
  imageUrl: (0, import_mysql_core.text)("imageUrl").notNull(),
  /** Titles */
  title: (0, import_mysql_core.varchar)("title", { length: 255 }).notNull(),
  titleAr: (0, import_mysql_core.varchar)("titleAr", { length: 255 }),
  /** Descriptions */
  description: (0, import_mysql_core.text)("description"),
  descriptionAr: (0, import_mysql_core.text)("descriptionAr"),
  /** Category */
  category: (0, import_mysql_core.varchar)("category", { length: 100 }).notNull(),
  categoryAr: (0, import_mysql_core.varchar)("categoryAr", { length: 100 }),
  /** Location */
  location: (0, import_mysql_core.varchar)("location", { length: 255 }),
  locationAr: (0, import_mysql_core.varchar)("locationAr", { length: 255 }),
  /** Display options */
  featured: (0, import_mysql_core.mysqlEnum)("featured", ["yes", "no"]).default("no").notNull(),
  aspect: (0, import_mysql_core.mysqlEnum)("aspect", ["landscape", "portrait", "square"]).default("landscape").notNull(),
  /** Sort order (lower = first) */
  sortOrder: (0, import_mysql_core.int)("sortOrder").default(0),
  /** Visibility */
  isVisible: (0, import_mysql_core.mysqlEnum)("isVisible", ["visible", "hidden"]).default("visible").notNull(),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var galleryVideos = (0, import_mysql_core.mysqlTable)("gallery_videos", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  /** Thumbnail URL */
  thumbnailUrl: (0, import_mysql_core.text)("thumbnailUrl").notNull(),
  /** Titles */
  title: (0, import_mysql_core.varchar)("title", { length: 255 }).notNull(),
  titleAr: (0, import_mysql_core.varchar)("titleAr", { length: 255 }),
  /** YouTube video ID */
  youtubeId: (0, import_mysql_core.varchar)("youtubeId", { length: 20 }).notNull(),
  /** Display info */
  duration: (0, import_mysql_core.varchar)("duration", { length: 20 }),
  views: (0, import_mysql_core.varchar)("views", { length: 20 }),
  /** Sort order */
  sortOrder: (0, import_mysql_core.int)("sortOrder").default(0),
  /** Visibility */
  isVisible: (0, import_mysql_core.mysqlEnum)("isVisible", ["visible", "hidden"]).default("visible").notNull(),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var aiSubscriptions = (0, import_mysql_core.mysqlTable)("ai_subscriptions", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id).notNull(),
  /** Plan type */
  plan: (0, import_mysql_core.mysqlEnum)("plan", ["free", "pro", "enterprise"]).default("free").notNull(),
  /** Pricing */
  monthlyPrice: (0, import_mysql_core.decimal)("monthlyPrice", { precision: 10, scale: 2 }).default("0"),
  /** Subscription status */
  status: (0, import_mysql_core.mysqlEnum)("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  /** Stripe subscription ID */
  stripeSubscriptionId: (0, import_mysql_core.varchar)("stripeSubscriptionId", { length: 255 }),
  /** Dates */
  startDate: (0, import_mysql_core.bigint)("startDate", { mode: "number" }).notNull(),
  renewalDate: (0, import_mysql_core.bigint)("renewalDate", { mode: "number" }),
  cancelledAt: (0, import_mysql_core.timestamp)("cancelledAt"),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var aiCredits = (0, import_mysql_core.mysqlTable)("ai_credits", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id).notNull().unique(),
  /** Credit balance */
  balance: (0, import_mysql_core.decimal)("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  /** Lifetime credits used */
  totalUsed: (0, import_mysql_core.decimal)("totalUsed", { precision: 12, scale: 2 }).default("0").notNull(),
  /** Last reset date */
  lastResetDate: (0, import_mysql_core.bigint)("lastResetDate", { mode: "number" }),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var aiUsage = (0, import_mysql_core.mysqlTable)("ai_usage", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id).notNull(),
  /** Generation type */
  type: (0, import_mysql_core.mysqlEnum)("type", ["image", "video", "edit"]).notNull(),
  /** Model used */
  model: (0, import_mysql_core.varchar)("model", { length: 100 }).notNull(),
  // "dall-e-3", "runway-ml", etc
  /** Prompt/description */
  prompt: (0, import_mysql_core.text)("prompt").notNull(),
  /** Result */
  resultUrl: (0, import_mysql_core.text)("resultUrl"),
  resultKey: (0, import_mysql_core.varchar)("resultKey", { length: 500 }),
  // S3 key
  /** Cost in credits */
  creditsCost: (0, import_mysql_core.decimal)("creditsCost", { precision: 10, scale: 2 }).notNull(),
  /** Metadata */
  imageSize: (0, import_mysql_core.varchar)("imageSize", { length: 50 }),
  // "512x512", "1024x1024", etc
  videoDuration: (0, import_mysql_core.int)("videoDuration"),
  // in seconds
  status: (0, import_mysql_core.mysqlEnum)("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  errorMessage: (0, import_mysql_core.text)("errorMessage"),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
});
var aiTransactions = (0, import_mysql_core.mysqlTable)("ai_transactions", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id).notNull(),
  /** Transaction type */
  type: (0, import_mysql_core.mysqlEnum)("type", ["purchase", "refund", "monthly_allowance", "bonus"]).notNull(),
  /** Amount */
  amount: (0, import_mysql_core.decimal)("amount", { precision: 12, scale: 2 }).notNull(),
  /** Payment info */
  stripePaymentId: (0, import_mysql_core.varchar)("stripePaymentId", { length: 255 }),
  paymentMethod: (0, import_mysql_core.varchar)("paymentMethod", { length: 50 }),
  /** Status */
  status: (0, import_mysql_core.mysqlEnum)("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  /** Description */
  description: (0, import_mysql_core.text)("description"),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
});
var blogPosts = (0, import_mysql_core.mysqlTable)("blog_posts", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  /** URL slug for SEO-friendly URLs */
  slug: (0, import_mysql_core.varchar)("slug", { length: 255 }).notNull().unique(),
  /** Content */
  title: (0, import_mysql_core.varchar)("title", { length: 500 }).notNull(),
  excerpt: (0, import_mysql_core.text)("excerpt").notNull(),
  content: (0, import_mysql_core.text)("content").notNull(),
  /** SEO fields */
  metaTitle: (0, import_mysql_core.varchar)("metaTitle", { length: 70 }),
  metaDescription: (0, import_mysql_core.varchar)("metaDescription", { length: 160 }),
  metaKeywords: (0, import_mysql_core.varchar)("metaKeywords", { length: 500 }),
  /** Media */
  coverImageUrl: (0, import_mysql_core.text)("coverImageUrl"),
  /** Categorization */
  category: (0, import_mysql_core.varchar)("category", { length: 100 }),
  tags: (0, import_mysql_core.json)("tags"),
  /** Author */
  authorId: (0, import_mysql_core.int)("authorId").references(() => users.id),
  authorName: (0, import_mysql_core.varchar)("authorName", { length: 255 }).default("VANIR GROUP"),
  /** Publishing */
  status: (0, import_mysql_core.mysqlEnum)("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: (0, import_mysql_core.timestamp)("publishedAt"),
  /** Engagement */
  viewCount: (0, import_mysql_core.int)("viewCount").default(0),
  readingTime: (0, import_mysql_core.int)("readingTime").default(5),
  /** Timestamps */
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var marketingContent = (0, import_mysql_core.mysqlTable)("marketing_content", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id).notNull(),
  /** Content type */
  type: (0, import_mysql_core.mysqlEnum)("type", ["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).notNull(),
  /** Platform (for social media) */
  platform: (0, import_mysql_core.varchar)("platform", { length: 50 }),
  // instagram, facebook, twitter, linkedin, tiktok
  /** Content */
  title: (0, import_mysql_core.varchar)("title", { length: 500 }),
  content: (0, import_mysql_core.text)("content").notNull(),
  /** Generation metadata */
  prompt: (0, import_mysql_core.text)("prompt").notNull(),
  language: (0, import_mysql_core.varchar)("language", { length: 10 }).default("en"),
  tone: (0, import_mysql_core.varchar)("tone", { length: 50 }),
  // professional, casual, luxurious, adventurous
  destination: (0, import_mysql_core.varchar)("destination", { length: 255 }),
  /** Hashtags (JSON array) */
  hashtags: (0, import_mysql_core.json)("hashtags"),
  /** Credits used */
  creditsCost: (0, import_mysql_core.decimal)("creditsCost", { precision: 10, scale: 2 }).default("1"),
  /** Status */
  isFavorite: (0, import_mysql_core.mysqlEnum)("isFavorite", ["yes", "no"]).default("no").notNull(),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
});
var marketingCalendar = (0, import_mysql_core.mysqlTable)("marketing_calendar", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  userId: (0, import_mysql_core.int)("userId").references(() => users.id).notNull(),
  /** Content reference */
  contentId: (0, import_mysql_core.int)("contentId").references(() => marketingContent.id),
  /** Calendar entry */
  title: (0, import_mysql_core.varchar)("title", { length: 500 }).notNull(),
  description: (0, import_mysql_core.text)("description"),
  /** Platform */
  platform: (0, import_mysql_core.varchar)("platform", { length: 50 }),
  /** Scheduling */
  scheduledDate: (0, import_mysql_core.bigint)("scheduledDate", { mode: "number" }).notNull(),
  /** Status */
  status: (0, import_mysql_core.mysqlEnum)("status", ["draft", "scheduled", "published", "cancelled"]).default("draft").notNull(),
  /** Color tag for calendar display */
  colorTag: (0, import_mysql_core.varchar)("colorTag", { length: 20 }).default("#D4A853"),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var marketingTemplates = (0, import_mysql_core.mysqlTable)("marketing_templates", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  /** Template info */
  name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
  description: (0, import_mysql_core.text)("description"),
  /** Template type */
  type: (0, import_mysql_core.mysqlEnum)("type", ["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).notNull(),
  /** Platform */
  platform: (0, import_mysql_core.varchar)("platform", { length: 50 }),
  /** Template content (with placeholders like {{destination}}, {{price}}) */
  templateContent: (0, import_mysql_core.text)("templateContent").notNull(),
  /** System prompt for AI generation */
  systemPrompt: (0, import_mysql_core.text)("systemPrompt"),
  /** Category */
  category: (0, import_mysql_core.varchar)("category", { length: 100 }),
  // seasonal, promotional, informational, engagement
  /** Icon name from lucide */
  icon: (0, import_mysql_core.varchar)("icon", { length: 50 }),
  /** Is built-in (not deletable) */
  isBuiltIn: (0, import_mysql_core.mysqlEnum)("isBuiltIn", ["yes", "no"]).default("no").notNull(),
  /** Sort order */
  sortOrder: (0, import_mysql_core.int)("sortOrder").default(0),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull()
});
var destinations = (0, import_mysql_core.mysqlTable)("destinations", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  /** Basic info */
  name: (0, import_mysql_core.varchar)("name", { length: 255 }).notNull(),
  description: (0, import_mysql_core.text)("description"),
  location: (0, import_mysql_core.varchar)("location", { length: 255 }).notNull(),
  /** Pricing and rating */
  pricePerPerson: (0, import_mysql_core.decimal)("pricePerPerson", { precision: 10, scale: 2 }).default("0"),
  rating: (0, import_mysql_core.decimal)("rating", { precision: 3, scale: 2 }).default("5"),
  /** Media */
  imageUrl: (0, import_mysql_core.text)("imageUrl"),
  /** Details */
  highlights: (0, import_mysql_core.text)("highlights"),
  bestTimeToVisit: (0, import_mysql_core.varchar)("bestTimeToVisit", { length: 255 }),
  duration: (0, import_mysql_core.varchar)("duration", { length: 100 }),
  difficulty: (0, import_mysql_core.mysqlEnum)("difficulty", ["easy", "moderate", "hard"]),
  groupSize: (0, import_mysql_core.varchar)("groupSize", { length: 100 }),
  inclusions: (0, import_mysql_core.text)("inclusions"),
  exclusions: (0, import_mysql_core.text)("exclusions"),
  /** Status */
  isActive: (0, import_mysql_core.mysqlEnum)("isActive", ["active", "inactive"]).default("active").notNull(),
  /** Timestamps */
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});
var siteSettings = (0, import_mysql_core.mysqlTable)("site_settings", {
  id: (0, import_mysql_core.int)("id").autoincrement().primaryKey(),
  /** Setting category for grouping */
  category: (0, import_mysql_core.varchar)("category", { length: 50 }).notNull(),
  /** Setting key (unique within category) */
  settingKey: (0, import_mysql_core.varchar)("setting_key", { length: 100 }).notNull(),
  /** Setting value (stored as text, parsed by app) */
  settingValue: (0, import_mysql_core.text)("setting_value"),
  /** Last updated by */
  updatedBy: (0, import_mysql_core.int)("updated_by").references(() => users.id),
  createdAt: (0, import_mysql_core.timestamp)("createdAt").defaultNow().notNull(),
  updatedAt: (0, import_mysql_core.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  /** Admin email for direct password login (no OAuth required) */
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  /** SHA-256 hex hash of the admin password */
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = (0, import_mysql2.drizzle)(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createBooking(booking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(booking);
  const insertId = result[0].insertId;
  const rows = await db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.id, insertId)).limit(1);
  return rows[0];
}
async function getBookingById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.id, id)).limit(1);
  return result[0] ?? null;
}
async function getBookingByConfirmationCode(code) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.confirmationCode, code)).limit(1);
  return result[0] ?? null;
}
async function getUserBookings(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(bookings).where((0, import_drizzle_orm.eq)(bookings.userId, userId)).orderBy((0, import_drizzle_orm.desc)(bookings.createdAt));
}
async function updateBookingStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set({ status }).where((0, import_drizzle_orm.eq)(bookings.id, id));
  return getBookingById(id);
}
async function updateBookingPaymentStatus(id, paymentStatus) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bookings).set({ paymentStatus }).where((0, import_drizzle_orm.eq)(bookings.id, id));
  return getBookingById(id);
}
async function getAllBookings(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(bookings).orderBy((0, import_drizzle_orm.desc)(bookings.createdAt)).limit(limit).offset(offset);
}
async function createReview(review) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(reviews).values(review);
  const insertId = result[0].insertId;
  const rows = await db.select().from(reviews).where((0, import_drizzle_orm.eq)(reviews.id, insertId)).limit(1);
  return rows[0];
}
async function getApprovedReviews(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(reviews).where((0, import_drizzle_orm.eq)(reviews.isApproved, "approved")).orderBy((0, import_drizzle_orm.desc)(reviews.createdAt)).limit(limit).offset(offset);
}
async function getAllReviews(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(reviews).orderBy((0, import_drizzle_orm.desc)(reviews.createdAt)).limit(limit).offset(offset);
}
async function getReviewById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(reviews).where((0, import_drizzle_orm.eq)(reviews.id, id)).limit(1);
  return result[0] ?? null;
}
async function updateReviewApproval(id, isApproved) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ isApproved }).where((0, import_drizzle_orm.eq)(reviews.id, id));
  return getReviewById(id);
}
async function addAdminReply(id, adminReply) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ adminReply, adminReplyAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(reviews.id, id));
  return getReviewById(id);
}
async function incrementHelpfulCount(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(reviews).set({ helpfulCount: import_drizzle_orm.sql`${reviews.helpfulCount} + 1` }).where((0, import_drizzle_orm.eq)(reviews.id, id));
  return getReviewById(id);
}
async function getReviewStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const allApproved = await db.select().from(reviews).where((0, import_drizzle_orm.eq)(reviews.isApproved, "approved"));
  const total = allApproved.length;
  if (total === 0) return { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const sum = allApproved.reduce((acc, r) => acc + r.rating, 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  allApproved.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
  });
  return { total, average: Math.round(sum / total * 10) / 10, distribution };
}
async function createOffer(offer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(offers).values(offer);
  const insertId = result[0].insertId;
  const rows = await db.select().from(offers).where((0, import_drizzle_orm.eq)(offers.id, insertId)).limit(1);
  return rows[0];
}
async function getActiveOffers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const now = Date.now();
  return db.select().from(offers).where((0, import_drizzle_orm.and)(
    (0, import_drizzle_orm.eq)(offers.isActive, "active"),
    (0, import_drizzle_orm.lte)(offers.startDate, now),
    (0, import_drizzle_orm.gte)(offers.endDate, now)
  )).orderBy((0, import_drizzle_orm.asc)(offers.endDate));
}
async function getAllOffers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(offers).orderBy((0, import_drizzle_orm.desc)(offers.createdAt)).limit(limit).offset(offset);
}
async function getOfferByPromoCode(promoCode) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(offers).where((0, import_drizzle_orm.eq)(offers.promoCode, promoCode)).limit(1);
  return result[0] ?? null;
}
async function updateOffer(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(offers).set(data).where((0, import_drizzle_orm.eq)(offers.id, id));
  const rows = await db.select().from(offers).where((0, import_drizzle_orm.eq)(offers.id, id)).limit(1);
  return rows[0];
}
async function createContactMessage(message) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contactMessages).values(message);
  const insertId = result[0].insertId;
  const rows = await db.select().from(contactMessages).where((0, import_drizzle_orm.eq)(contactMessages.id, insertId)).limit(1);
  return rows[0];
}
async function getAllContactMessages(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(contactMessages).orderBy((0, import_drizzle_orm.desc)(contactMessages.createdAt)).limit(limit).offset(offset);
}
async function updateContactMessageStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactMessages).set({ status }).where((0, import_drizzle_orm.eq)(contactMessages.id, id));
}
async function createFileUpload(file) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(fileUploads).values(file);
  const insertId = result[0].insertId;
  const rows = await db.select().from(fileUploads).where((0, import_drizzle_orm.eq)(fileUploads.id, insertId)).limit(1);
  return rows[0];
}
async function getUserFiles(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(fileUploads).where((0, import_drizzle_orm.eq)(fileUploads.userId, userId)).orderBy((0, import_drizzle_orm.desc)(fileUploads.createdAt));
}
async function createGalleryItem(item) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(galleryItems).values(item);
  const insertId = result[0].insertId;
  const rows = await db.select().from(galleryItems).where((0, import_drizzle_orm.eq)(galleryItems.id, insertId)).limit(1);
  return rows[0];
}
async function getVisibleGalleryItems() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(galleryItems).where((0, import_drizzle_orm.eq)(galleryItems.isVisible, "visible")).orderBy((0, import_drizzle_orm.asc)(galleryItems.sortOrder), (0, import_drizzle_orm.desc)(galleryItems.createdAt));
}
async function getAllGalleryItems(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(galleryItems).orderBy((0, import_drizzle_orm.asc)(galleryItems.sortOrder), (0, import_drizzle_orm.desc)(galleryItems.createdAt)).limit(limit).offset(offset);
}
async function getGalleryItemById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(galleryItems).where((0, import_drizzle_orm.eq)(galleryItems.id, id)).limit(1);
  return result[0] ?? null;
}
async function updateGalleryItem(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryItems).set(data).where((0, import_drizzle_orm.eq)(galleryItems.id, id));
  return getGalleryItemById(id);
}
async function deleteGalleryItem(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryItems).where((0, import_drizzle_orm.eq)(galleryItems.id, id));
}
async function createGalleryVideo(video) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(galleryVideos).values(video);
  const insertId = result[0].insertId;
  const rows = await db.select().from(galleryVideos).where((0, import_drizzle_orm.eq)(galleryVideos.id, insertId)).limit(1);
  return rows[0];
}
async function getVisibleGalleryVideos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(galleryVideos).where((0, import_drizzle_orm.eq)(galleryVideos.isVisible, "visible")).orderBy((0, import_drizzle_orm.asc)(galleryVideos.sortOrder), (0, import_drizzle_orm.desc)(galleryVideos.createdAt));
}
async function getAllGalleryVideos(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(galleryVideos).orderBy((0, import_drizzle_orm.asc)(galleryVideos.sortOrder), (0, import_drizzle_orm.desc)(galleryVideos.createdAt)).limit(limit).offset(offset);
}
async function getGalleryVideoById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(galleryVideos).where((0, import_drizzle_orm.eq)(galleryVideos.id, id)).limit(1);
  return result[0] ?? null;
}
async function updateGalleryVideo(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryVideos).set(data).where((0, import_drizzle_orm.eq)(galleryVideos.id, id));
  return getGalleryVideoById(id);
}
async function deleteGalleryVideo(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(galleryVideos).where((0, import_drizzle_orm.eq)(galleryVideos.id, id));
}
async function getOrCreateAISubscription(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let subscription = await db.select().from(aiSubscriptions).where((0, import_drizzle_orm.eq)(aiSubscriptions.userId, userId)).limit(1);
  if (subscription.length === 0) {
    const result = await db.insert(aiSubscriptions).values({
      userId,
      plan: "free",
      status: "active",
      startDate: Date.now()
    });
    const insertId = result[0].insertId;
    subscription = await db.select().from(aiSubscriptions).where((0, import_drizzle_orm.eq)(aiSubscriptions.id, insertId)).limit(1);
  }
  return subscription[0];
}
async function updateAISubscription(userId, plan, stripeSubscriptionId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiSubscriptions).set({
    plan,
    status: "active",
    renewalDate: Date.now() + 30 * 24 * 60 * 60 * 1e3,
    // 30 days
    ...stripeSubscriptionId && { stripeSubscriptionId }
  }).where((0, import_drizzle_orm.eq)(aiSubscriptions.userId, userId));
  return getOrCreateAISubscription(userId);
}
async function getOrCreateAICredits(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let credits = await db.select().from(aiCredits).where((0, import_drizzle_orm.eq)(aiCredits.userId, userId)).limit(1);
  if (credits.length === 0) {
    const result = await db.insert(aiCredits).values({
      userId,
      balance: "5",
      // Free tier gets 5 image generations
      totalUsed: "0"
    });
    const insertId = result[0].insertId;
    credits = await db.select().from(aiCredits).where((0, import_drizzle_orm.eq)(aiCredits.id, insertId)).limit(1);
  }
  return credits[0];
}
async function addAICredits(userId, amount, reason) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const credits = await getOrCreateAICredits(userId);
  const newBalance = parseFloat(credits.balance.toString()) + amount;
  await db.update(aiCredits).set({ balance: newBalance.toString() }).where((0, import_drizzle_orm.eq)(aiCredits.userId, userId));
  await db.insert(aiTransactions).values({
    userId,
    type: reason === "purchase" ? "purchase" : reason === "monthly_allowance" ? "monthly_allowance" : "bonus",
    amount: amount.toString(),
    status: "completed"
  });
  return getOrCreateAICredits(userId);
}
async function deductAICredits(userId, amount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const credits = await getOrCreateAICredits(userId);
  const currentBalance = parseFloat(credits.balance.toString());
  if (currentBalance < amount) {
    throw new Error("Insufficient credits");
  }
  const newBalance = currentBalance - amount;
  const newTotalUsed = parseFloat(credits.totalUsed.toString()) + amount;
  await db.update(aiCredits).set({
    balance: newBalance.toString(),
    totalUsed: newTotalUsed.toString()
  }).where((0, import_drizzle_orm.eq)(aiCredits.userId, userId));
  return getOrCreateAICredits(userId);
}
async function createAIUsage(usage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(aiUsage).values(usage);
  const insertId = result[0].insertId;
  const rows = await db.select().from(aiUsage).where((0, import_drizzle_orm.eq)(aiUsage.id, insertId)).limit(1);
  return rows[0];
}
async function getUserAIUsage(userId, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(aiUsage).where((0, import_drizzle_orm.eq)(aiUsage.userId, userId)).orderBy((0, import_drizzle_orm.desc)(aiUsage.createdAt)).limit(limit).offset(offset);
}
async function updateAIUsageStatus(id, status, resultUrl, errorMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(aiUsage).set({
    status,
    ...resultUrl && { resultUrl },
    ...errorMessage && { errorMessage }
  }).where((0, import_drizzle_orm.eq)(aiUsage.id, id));
  const rows = await db.select().from(aiUsage).where((0, import_drizzle_orm.eq)(aiUsage.id, id)).limit(1);
  return rows[0];
}
async function getAIUsageStats(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const usage = await db.select().from(aiUsage).where((0, import_drizzle_orm.eq)(aiUsage.userId, userId));
  return {
    totalGenerations: usage.length,
    byType: {
      image: usage.filter((u) => u.type === "image").length,
      video: usage.filter((u) => u.type === "video").length,
      edit: usage.filter((u) => u.type === "edit").length
    },
    totalCost: usage.reduce((sum, u) => sum + parseFloat(u.creditsCost.toString()), 0)
  };
}
async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).orderBy((0, import_drizzle_orm.desc)(users.createdAt)).limit(limit).offset(offset);
  return result;
}
async function getUsersCount() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({ count: import_drizzle_orm.sql`count(*)` }).from(users);
  return result[0]?.count ?? 0;
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id)).limit(1);
  return result[0] ?? null;
}
async function updateUserRole(id, role) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where((0, import_drizzle_orm.eq)(users.id, id));
  return getUserById(id);
}
async function searchUsers(query, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(users).where(
    import_drizzle_orm.sql`${users.name} LIKE ${`%${query}%`} OR ${users.email} LIKE ${`%${query}%`} OR ${users.openId} LIKE ${`%${query}%`}`
  ).orderBy((0, import_drizzle_orm.desc)(users.createdAt)).limit(limit);
  return result;
}
async function getUserStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const totalUsers = await db.select({ count: import_drizzle_orm.sql`count(*)` }).from(users);
  const adminUsers = await db.select({ count: import_drizzle_orm.sql`count(*)` }).from(users).where((0, import_drizzle_orm.eq)(users.role, "admin"));
  const recentUsers = await db.select({ count: import_drizzle_orm.sql`count(*)` }).from(users).where((0, import_drizzle_orm.gte)(users.createdAt, import_drizzle_orm.sql`DATE_SUB(NOW(), INTERVAL 30 DAY)`));
  const todayUsers = await db.select({ count: import_drizzle_orm.sql`count(*)` }).from(users).where((0, import_drizzle_orm.gte)(users.createdAt, import_drizzle_orm.sql`CURDATE()`));
  return {
    total: totalUsers[0]?.count ?? 0,
    admins: adminUsers[0]?.count ?? 0,
    recentSignups: recentUsers[0]?.count ?? 0,
    todaySignups: todayUsers[0]?.count ?? 0
  };
}
async function updateUserProfile(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet = {};
  if (data.name !== void 0) updateSet.name = data.name;
  if (data.phone !== void 0) updateSet.phone = data.phone;
  if (data.avatarUrl !== void 0) updateSet.avatarUrl = data.avatarUrl;
  if (Object.keys(updateSet).length === 0) {
    return getUserById(id);
  }
  await db.update(users).set(updateSet).where((0, import_drizzle_orm.eq)(users.id, id));
  return getUserById(id);
}
async function getPublishedBlogPosts(limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(blogPosts).where((0, import_drizzle_orm.eq)(blogPosts.status, "published")).orderBy((0, import_drizzle_orm.desc)(blogPosts.publishedAt)).limit(limit).offset(offset);
}
async function getBlogPostBySlug(slug) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(blogPosts).where((0, import_drizzle_orm.eq)(blogPosts.slug, slug)).limit(1);
  return result[0] ?? null;
}
async function getBlogPostsByCategory(category, limit = 10, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(blogPosts).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(blogPosts.status, "published"), (0, import_drizzle_orm.eq)(blogPosts.category, category))).orderBy((0, import_drizzle_orm.desc)(blogPosts.publishedAt)).limit(limit).offset(offset);
}
async function createBlogPost(post) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(blogPosts).values(post);
  const insertId = result[0].insertId;
  const rows = await db.select().from(blogPosts).where((0, import_drizzle_orm.eq)(blogPosts.id, insertId)).limit(1);
  return rows[0];
}
async function updateBlogPost(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set(data).where((0, import_drizzle_orm.eq)(blogPosts.id, id));
  const rows = await db.select().from(blogPosts).where((0, import_drizzle_orm.eq)(blogPosts.id, id)).limit(1);
  return rows[0] ?? null;
}
async function getAllBlogPosts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(blogPosts).orderBy((0, import_drizzle_orm.desc)(blogPosts.createdAt)).limit(limit).offset(offset);
}
async function incrementBlogViewCount(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(blogPosts).set({ viewCount: import_drizzle_orm.sql`${blogPosts.viewCount} + 1` }).where((0, import_drizzle_orm.eq)(blogPosts.id, id));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
var import_axios = __toESM(require("axios"), 1);
var import_cookie = require("cookie");
var import_jose = require("jose");
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => import_axios.default.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = (0, import_cookie.parse)(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new import_jose.SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await (0, import_jose.jwtVerify)(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const next = getQueryParam(req, "next");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
      res.redirect(302, safeNext);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/downloadProxy.ts
var import_sharp = __toESM(require("sharp"), 1);
var ALLOWED_FORMATS = ["png", "jpg", "jpeg", "webp"];
var FORMAT_MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp"
};
function registerDownloadProxy(app) {
  app.get("/api/download-image", async (req, res) => {
    try {
      const imageUrl = req.query.url;
      const requestedFormat = req.query.format?.toLowerCase();
      if (!imageUrl) {
        res.status(400).json({ error: "Missing 'url' query parameter" });
        return;
      }
      if (requestedFormat && !ALLOWED_FORMATS.includes(requestedFormat)) {
        res.status(400).json({
          error: `Invalid format '${requestedFormat}'. Allowed: ${ALLOWED_FORMATS.join(", ")}`
        });
        return;
      }
      const allowedDomains = [
        "s3.amazonaws.com",
        "s3.us-east-1.amazonaws.com",
        ".s3.amazonaws.com",
        "cloudfront.net",
        "manus-storage"
      ];
      let isAllowed = false;
      try {
        const parsedUrl = new URL(imageUrl);
        isAllowed = allowedDomains.some(
          (domain) => parsedUrl.hostname.endsWith(domain) || parsedUrl.hostname.includes(domain)
        );
      } catch {
        res.status(400).json({ error: "Invalid URL format" });
        return;
      }
      if (!isAllowed) {
        const s3Patterns = ["vanir", "ai-generated", "manus"];
        isAllowed = s3Patterns.some(
          (pattern) => imageUrl.toLowerCase().includes(pattern)
        );
      }
      if (!isAllowed) {
        res.status(403).json({ error: "URL domain not allowed for download" });
        return;
      }
      const response = await fetch(imageUrl);
      if (!response.ok) {
        res.status(response.status).json({
          error: `Failed to fetch image: ${response.statusText}`
        });
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      let outputBuffer = Buffer.from(arrayBuffer);
      let outputMime = response.headers.get("content-type") || "image/png";
      let outputExt = "png";
      if (requestedFormat) {
        const normalizedFormat = requestedFormat === "jpg" ? "jpeg" : requestedFormat;
        const sharpInstance = (0, import_sharp.default)(outputBuffer);
        if (normalizedFormat === "jpeg") {
          outputBuffer = await sharpInstance.jpeg({ quality: 92 }).toBuffer();
        } else if (normalizedFormat === "webp") {
          outputBuffer = await sharpInstance.webp({ quality: 90 }).toBuffer();
        } else {
          outputBuffer = await sharpInstance.png().toBuffer();
        }
        outputMime = FORMAT_MIME[requestedFormat] || "image/png";
        outputExt = requestedFormat === "jpeg" ? "jpg" : requestedFormat;
      }
      const baseFilename = req.query.filename || `vanir-ai-${Date.now()}`;
      const cleanBase = baseFilename.replace(/\.(png|jpg|jpeg|webp)$/i, "");
      const filename = `${cleanBase}.${outputExt}`;
      res.setHeader("Content-Type", outputMime);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", outputBuffer.length);
      res.setHeader("Cache-Control", "no-cache");
      res.send(outputBuffer);
    } catch (error) {
      console.error("[Download Proxy] Error:", error);
      res.status(500).json({ error: "Internal server error during download" });
    }
  });
}

// server/_core/systemRouter.ts
var import_zod = require("zod");

// server/_core/notification.ts
var import_server = require("@trpc/server");
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new import_server.TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new import_server.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new import_server.TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
var import_server2 = require("@trpc/server");
var import_superjson = __toESM(require("superjson"), 1);
var t = import_server2.initTRPC.context().create({
  transformer: import_superjson.default
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new import_server2.TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new import_server2.TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    import_zod.z.object({
      timestamp: import_zod.z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    import_zod.z.object({
      title: import_zod.z.string().min(1, "title is required"),
      content: import_zod.z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers/bookings.ts
var import_zod2 = require("zod");
var import_nanoid = require("nanoid");
var bookingsRouter = router({
  /** Create a new booking (public - guests can book too) */
  create: publicProcedure.input(
    import_zod2.z.object({
      packageName: import_zod2.z.string().min(1),
      packageCategory: import_zod2.z.string().optional(),
      destination: import_zod2.z.string().optional(),
      checkInDate: import_zod2.z.number().optional(),
      checkOutDate: import_zod2.z.number().optional(),
      adults: import_zod2.z.number().min(1).default(1),
      children: import_zod2.z.number().min(0).default(0),
      roomType: import_zod2.z.string().optional(),
      totalPrice: import_zod2.z.string().optional(),
      currency: import_zod2.z.string().default("USD"),
      paymentMethod: import_zod2.z.enum(["credit_card", "paypal", "bank_transfer"]).optional(),
      promoCode: import_zod2.z.string().optional(),
      discountAmount: import_zod2.z.string().optional(),
      specialRequests: import_zod2.z.string().optional(),
      billingAddress: import_zod2.z.any().optional(),
      guestName: import_zod2.z.string().optional(),
      guestEmail: import_zod2.z.string().email().optional(),
      guestPhone: import_zod2.z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const confirmationCode = `VNR-${(0, import_nanoid.nanoid)(8).toUpperCase()}`;
    const booking = await createBooking({
      ...input,
      userId: ctx.user?.id ?? null,
      confirmationCode,
      status: "pending",
      paymentStatus: "pending"
    });
    await notifyOwner({
      title: "\u062D\u062C\u0632 \u062C\u062F\u064A\u062F - New Booking",
      content: `\u062D\u062C\u0632 \u062C\u062F\u064A\u062F: ${input.packageName}
\u0627\u0644\u0639\u0645\u064A\u0644: ${input.guestName || ctx.user?.name || "\u0645\u062C\u0647\u0648\u0644"}
\u0631\u0645\u0632 \u0627\u0644\u062A\u0623\u0643\u064A\u062F: ${confirmationCode}`
    });
    return booking;
  }),
  /** Get booking by ID */
  getById: publicProcedure.input(import_zod2.z.object({ id: import_zod2.z.number() })).query(async ({ input }) => {
    return getBookingById(input.id);
  }),
  /** Get booking by confirmation code */
  getByCode: publicProcedure.input(import_zod2.z.object({ code: import_zod2.z.string() })).query(async ({ input }) => {
    return getBookingByConfirmationCode(input.code);
  }),
  /** Get current user's bookings */
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    return getUserBookings(ctx.user.id);
  }),
  /** Update booking status (admin only) */
  updateStatus: adminProcedure.input(
    import_zod2.z.object({
      id: import_zod2.z.number(),
      status: import_zod2.z.enum(["pending", "confirmed", "cancelled", "completed"])
    })
  ).mutation(async ({ input }) => {
    return updateBookingStatus(input.id, input.status);
  }),
  /** Update payment status (admin only) */
  updatePaymentStatus: adminProcedure.input(
    import_zod2.z.object({
      id: import_zod2.z.number(),
      paymentStatus: import_zod2.z.enum(["pending", "paid", "failed", "refunded"])
    })
  ).mutation(async ({ input }) => {
    return updateBookingPaymentStatus(input.id, input.paymentStatus);
  }),
  /** List all bookings (admin only) */
  listAll: adminProcedure.input(
    import_zod2.z.object({
      limit: import_zod2.z.number().min(1).max(100).default(50),
      offset: import_zod2.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllBookings(limit, offset);
  })
});

// server/routers/reviews.ts
var import_zod3 = require("zod");
var import_drizzle_orm2 = require("drizzle-orm");
var reviewsRouter = router({
  /** List approved reviews (public) */
  list: publicProcedure.input(
    import_zod3.z.object({
      limit: import_zod3.z.number().min(1).max(100).default(50),
      offset: import_zod3.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getApprovedReviews(limit, offset);
  }),
  /** Get review stats (public) */
  stats: publicProcedure.query(async () => {
    return getReviewStats();
  }),
  /** Get single review by ID (public) */
  getById: publicProcedure.input(import_zod3.z.object({ id: import_zod3.z.number() })).query(async ({ input }) => {
    return getReviewById(input.id);
  }),
  /** Create a new review (public - guests can review too) */
  create: publicProcedure.input(
    import_zod3.z.object({
      tripName: import_zod3.z.string().min(1),
      destination: import_zod3.z.string().optional(),
      rating: import_zod3.z.number().min(1).max(5),
      title: import_zod3.z.string().optional(),
      content: import_zod3.z.string().min(10),
      photoUrls: import_zod3.z.array(import_zod3.z.string()).optional(),
      travelDate: import_zod3.z.number().optional(),
      guestName: import_zod3.z.string().optional(),
      guestAvatarUrl: import_zod3.z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return createReview({
      ...input,
      userId: ctx.user?.id ?? null,
      isApproved: "pending",
      helpfulCount: 0
    });
  }),
  /** Get current user's reviews */
  myReviews: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(reviews).where((0, import_drizzle_orm2.eq)(reviews.userId, ctx.user.id)).orderBy((0, import_drizzle_orm2.desc)(reviews.createdAt));
  }),
  /** Mark review as helpful (public) */
  markHelpful: publicProcedure.input(import_zod3.z.object({ id: import_zod3.z.number() })).mutation(async ({ input }) => {
    return incrementHelpfulCount(input.id);
  }),
  /** List all reviews including pending (admin only) */
  listAll: adminProcedure.input(
    import_zod3.z.object({
      limit: import_zod3.z.number().min(1).max(100).default(50),
      offset: import_zod3.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllReviews(limit, offset);
  }),
  /** Approve or reject a review (admin only) */
  moderate: adminProcedure.input(
    import_zod3.z.object({
      id: import_zod3.z.number(),
      isApproved: import_zod3.z.enum(["pending", "approved", "rejected"])
    })
  ).mutation(async ({ input }) => {
    return updateReviewApproval(input.id, input.isApproved);
  }),
  /** Add admin reply to a review (admin only) */
  reply: adminProcedure.input(
    import_zod3.z.object({
      id: import_zod3.z.number(),
      adminReply: import_zod3.z.string().min(1)
    })
  ).mutation(async ({ input }) => {
    return addAdminReply(input.id, input.adminReply);
  })
});

// server/routers/offers.ts
var import_zod4 = require("zod");
var offersRouter = router({
  /** List active offers (public) */
  listActive: publicProcedure.query(async () => {
    return getActiveOffers();
  }),
  /** Validate a promo code (public) */
  validatePromo: publicProcedure.input(import_zod4.z.object({ promoCode: import_zod4.z.string().min(1) })).query(async ({ input }) => {
    const offer = await getOfferByPromoCode(input.promoCode);
    if (!offer) return { valid: false, message: "\u0631\u0645\u0632 \u0627\u0644\u062E\u0635\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" };
    const now = Date.now();
    if (offer.isActive !== "active") return { valid: false, message: "\u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u063A\u064A\u0631 \u0646\u0634\u0637" };
    if (now < offer.startDate) return { valid: false, message: "\u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636 \u0644\u0645 \u064A\u0628\u062F\u0623 \u0628\u0639\u062F" };
    if (now > offer.endDate) return { valid: false, message: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636" };
    if (offer.totalSpots && offer.bookedSpots && offer.bookedSpots >= offer.totalSpots) {
      return { valid: false, message: "\u0646\u0641\u062F\u062A \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0645\u0627\u0643\u0646 \u0627\u0644\u0645\u062A\u0627\u062D\u0629" };
    }
    return {
      valid: true,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      title: offer.title,
      message: "\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0631\u0645\u0632 \u0627\u0644\u062E\u0635\u0645 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /** List all offers (admin only) */
  listAll: adminProcedure.input(
    import_zod4.z.object({
      limit: import_zod4.z.number().min(1).max(100).default(50),
      offset: import_zod4.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllOffers(limit, offset);
  }),
  /** Create a new offer (admin only) */
  create: adminProcedure.input(
    import_zod4.z.object({
      title: import_zod4.z.string().min(1),
      description: import_zod4.z.string().optional(),
      discountType: import_zod4.z.enum(["percentage", "fixed"]),
      discountValue: import_zod4.z.string(),
      promoCode: import_zod4.z.string().optional(),
      startDate: import_zod4.z.number(),
      endDate: import_zod4.z.number(),
      category: import_zod4.z.string().optional(),
      destination: import_zod4.z.string().optional(),
      imageUrl: import_zod4.z.string().optional(),
      totalSpots: import_zod4.z.number().optional(),
      badgeText: import_zod4.z.string().optional(),
      badgeColor: import_zod4.z.string().optional()
    })
  ).mutation(async ({ input }) => {
    return createOffer({
      ...input,
      isActive: "active",
      bookedSpots: 0
    });
  }),
  /** Update an offer (admin only) */
  update: adminProcedure.input(
    import_zod4.z.object({
      id: import_zod4.z.number(),
      title: import_zod4.z.string().optional(),
      description: import_zod4.z.string().optional(),
      discountType: import_zod4.z.enum(["percentage", "fixed"]).optional(),
      discountValue: import_zod4.z.string().optional(),
      startDate: import_zod4.z.number().optional(),
      endDate: import_zod4.z.number().optional(),
      isActive: import_zod4.z.enum(["active", "inactive", "expired"]).optional(),
      totalSpots: import_zod4.z.number().optional(),
      badgeText: import_zod4.z.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateOffer(id, data);
  })
});

// server/routers/contact.ts
var import_zod5 = require("zod");
var contactRouter = router({
  /** Submit a contact form message (public) */
  submit: publicProcedure.input(
    import_zod5.z.object({
      name: import_zod5.z.string().min(1),
      email: import_zod5.z.string().email(),
      phone: import_zod5.z.string().optional(),
      subject: import_zod5.z.string().optional(),
      message: import_zod5.z.string().min(10)
    })
  ).mutation(async ({ input }) => {
    const msg = await createContactMessage({
      ...input,
      status: "new"
    });
    await notifyOwner({
      title: "\u0631\u0633\u0627\u0644\u0629 \u0627\u062A\u0635\u0627\u0644 \u062C\u062F\u064A\u062F\u0629 - New Contact Message",
      content: `\u0645\u0646: ${input.name} (${input.email})
\u0627\u0644\u0645\u0648\u0636\u0648\u0639: ${input.subject || "\u0628\u062F\u0648\u0646 \u0645\u0648\u0636\u0648\u0639"}

${input.message.substring(0, 200)}`
    });
    return { success: true, id: msg.id };
  }),
  /** List all contact messages (admin only) */
  listAll: adminProcedure.input(
    import_zod5.z.object({
      limit: import_zod5.z.number().min(1).max(100).default(50),
      offset: import_zod5.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllContactMessages(limit, offset);
  }),
  /** Update message status (admin only) */
  updateStatus: adminProcedure.input(
    import_zod5.z.object({
      id: import_zod5.z.number(),
      status: import_zod5.z.enum(["new", "read", "replied", "archived"])
    })
  ).mutation(async ({ input }) => {
    await updateContactMessageStatus(input.id, input.status);
    return { success: true };
  })
});

// server/routers/uploads.ts
var import_zod6 = require("zod");

// server/_core/supabase.ts
var import_supabase_js = require("@supabase/supabase-js");
function loadServerConfig() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}
var serverClient = null;
function getServerSupabase() {
  if (serverClient) return serverClient;
  const cfg = loadServerConfig();
  if (!cfg) return null;
  serverClient = (0, import_supabase_js.createClient)(cfg.url, cfg.serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return serverClient;
}

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const key = normalizeKey(relKey);
  const supabase = getServerSupabase();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (supabase && bucket) {
    const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
    const { error } = await supabase.storage.from(bucket).upload(key, blob, { contentType, upsert: true });
    if (error) {
      throw new Error(`[Supabase Storage] upload failed: ${error.message}`);
    }
    const expiresInSec = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_TTL || 3600);
    const { data: signed, error: signErr } = await supabase.storage.from(bucket).createSignedUrl(key, expiresInSec);
    if (signErr) {
      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);
      if (!pub.publicUrl) {
        throw new Error("[Supabase Storage] failed to obtain URL after upload");
      }
      return { key, url: pub.publicUrl };
    }
    return { key, url: signed.signedUrl };
  }
  const { baseUrl, apiKey } = getStorageConfig();
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/routers/uploads.ts
var import_nanoid2 = require("nanoid");
var uploadsRouter = router({
  /** Upload a file (authenticated users only) */
  upload: protectedProcedure.input(
    import_zod6.z.object({
      /** Base64 encoded file data */
      fileData: import_zod6.z.string(),
      filename: import_zod6.z.string(),
      mimeType: import_zod6.z.string(),
      purpose: import_zod6.z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const buffer = Buffer.from(input.fileData, "base64");
    const fileSize = buffer.length;
    if (fileSize > 10 * 1024 * 1024) {
      throw new Error("\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D (10 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A)");
    }
    const ext = input.filename.split(".").pop() || "bin";
    const randomSuffix = (0, import_nanoid2.nanoid)(8);
    const fileKey = `user-${ctx.user.id}/${input.purpose || "general"}/${randomSuffix}.${ext}`;
    const { url } = await storagePut(fileKey, buffer, input.mimeType);
    const fileRecord = await createFileUpload({
      userId: ctx.user.id,
      fileKey,
      url,
      filename: input.filename,
      mimeType: input.mimeType,
      fileSize,
      purpose: input.purpose
    });
    return fileRecord;
  }),
  /** List user's uploaded files */
  myFiles: protectedProcedure.query(async ({ ctx }) => {
    return getUserFiles(ctx.user.id);
  })
});

// server/routers/gallery.ts
var import_zod7 = require("zod");
var import_nanoid3 = require("nanoid");
var galleryRouter = router({
  // ─── Public Endpoints ───
  /** List visible gallery items (public) */
  listVisible: publicProcedure.query(async () => {
    return getVisibleGalleryItems();
  }),
  /** List visible gallery videos (public) */
  listVisibleVideos: publicProcedure.query(async () => {
    return getVisibleGalleryVideos();
  }),
  // ─── Admin Endpoints: Gallery Items ───
  /** List all gallery items (admin) */
  listAll: adminProcedure.input(
    import_zod7.z.object({
      limit: import_zod7.z.number().min(1).max(200).default(100),
      offset: import_zod7.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 100, offset = 0 } = input ?? {};
    return getAllGalleryItems(limit, offset);
  }),
  /** Create a gallery item (admin) */
  create: adminProcedure.input(
    import_zod7.z.object({
      imageUrl: import_zod7.z.string().min(1),
      title: import_zod7.z.string().min(1),
      titleAr: import_zod7.z.string().optional(),
      description: import_zod7.z.string().optional(),
      descriptionAr: import_zod7.z.string().optional(),
      category: import_zod7.z.string().min(1),
      categoryAr: import_zod7.z.string().optional(),
      location: import_zod7.z.string().optional(),
      locationAr: import_zod7.z.string().optional(),
      featured: import_zod7.z.enum(["yes", "no"]).default("no"),
      aspect: import_zod7.z.enum(["landscape", "portrait", "square"]).default("landscape"),
      sortOrder: import_zod7.z.number().default(0)
    })
  ).mutation(async ({ input }) => {
    return createGalleryItem({
      ...input,
      isVisible: "visible"
    });
  }),
  /** Update a gallery item (admin) */
  update: adminProcedure.input(
    import_zod7.z.object({
      id: import_zod7.z.number(),
      imageUrl: import_zod7.z.string().optional(),
      title: import_zod7.z.string().optional(),
      titleAr: import_zod7.z.string().optional(),
      description: import_zod7.z.string().optional(),
      descriptionAr: import_zod7.z.string().optional(),
      category: import_zod7.z.string().optional(),
      categoryAr: import_zod7.z.string().optional(),
      location: import_zod7.z.string().optional(),
      locationAr: import_zod7.z.string().optional(),
      featured: import_zod7.z.enum(["yes", "no"]).optional(),
      aspect: import_zod7.z.enum(["landscape", "portrait", "square"]).optional(),
      sortOrder: import_zod7.z.number().optional(),
      isVisible: import_zod7.z.enum(["visible", "hidden"]).optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateGalleryItem(id, data);
  }),
  /** Delete a gallery item (admin) */
  delete: adminProcedure.input(import_zod7.z.object({ id: import_zod7.z.number() })).mutation(async ({ input }) => {
    await deleteGalleryItem(input.id);
    return { success: true };
  }),
  /** Upload gallery image (admin) */
  uploadImage: adminProcedure.input(
    import_zod7.z.object({
      fileData: import_zod7.z.string(),
      filename: import_zod7.z.string(),
      mimeType: import_zod7.z.string()
    })
  ).mutation(async ({ input }) => {
    const buffer = Buffer.from(input.fileData, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error("\u062D\u062C\u0645 \u0627\u0644\u0645\u0644\u0641 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D (10 \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A)");
    }
    const ext = input.filename.split(".").pop() || "jpg";
    const randomSuffix = (0, import_nanoid3.nanoid)(8);
    const fileKey = `gallery/${randomSuffix}.${ext}`;
    const { url } = await storagePut(fileKey, buffer, input.mimeType);
    return { url, fileKey };
  }),
  // ─── Admin Endpoints: Gallery Videos ───
  /** List all gallery videos (admin) */
  listAllVideos: adminProcedure.input(
    import_zod7.z.object({
      limit: import_zod7.z.number().min(1).max(100).default(50),
      offset: import_zod7.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllGalleryVideos(limit, offset);
  }),
  /** Create a gallery video (admin) */
  createVideo: adminProcedure.input(
    import_zod7.z.object({
      thumbnailUrl: import_zod7.z.string().min(1),
      title: import_zod7.z.string().min(1),
      titleAr: import_zod7.z.string().optional(),
      youtubeId: import_zod7.z.string().min(1),
      duration: import_zod7.z.string().optional(),
      views: import_zod7.z.string().optional(),
      sortOrder: import_zod7.z.number().default(0)
    })
  ).mutation(async ({ input }) => {
    return createGalleryVideo({
      ...input,
      isVisible: "visible"
    });
  }),
  /** Update a gallery video (admin) */
  updateVideo: adminProcedure.input(
    import_zod7.z.object({
      id: import_zod7.z.number(),
      thumbnailUrl: import_zod7.z.string().optional(),
      title: import_zod7.z.string().optional(),
      titleAr: import_zod7.z.string().optional(),
      youtubeId: import_zod7.z.string().optional(),
      duration: import_zod7.z.string().optional(),
      views: import_zod7.z.string().optional(),
      sortOrder: import_zod7.z.number().optional(),
      isVisible: import_zod7.z.enum(["visible", "hidden"]).optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    return updateGalleryVideo(id, data);
  }),
  /** Delete a gallery video (admin) */
  deleteVideo: adminProcedure.input(import_zod7.z.object({ id: import_zod7.z.number() })).mutation(async ({ input }) => {
    await deleteGalleryVideo(input.id);
    return { success: true };
  })
});

// server/routers/aiStudio.ts
var import_zod8 = require("zod");

// server/openaiImageGen.ts
var import_openai = __toESM(require("openai"), 1);
async function generateImageWithDALLE(options) {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. Please add your OpenAI API key.");
  }
  const openai = new import_openai.default({ apiKey });
  let dalleSize = "1024x1024";
  if (options.size === "1792x1024") {
    dalleSize = "1792x1024";
  } else if (options.size === "1024x1792") {
    dalleSize = "1024x1792";
  }
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: options.prompt,
    n: 1,
    size: dalleSize,
    style: options.style || "vivid",
    quality: options.quality || "standard",
    response_format: "b64_json"
  });
  if (!response.data || response.data.length === 0) {
    throw new Error("No image data returned from OpenAI API");
  }
  const imageData = response.data[0];
  if (!imageData?.b64_json) {
    throw new Error("No image data returned from OpenAI API");
  }
  const buffer = Buffer.from(imageData.b64_json, "base64");
  const timestamp2 = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const s3Key = `ai-generated/${timestamp2}-${randomSuffix}.png`;
  const { url } = await storagePut(s3Key, buffer, "image/png");
  return {
    url,
    s3Key,
    revisedPrompt: imageData.revised_prompt || void 0
  };
}

// server/geminiImageGen.ts
var import_genai = require("@google/genai");
var GEMINI_IMAGE_MODELS = {
  "nano-banana": {
    modelCode: "gemini-2.5-flash-image",
    name: "Nano Banana",
    description: "Fast, creative workflows with state-of-the-art speed",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    creditCost: 1
  },
  "nano-banana-pro": {
    modelCode: "gemini-3-pro-image-preview",
    name: "Nano Banana Pro",
    description: "Studio-quality 4K visuals, complex layouts, precise text rendering",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    creditCost: 3
  },
  "nano-banana-2": {
    modelCode: "gemini-3.1-flash-image-preview",
    name: "Nano Banana 2",
    description: "High-efficiency production-scale, supports 0.5K-4K and extra aspect ratios",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"],
    creditCost: 2
  }
};
async function generateImageWithGemini(options) {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your Gemini API key."
    );
  }
  const ai = new import_genai.GoogleGenAI({ apiKey });
  const modelId = options.model || "nano-banana";
  const modelConfig = GEMINI_IMAGE_MODELS[modelId];
  if (!modelConfig) {
    throw new Error(`Unknown Gemini model: ${modelId}`);
  }
  let fullPrompt = options.prompt;
  if (options.style && options.style !== "vivid") {
    fullPrompt = `${options.style} style: ${options.prompt}`;
  }
  if (options.aspectRatio && options.aspectRatio !== "1:1") {
    fullPrompt += ` (aspect ratio: ${options.aspectRatio})`;
  }
  const response = await ai.models.generateContent({
    model: modelConfig.modelCode,
    contents: fullPrompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"]
    }
  });
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No response candidates from Gemini API");
  }
  const parts = candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("No content parts in Gemini API response");
  }
  let imageBuffer = null;
  let mimeType = "image/png";
  let textResponse;
  for (const part of parts) {
    if (part.inlineData) {
      imageBuffer = Buffer.from(part.inlineData.data, "base64");
      mimeType = part.inlineData.mimeType || "image/png";
    } else if (part.text) {
      textResponse = part.text;
    }
  }
  if (!imageBuffer) {
    throw new Error(
      "No image data returned from Gemini API. The model may have declined to generate this image."
    );
  }
  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const timestamp2 = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const modelPrefix = modelId.replace(/-/g, "");
  const s3Key = `ai-generated/${modelPrefix}-${timestamp2}-${randomSuffix}.${ext}`;
  const { url } = await storagePut(s3Key, imageBuffer, mimeType);
  return {
    url,
    s3Key,
    revisedPrompt: textResponse || void 0
  };
}

// server/routers/aiStudio.ts
var aiStudioRouter = router({
  /** Get or create AI subscription for current user */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateAISubscription(ctx.user.id);
  }),
  /** Upgrade subscription plan */
  upgradePlan: protectedProcedure.input(
    import_zod8.z.object({
      plan: import_zod8.z.enum(["free", "pro", "enterprise"]),
      stripePaymentIntentId: import_zod8.z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const subscription = await updateAISubscription(ctx.user.id, input.plan, input.stripePaymentIntentId);
    return subscription;
  }),
  /** Get current user's AI credits */
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateAICredits(ctx.user.id);
  }),
  /** Add credits to user account (admin/webhook only) */
  addCredits: protectedProcedure.input(
    import_zod8.z.object({
      amount: import_zod8.z.number().min(1),
      reason: import_zod8.z.enum(["purchase", "monthly_allowance", "bonus"]).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return addAICredits(ctx.user.id, input.amount, input.reason || "bonus");
  }),
  /** Generate image with DALL-E 3 or Nano Banana models - Real API call */
  generateImage: protectedProcedure.input(
    import_zod8.z.object({
      prompt: import_zod8.z.string().min(1).max(4e3),
      model: import_zod8.z.enum(["dall-e-3", "nano-banana", "nano-banana-pro", "nano-banana-2"]).default("dall-e-3"),
      // DALL-E specific options
      size: import_zod8.z.enum(["1024x1024", "1792x1024", "1024x1792"]).default("1024x1024"),
      style: import_zod8.z.enum(["vivid", "natural"]).default("vivid"),
      quality: import_zod8.z.enum(["standard", "hd"]).default("standard"),
      // Nano Banana specific options
      aspectRatio: import_zod8.z.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"]).default("1:1"),
      creditCost: import_zod8.z.number().min(1).default(2)
    })
  ).mutation(async ({ ctx, input }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (currentBalance < input.creditCost) {
      throw new Error("Insufficient credits. Please upgrade your plan or purchase more credits.");
    }
    await deductAICredits(ctx.user.id, input.creditCost);
    const isGeminiModel = input.model.startsWith("nano-banana");
    const modelName = input.model;
    const usageRecord = await createAIUsage({
      userId: ctx.user.id,
      type: "image",
      model: modelName,
      prompt: input.prompt,
      creditsCost: input.creditCost.toString(),
      imageSize: isGeminiModel ? input.aspectRatio : input.size,
      status: "pending"
    });
    try {
      let result;
      if (isGeminiModel) {
        result = await generateImageWithGemini({
          prompt: input.prompt,
          model: input.model,
          aspectRatio: input.aspectRatio,
          style: input.style
        });
      } else {
        result = await generateImageWithDALLE({
          prompt: input.prompt,
          size: input.size,
          style: input.style,
          quality: input.quality
        });
      }
      await updateAIUsageStatus(usageRecord.id, "completed", result.url);
      return {
        success: true,
        imageUrl: result.url,
        s3Key: result.s3Key,
        revisedPrompt: result.revisedPrompt,
        model: modelName,
        usageId: usageRecord.id
      };
    } catch (error) {
      await addAICredits(ctx.user.id, input.creditCost, "bonus");
      const errorMsg = error instanceof Error ? error.message : "Unknown error during image generation";
      await updateAIUsageStatus(usageRecord.id, "failed", void 0, errorMsg);
      throw new Error(`Image generation failed (${modelName}): ${errorMsg}`);
    }
  }),
  /** Deduct credits for image generation (legacy - kept for backward compatibility) */
  deductCreditsForImage: protectedProcedure.input(
    import_zod8.z.object({
      amount: import_zod8.z.number().min(1),
      imageModel: import_zod8.z.string().default("dall-e-3"),
      prompt: import_zod8.z.string().min(1),
      imageSize: import_zod8.z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (currentBalance < input.amount) {
      throw new Error("Insufficient credits for this operation");
    }
    const updated = await deductAICredits(ctx.user.id, input.amount);
    await createAIUsage({
      userId: ctx.user.id,
      type: "image",
      model: input.imageModel,
      prompt: input.prompt,
      creditsCost: input.amount.toString(),
      imageSize: input.imageSize,
      status: "pending"
    });
    return updated;
  }),
  /** Deduct credits for video generation */
  deductCreditsForVideo: protectedProcedure.input(
    import_zod8.z.object({
      amount: import_zod8.z.number().min(1),
      videoModel: import_zod8.z.string().default("runway-ml"),
      prompt: import_zod8.z.string().min(1),
      videoDuration: import_zod8.z.number().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const credits = await getOrCreateAICredits(ctx.user.id);
    const currentBalance = parseFloat(credits.balance.toString());
    if (currentBalance < input.amount) {
      throw new Error("Insufficient credits for this operation");
    }
    const updated = await deductAICredits(ctx.user.id, input.amount);
    await createAIUsage({
      userId: ctx.user.id,
      type: "video",
      model: input.videoModel,
      prompt: input.prompt,
      creditsCost: input.amount.toString(),
      videoDuration: input.videoDuration,
      status: "pending"
    });
    return updated;
  }),
  /** Get user's AI usage history */
  getUsageHistory: protectedProcedure.input(
    import_zod8.z.object({
      limit: import_zod8.z.number().min(1).max(100).default(50),
      offset: import_zod8.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ ctx, input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getUserAIUsage(ctx.user.id, limit, offset);
  }),
  /** Get AI usage statistics */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return getAIUsageStats(ctx.user.id);
  }),
  /** Get available AI models (public) */
  getModels: publicProcedure.query(async () => {
    return [
      {
        id: "dall-e-3",
        name: "DALL-E 3",
        provider: "OpenAI",
        description: "High-quality image generation with excellent prompt following",
        creditCost: 2,
        badge: "Premium",
        sizes: ["1024x1024", "1792x1024", "1024x1792"],
        styles: ["vivid", "natural"],
        qualities: ["standard", "hd"],
        features: ["Revised prompt", "HD quality", "Multiple sizes"]
      },
      {
        id: "nano-banana",
        name: "Nano Banana",
        provider: "Google Gemini 2.5 Flash",
        description: GEMINI_IMAGE_MODELS["nano-banana"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana"].creditCost,
        badge: "Fast",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana"].aspectRatios],
        features: ["Text in images", "Multi-language", "Lowest cost"]
      },
      {
        id: "nano-banana-pro",
        name: "Nano Banana Pro",
        provider: "Google Gemini 3 Pro",
        description: GEMINI_IMAGE_MODELS["nano-banana-pro"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana-pro"].creditCost,
        badge: "4K Studio",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana-pro"].aspectRatios],
        features: ["4K resolution", "Complex layouts", "Precise text rendering", "Google Search grounding"]
      },
      {
        id: "nano-banana-2",
        name: "Nano Banana 2",
        provider: "Google Gemini 3.1 Flash",
        description: GEMINI_IMAGE_MODELS["nano-banana-2"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana-2"].creditCost,
        badge: "New",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana-2"].aspectRatios],
        features: ["0.5K-4K resolution", "Extra aspect ratios", "Image Search grounding", "Production-scale"]
      }
    ];
  }),
  /** Get subscription plans (public) */
  getPlans: publicProcedure.query(async () => {
    return [
      {
        id: "free",
        name: "Free",
        monthlyCredits: 10,
        price: 0,
        features: [
          "10 \u0635\u0648\u0631 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0645\u0639\u064A\u0627\u0631\u064A\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A"
        ]
      },
      {
        id: "pro",
        name: "Pro",
        monthlyCredits: 100,
        price: 29,
        features: [
          "100 \u0635\u0648\u0631\u0629 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0639\u0627\u0644\u064A\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0641\u064A\u062F\u064A\u0648",
          "\u0623\u0648\u0644\u0648\u064A\u0629 \u0641\u064A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629",
          "\u062F\u0639\u0645 \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0627\u062A"
        ]
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyCredits: 1e3,
        price: 99,
        features: [
          "1000 \u0635\u0648\u0631\u0629 \u0634\u0647\u0631\u064A\u0627\u064B",
          "\u062C\u0648\u062F\u0629 \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629",
          "\u0641\u064A\u062F\u064A\u0648\u0647\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629",
          "\u0645\u0639\u0627\u0644\u062C\u0629 \u0641\u0648\u0631\u064A\u0629",
          "\u062F\u0639\u0645 \u0645\u062E\u0635\u0635 24/7",
          "\u0648\u0627\u062C\u0647\u0629 \u0628\u0631\u0645\u062C\u064A\u0629 (API)"
        ]
      }
    ];
  })
});

// server/routers/users.ts
var import_zod9 = require("zod");
var import_server3 = require("@trpc/server");
var import_drizzle_orm3 = require("drizzle-orm");
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new import_server3.TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var usersRouter = router({
  // Get all users (admin only)
  list: adminProcedure2.input(
    import_zod9.z.object({
      limit: import_zod9.z.number().min(1).max(100).default(50),
      offset: import_zod9.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    const [usersList, total] = await Promise.all([
      getAllUsers(limit, offset),
      getUsersCount()
    ]);
    return {
      users: usersList,
      total,
      limit,
      offset
    };
  }),
  // Get single user by ID (admin only)
  getById: adminProcedure2.input(import_zod9.z.object({ id: import_zod9.z.number() })).query(async ({ input }) => {
    const user = await getUserById(input.id);
    if (!user) {
      throw new import_server3.TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }
    return user;
  }),
  // Update user role (admin only)
  updateRole: adminProcedure2.input(
    import_zod9.z.object({
      id: import_zod9.z.number(),
      role: import_zod9.z.enum(["user", "admin"])
    })
  ).mutation(async ({ input }) => {
    const user = await updateUserRole(input.id, input.role);
    if (!user) {
      throw new import_server3.TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }
    return user;
  }),
  // Search users (admin only)
  search: adminProcedure2.input(
    import_zod9.z.object({
      query: import_zod9.z.string().min(1),
      limit: import_zod9.z.number().min(1).max(50).default(20)
    })
  ).query(async ({ input }) => {
    return searchUsers(input.query, input.limit);
  }),
  // Get user statistics (admin only)
  stats: adminProcedure2.query(async () => {
    return getUserStats();
  }),
  // Get current user profile
  profile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
  // Update current user profile
  updateProfile: protectedProcedure.input(
    import_zod9.z.object({
      name: import_zod9.z.string().min(1).max(100).optional(),
      phone: import_zod9.z.string().max(32).nullable().optional(),
      avatarUrl: import_zod9.z.string().url().nullable().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const updated = await updateUserProfile(ctx.user.id, input);
    if (!updated) {
      throw new import_server3.TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      });
    }
    return updated;
  }),
  // Get profile stats for current user (bookings count, reviews count, AI credits)
  profileStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    let bookingsCount = 0;
    let reviewsCount = 0;
    let aiCreditsBalance = 0;
    try {
      const userBookings = await getUserBookings(userId);
      bookingsCount = userBookings.length;
    } catch {
    }
    try {
      const db = await getDb();
      if (db) {
        const userReviews = await db.select({ count: import_drizzle_orm3.sql`count(*)` }).from(reviews).where((0, import_drizzle_orm3.eq)(reviews.userId, userId));
        reviewsCount = userReviews[0]?.count ?? 0;
      }
    } catch {
    }
    try {
      const credits = await getOrCreateAICredits(userId);
      aiCreditsBalance = parseFloat(credits.balance.toString());
    } catch {
    }
    return {
      bookings: bookingsCount,
      reviews: reviewsCount,
      aiCredits: aiCreditsBalance
    };
  })
});

// server/routers/blog.ts
var import_zod10 = require("zod");
var import_server4 = require("@trpc/server");
var adminProcedure3 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new import_server4.TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required"
    });
  }
  return next({ ctx });
});
var blogRouter = router({
  // Public: List published blog posts
  list: publicProcedure.input(
    import_zod10.z.object({
      limit: import_zod10.z.number().min(1).max(50).default(10),
      offset: import_zod10.z.number().min(0).default(0),
      category: import_zod10.z.string().optional()
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 10, offset = 0, category } = input ?? {};
    if (category) {
      return getBlogPostsByCategory(category, limit, offset);
    }
    return getPublishedBlogPosts(limit, offset);
  }),
  // Public: Get single post by slug
  getBySlug: publicProcedure.input(import_zod10.z.object({ slug: import_zod10.z.string() })).query(async ({ input }) => {
    const post = await getBlogPostBySlug(input.slug);
    if (!post) {
      throw new import_server4.TRPCError({
        code: "NOT_FOUND",
        message: "Blog post not found"
      });
    }
    incrementBlogViewCount(post.id).catch(() => {
    });
    return post;
  }),
  // Admin: List all posts (including drafts)
  adminList: adminProcedure3.input(
    import_zod10.z.object({
      limit: import_zod10.z.number().min(1).max(100).default(50),
      offset: import_zod10.z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const { limit = 50, offset = 0 } = input ?? {};
    return getAllBlogPosts(limit, offset);
  }),
  // Admin: Create blog post
  create: adminProcedure3.input(
    import_zod10.z.object({
      slug: import_zod10.z.string().min(1).max(255),
      title: import_zod10.z.string().min(1).max(500),
      excerpt: import_zod10.z.string().min(1),
      content: import_zod10.z.string().min(1),
      metaTitle: import_zod10.z.string().max(70).optional(),
      metaDescription: import_zod10.z.string().max(160).optional(),
      metaKeywords: import_zod10.z.string().max(500).optional(),
      coverImageUrl: import_zod10.z.string().url().optional(),
      category: import_zod10.z.string().max(100).optional(),
      tags: import_zod10.z.array(import_zod10.z.string()).optional(),
      status: import_zod10.z.enum(["draft", "published"]).default("draft"),
      readingTime: import_zod10.z.number().min(1).max(60).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return createBlogPost({
      ...input,
      authorId: ctx.user.id,
      authorName: ctx.user.name || "VANIR GROUP",
      publishedAt: input.status === "published" ? /* @__PURE__ */ new Date() : void 0
    });
  }),
  // Admin: Update blog post
  update: adminProcedure3.input(
    import_zod10.z.object({
      id: import_zod10.z.number(),
      slug: import_zod10.z.string().min(1).max(255).optional(),
      title: import_zod10.z.string().min(1).max(500).optional(),
      excerpt: import_zod10.z.string().min(1).optional(),
      content: import_zod10.z.string().min(1).optional(),
      metaTitle: import_zod10.z.string().max(70).optional(),
      metaDescription: import_zod10.z.string().max(160).optional(),
      metaKeywords: import_zod10.z.string().max(500).optional(),
      coverImageUrl: import_zod10.z.string().url().optional(),
      category: import_zod10.z.string().max(100).optional(),
      tags: import_zod10.z.array(import_zod10.z.string()).optional(),
      status: import_zod10.z.enum(["draft", "published", "archived"]).optional(),
      readingTime: import_zod10.z.number().min(1).max(60).optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const updated = await updateBlogPost(id, {
      ...data,
      publishedAt: data.status === "published" ? /* @__PURE__ */ new Date() : void 0
    });
    if (!updated) {
      throw new import_server4.TRPCError({
        code: "NOT_FOUND",
        message: "Blog post not found"
      });
    }
    return updated;
  })
});

// server/routers/marketing.ts
var import_zod11 = require("zod");
var import_server5 = require("@trpc/server");

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/routers/marketing.ts
var import_drizzle_orm4 = require("drizzle-orm");
var SYSTEM_PROMPTS = {
  social_media: `You are an expert tourism social media content creator for VANIR GROUP, a luxury Egyptian travel company. 
Create engaging, platform-optimized social media posts that highlight Egypt's ancient wonders, luxury experiences, and cultural richness.
Always include relevant hashtags. Adapt tone and length to the specified platform.
For Instagram: visual storytelling, 2200 char max, 20-30 hashtags.
For Facebook: longer narrative, engagement questions, 1-5 hashtags.
For Twitter/X: concise, punchy, 280 char max, 3-5 hashtags.
For LinkedIn: professional, industry insights, 3-5 hashtags.
For TikTok: trendy, casual, hook-first, 5-10 hashtags.`,
  email: `You are an expert email marketing specialist for VANIR GROUP, a luxury Egyptian travel company.
Create compelling email campaigns that drive bookings and engagement.
Structure emails with: Subject line, Preview text, Header, Body (with sections), CTA button text, and Footer.
Use persuasive copywriting techniques while maintaining a luxurious, trustworthy tone.
Include personalization placeholders like {{first_name}}, {{destination}}.`,
  trip_description: `You are a luxury travel copywriter for VANIR GROUP, specializing in Egyptian tourism.
Create vivid, immersive trip descriptions that transport readers to the destination.
Include: Overview, Highlights, Itinerary outline, What's included, Pricing hint, and Booking CTA.
Write in a way that appeals to discerning travelers seeking authentic, premium experiences.
Support multiple languages when requested.`,
  blog_seo: `You are an SEO content specialist for VANIR GROUP, a luxury Egyptian travel company.
Create SEO-optimized blog articles about Egyptian travel, culture, and tourism.
Include: Title (with primary keyword), Meta description (155 chars), Introduction, 3-5 H2 sections with detailed content, Conclusion with CTA.
Naturally incorporate keywords without stuffing. Write engaging, informative content that ranks well.
Target word count: 1500-2500 words.`,
  ad_copy: `You are an advertising copywriter for VANIR GROUP, a luxury Egyptian travel company.
Create compelling ad copy for various platforms (Google Ads, Facebook Ads, Display Ads).
For Google Ads: Headlines (30 chars each), Descriptions (90 chars each).
For Facebook/Instagram Ads: Primary text, Headline, Description, CTA.
For Display Ads: Headline, Subheadline, Body, CTA.
Focus on unique selling points, urgency, and luxury appeal.`
};
var TONE_INSTRUCTIONS = {
  luxurious: "Use elegant, sophisticated language that conveys exclusivity and premium quality.",
  adventurous: "Use exciting, dynamic language that inspires exploration and discovery.",
  professional: "Use formal, authoritative language suitable for business communications.",
  casual: "Use friendly, conversational language that feels approachable and warm.",
  romantic: "Use poetic, evocative language that appeals to couples and honeymoon travelers.",
  cultural: "Use educational, respectful language that highlights heritage and traditions."
};
var marketingRouter = router({
  /**
   * Generate marketing content using AI
   */
  generate: protectedProcedure.input(
    import_zod11.z.object({
      type: import_zod11.z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]),
      platform: import_zod11.z.string().optional(),
      prompt: import_zod11.z.string().min(5, "Prompt must be at least 5 characters"),
      language: import_zod11.z.string().default("en"),
      tone: import_zod11.z.string().default("luxurious"),
      destination: import_zod11.z.string().optional(),
      templateId: import_zod11.z.number().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    let systemPrompt = SYSTEM_PROMPTS[input.type] || SYSTEM_PROMPTS.social_media;
    const toneInstruction = TONE_INSTRUCTIONS[input.tone] || TONE_INSTRUCTIONS.luxurious;
    systemPrompt += `

Tone: ${toneInstruction}`;
    if (input.language !== "en") {
      const langMap = {
        ar: "Arabic",
        fr: "French",
        de: "German",
        es: "Spanish",
        it: "Italian",
        pt: "Portuguese",
        zh: "Chinese",
        ja: "Japanese",
        ko: "Korean",
        ru: "Russian"
      };
      const langName = langMap[input.language] || input.language;
      systemPrompt += `

IMPORTANT: Write the entire content in ${langName}.`;
    }
    if (input.platform) {
      systemPrompt += `

Target platform: ${input.platform}. Optimize content format and length for this platform.`;
    }
    if (input.destination) {
      systemPrompt += `

Focus destination: ${input.destination}. Include specific details about this destination.`;
    }
    if (input.templateId) {
      const [template] = await db.select().from(marketingTemplates).where((0, import_drizzle_orm4.eq)(marketingTemplates.id, input.templateId)).limit(1);
      if (template?.systemPrompt) {
        systemPrompt += `

Template context: ${template.systemPrompt}`;
      }
      if (template?.templateContent) {
        systemPrompt += `

Follow this template structure:
${template.templateContent}`;
      }
    }
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "marketing_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Content title or subject line" },
              content: { type: "string", description: "The main generated content" },
              hashtags: {
                type: "array",
                items: { type: "string" },
                description: "Relevant hashtags (without # prefix)"
              },
              metadata: {
                type: "object",
                properties: {
                  wordCount: { type: "number", description: "Approximate word count" },
                  readingTime: { type: "number", description: "Estimated reading time in minutes" },
                  seoScore: { type: "number", description: "Estimated SEO score 1-100 (for blog/SEO content)" }
                },
                required: ["wordCount", "readingTime", "seoScore"],
                additionalProperties: false
              }
            },
            required: ["title", "content", "hashtags", "metadata"],
            additionalProperties: false
          }
        }
      }
    });
    const rawContent = response.choices[0]?.message?.content;
    const contentStr = typeof rawContent === "string" ? rawContent : "";
    let parsed;
    try {
      parsed = JSON.parse(contentStr);
    } catch {
      parsed = {
        title: input.prompt.slice(0, 100),
        content: contentStr,
        hashtags: [],
        metadata: { wordCount: 0, readingTime: 0, seoScore: 0 }
      };
    }
    const [saved] = await db.insert(marketingContent).values({
      userId: ctx.user.id,
      type: input.type,
      platform: input.platform || null,
      title: parsed.title,
      content: parsed.content,
      prompt: input.prompt,
      language: input.language,
      tone: input.tone,
      destination: input.destination || null,
      hashtags: parsed.hashtags,
      creditsCost: "1"
    }).$returningId();
    return {
      id: saved.id,
      title: parsed.title,
      content: parsed.content,
      hashtags: parsed.hashtags,
      metadata: parsed.metadata,
      type: input.type,
      platform: input.platform
    };
  }),
  /**
   * List user's generated content
   */
  listContent: protectedProcedure.input(
    import_zod11.z.object({
      type: import_zod11.z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional(),
      limit: import_zod11.z.number().min(1).max(50).default(20),
      offset: import_zod11.z.number().min(0).default(0)
    })
  ).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const conditions = [(0, import_drizzle_orm4.eq)(marketingContent.userId, ctx.user.id)];
    if (input.type) {
      conditions.push((0, import_drizzle_orm4.eq)(marketingContent.type, input.type));
    }
    const items = await db.select().from(marketingContent).where((0, import_drizzle_orm4.and)(...conditions)).orderBy((0, import_drizzle_orm4.desc)(marketingContent.createdAt)).limit(input.limit).offset(input.offset);
    const [countResult] = await db.select({ count: import_drizzle_orm4.sql`count(*)` }).from(marketingContent).where((0, import_drizzle_orm4.and)(...conditions));
    return {
      items,
      total: countResult?.count || 0
    };
  }),
  /**
   * Toggle favorite status
   */
  toggleFavorite: protectedProcedure.input(import_zod11.z.object({ id: import_zod11.z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [item] = await db.select().from(marketingContent).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(marketingContent.id, input.id), (0, import_drizzle_orm4.eq)(marketingContent.userId, ctx.user.id))).limit(1);
    if (!item) throw new import_server5.TRPCError({ code: "NOT_FOUND" });
    const newStatus = item.isFavorite === "yes" ? "no" : "yes";
    await db.update(marketingContent).set({ isFavorite: newStatus }).where((0, import_drizzle_orm4.eq)(marketingContent.id, input.id));
    return { isFavorite: newStatus };
  }),
  /**
   * Delete content
   */
  deleteContent: protectedProcedure.input(import_zod11.z.object({ id: import_zod11.z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [item] = await db.select().from(marketingContent).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(marketingContent.id, input.id), (0, import_drizzle_orm4.eq)(marketingContent.userId, ctx.user.id))).limit(1);
    if (!item) throw new import_server5.TRPCError({ code: "NOT_FOUND" });
    await db.delete(marketingContent).where((0, import_drizzle_orm4.eq)(marketingContent.id, input.id));
    return { success: true };
  }),
  // ─── Calendar ───
  /**
   * List calendar entries
   */
  listCalendar: protectedProcedure.input(
    import_zod11.z.object({
      startDate: import_zod11.z.number().optional(),
      endDate: import_zod11.z.number().optional()
    })
  ).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const conditions = [(0, import_drizzle_orm4.eq)(marketingCalendar.userId, ctx.user.id)];
    if (input.startDate) {
      conditions.push(import_drizzle_orm4.sql`${marketingCalendar.scheduledDate} >= ${input.startDate}`);
    }
    if (input.endDate) {
      conditions.push(import_drizzle_orm4.sql`${marketingCalendar.scheduledDate} <= ${input.endDate}`);
    }
    return db.select().from(marketingCalendar).where((0, import_drizzle_orm4.and)(...conditions)).orderBy(marketingCalendar.scheduledDate);
  }),
  /**
   * Add calendar entry
   */
  addCalendarEntry: protectedProcedure.input(
    import_zod11.z.object({
      contentId: import_zod11.z.number().optional(),
      title: import_zod11.z.string().min(1),
      description: import_zod11.z.string().optional(),
      platform: import_zod11.z.string().optional(),
      scheduledDate: import_zod11.z.number(),
      status: import_zod11.z.enum(["draft", "scheduled", "published", "cancelled"]).default("draft"),
      colorTag: import_zod11.z.string().default("#D4A853")
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [entry] = await db.insert(marketingCalendar).values({
      userId: ctx.user.id,
      contentId: input.contentId || null,
      title: input.title,
      description: input.description || null,
      platform: input.platform || null,
      scheduledDate: input.scheduledDate,
      status: input.status,
      colorTag: input.colorTag
    }).$returningId();
    return { id: entry.id };
  }),
  /**
   * Update calendar entry status
   */
  updateCalendarEntry: protectedProcedure.input(
    import_zod11.z.object({
      id: import_zod11.z.number(),
      title: import_zod11.z.string().optional(),
      description: import_zod11.z.string().optional(),
      scheduledDate: import_zod11.z.number().optional(),
      status: import_zod11.z.enum(["draft", "scheduled", "published", "cancelled"]).optional(),
      colorTag: import_zod11.z.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const { id, ...updates } = input;
    const [item] = await db.select().from(marketingCalendar).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(marketingCalendar.id, id), (0, import_drizzle_orm4.eq)(marketingCalendar.userId, ctx.user.id))).limit(1);
    if (!item) throw new import_server5.TRPCError({ code: "NOT_FOUND" });
    const cleanUpdates = {};
    if (updates.title !== void 0) cleanUpdates.title = updates.title;
    if (updates.description !== void 0) cleanUpdates.description = updates.description;
    if (updates.scheduledDate !== void 0) cleanUpdates.scheduledDate = updates.scheduledDate;
    if (updates.status !== void 0) cleanUpdates.status = updates.status;
    if (updates.colorTag !== void 0) cleanUpdates.colorTag = updates.colorTag;
    if (Object.keys(cleanUpdates).length > 0) {
      await db.update(marketingCalendar).set(cleanUpdates).where((0, import_drizzle_orm4.eq)(marketingCalendar.id, id));
    }
    return { success: true };
  }),
  /**
   * Delete calendar entry
   */
  deleteCalendarEntry: protectedProcedure.input(import_zod11.z.object({ id: import_zod11.z.number() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [item] = await db.select().from(marketingCalendar).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(marketingCalendar.id, input.id), (0, import_drizzle_orm4.eq)(marketingCalendar.userId, ctx.user.id))).limit(1);
    if (!item) throw new import_server5.TRPCError({ code: "NOT_FOUND" });
    await db.delete(marketingCalendar).where((0, import_drizzle_orm4.eq)(marketingCalendar.id, input.id));
    return { success: true };
  }),
  // ─── Templates ───
  /**
   * List available templates
   */
  listTemplates: publicProcedure.input(
    import_zod11.z.object({
      type: import_zod11.z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional()
    })
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const conditions = [];
    if (input.type) {
      conditions.push((0, import_drizzle_orm4.eq)(marketingTemplates.type, input.type));
    }
    return db.select().from(marketingTemplates).where(conditions.length > 0 ? (0, import_drizzle_orm4.and)(...conditions) : void 0).orderBy(marketingTemplates.sortOrder);
  }),
  /**
   * Get content generation stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    if (!db) throw new import_server5.TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [totalContent] = await db.select({ count: import_drizzle_orm4.sql`count(*)` }).from(marketingContent).where((0, import_drizzle_orm4.eq)(marketingContent.userId, ctx.user.id));
    const [socialCount] = await db.select({ count: import_drizzle_orm4.sql`count(*)` }).from(marketingContent).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(marketingContent.userId, ctx.user.id), (0, import_drizzle_orm4.eq)(marketingContent.type, "social_media")));
    const [emailCount] = await db.select({ count: import_drizzle_orm4.sql`count(*)` }).from(marketingContent).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(marketingContent.userId, ctx.user.id), (0, import_drizzle_orm4.eq)(marketingContent.type, "email")));
    const [blogCount] = await db.select({ count: import_drizzle_orm4.sql`count(*)` }).from(marketingContent).where((0, import_drizzle_orm4.and)((0, import_drizzle_orm4.eq)(marketingContent.userId, ctx.user.id), (0, import_drizzle_orm4.eq)(marketingContent.type, "blog_seo")));
    const [calendarCount] = await db.select({ count: import_drizzle_orm4.sql`count(*)` }).from(marketingCalendar).where((0, import_drizzle_orm4.eq)(marketingCalendar.userId, ctx.user.id));
    return {
      totalContent: totalContent?.count || 0,
      socialMedia: socialCount?.count || 0,
      emails: emailCount?.count || 0,
      blogPosts: blogCount?.count || 0,
      calendarEntries: calendarCount?.count || 0
    };
  })
});

// server/routers/admin.destinations.ts
var import_zod12 = require("zod");
var import_drizzle_orm5 = require("drizzle-orm");
var adminDestinationsRouter = router({
  /** List all destinations with pagination and filtering */
  list: adminProcedure.input(
    import_zod12.z.object({
      limit: import_zod12.z.number().min(1).max(100).default(20),
      offset: import_zod12.z.number().min(0).default(0),
      search: import_zod12.z.string().optional(),
      sortBy: import_zod12.z.enum(["name", "rating", "price", "createdAt"]).default("name"),
      sortOrder: import_zod12.z.enum(["asc", "desc"]).default("asc")
    }).optional()
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { limit = 20, offset = 0, search = "", sortBy = "name", sortOrder = "asc" } = input ?? {};
    let query = db.select().from(destinations);
    if (search) {
      query = query.where((0, import_drizzle_orm5.like)(destinations.name, `%${search}%`));
    }
    const orderColumn = sortBy === "name" ? destinations.name : sortBy === "rating" ? destinations.rating : sortBy === "price" ? destinations.pricePerPerson : destinations.createdAt;
    query = query.orderBy(sortOrder === "desc" ? (0, import_drizzle_orm5.desc)(orderColumn) : (0, import_drizzle_orm5.asc)(orderColumn));
    query = query.limit(limit).offset(offset);
    return await query;
  }),
  /** Get single destination by ID */
  getById: adminProcedure.input(import_zod12.z.object({ id: import_zod12.z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(destinations).where((0, import_drizzle_orm5.eq)(destinations.id, input.id));
    return result[0] || null;
  }),
  /** Create new destination */
  create: adminProcedure.input(
    import_zod12.z.object({
      name: import_zod12.z.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0648\u062C\u0647\u0629 \u0645\u0637\u0644\u0648\u0628"),
      description: import_zod12.z.string().optional(),
      location: import_zod12.z.string().min(1, "\u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0637\u0644\u0648\u0628"),
      pricePerPerson: import_zod12.z.string().optional(),
      rating: import_zod12.z.string().optional(),
      imageUrl: import_zod12.z.string().optional(),
      highlights: import_zod12.z.string().optional(),
      bestTimeToVisit: import_zod12.z.string().optional(),
      duration: import_zod12.z.string().optional(),
      difficulty: import_zod12.z.enum(["easy", "moderate", "hard"]).optional(),
      groupSize: import_zod12.z.string().optional(),
      inclusions: import_zod12.z.string().optional(),
      exclusions: import_zod12.z.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(destinations).values({
      ...input,
      isActive: "active"
    });
    return { success: true };
  }),
  /** Update destination */
  update: adminProcedure.input(
    import_zod12.z.object({
      id: import_zod12.z.number(),
      name: import_zod12.z.string().optional(),
      description: import_zod12.z.string().optional(),
      location: import_zod12.z.string().optional(),
      pricePerPerson: import_zod12.z.string().optional(),
      rating: import_zod12.z.string().optional(),
      imageUrl: import_zod12.z.string().optional(),
      highlights: import_zod12.z.string().optional(),
      bestTimeToVisit: import_zod12.z.string().optional(),
      duration: import_zod12.z.string().optional(),
      difficulty: import_zod12.z.enum(["easy", "moderate", "hard"]).optional(),
      groupSize: import_zod12.z.string().optional(),
      inclusions: import_zod12.z.string().optional(),
      exclusions: import_zod12.z.string().optional(),
      isActive: import_zod12.z.enum(["active", "inactive"]).optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(destinations).set(data).where((0, import_drizzle_orm5.eq)(destinations.id, id));
    return { success: true };
  }),
  /** Delete destination */
  delete: adminProcedure.input(import_zod12.z.object({ id: import_zod12.z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(destinations).where((0, import_drizzle_orm5.eq)(destinations.id, input.id));
    return { success: true };
  }),
  /** Bulk delete destinations */
  bulkDelete: adminProcedure.input(import_zod12.z.object({ ids: import_zod12.z.array(import_zod12.z.number()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(destinations).where((0, import_drizzle_orm5.inArray)(destinations.id, input.ids));
    return { success: true, deleted: input.ids.length };
  }),
  /** Update destination status (active/inactive) */
  updateStatus: adminProcedure.input(import_zod12.z.object({ id: import_zod12.z.number(), isActive: import_zod12.z.enum(["active", "inactive"]) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(destinations).set({
      isActive: input.isActive
    }).where((0, import_drizzle_orm5.eq)(destinations.id, input.id));
    return { success: true };
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allDestinations = await db.select().from(destinations);
    const activeCount = allDestinations.filter((d) => d.isActive === "active").length;
    const avgRating = allDestinations.length > 0 ? (allDestinations.reduce((sum, d) => sum + (parseFloat(d.rating) || 0), 0) / allDestinations.length).toFixed(2) : 0;
    const avgPrice = allDestinations.length > 0 ? (allDestinations.reduce((sum, d) => sum + (parseFloat(d.pricePerPerson) || 0), 0) / allDestinations.length).toFixed(2) : 0;
    return {
      total: allDestinations.length,
      active: activeCount,
      inactive: allDestinations.length - activeCount,
      avgRating: parseFloat(avgRating),
      avgPrice: parseFloat(avgPrice)
    };
  })
});

// server/routers/admin.offers.ts
var import_zod13 = require("zod");
var import_drizzle_orm6 = require("drizzle-orm");
var adminOffersRouter = router({
  /** List all offers with pagination and filtering */
  list: adminProcedure.input(
    import_zod13.z.object({
      limit: import_zod13.z.number().min(1).max(100).default(20),
      offset: import_zod13.z.number().min(0).default(0),
      search: import_zod13.z.string().optional(),
      status: import_zod13.z.enum(["active", "inactive", "expired"]).optional(),
      sortBy: import_zod13.z.enum(["title", "discount", "createdAt", "startDate"]).default("createdAt"),
      sortOrder: import_zod13.z.enum(["asc", "desc"]).default("desc")
    }).optional()
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { limit = 20, offset = 0, search = "", status, sortBy = "createdAt", sortOrder = "desc" } = input ?? {};
    let query = db.select().from(offers);
    if (search) {
      query = query.where((0, import_drizzle_orm6.like)(offers.title, `%${search}%`));
    }
    if (status) {
      query = query.where((0, import_drizzle_orm6.eq)(offers.isActive, status));
    }
    const orderColumn = sortBy === "title" ? offers.title : sortBy === "discount" ? offers.discountValue : sortBy === "startDate" ? offers.startDate : offers.createdAt;
    query = query.orderBy(sortOrder === "desc" ? (0, import_drizzle_orm6.desc)(orderColumn) : (0, import_drizzle_orm6.asc)(orderColumn));
    query = query.limit(limit).offset(offset);
    return await query;
  }),
  /** Get single offer by ID */
  getById: adminProcedure.input(import_zod13.z.object({ id: import_zod13.z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(offers).where((0, import_drizzle_orm6.eq)(offers.id, input.id));
    return result[0] || null;
  }),
  /** Create new offer */
  create: adminProcedure.input(
    import_zod13.z.object({
      title: import_zod13.z.string().min(1, "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0639\u0631\u0636 \u0645\u0637\u0644\u0648\u0628"),
      description: import_zod13.z.string().optional(),
      discountType: import_zod13.z.enum(["percentage", "fixed"]),
      discountValue: import_zod13.z.string(),
      promoCode: import_zod13.z.string().optional(),
      startDate: import_zod13.z.number(),
      endDate: import_zod13.z.number(),
      category: import_zod13.z.string().optional(),
      destination: import_zod13.z.string().optional(),
      imageUrl: import_zod13.z.string().optional(),
      totalSpots: import_zod13.z.number().optional(),
      badgeText: import_zod13.z.string().optional(),
      badgeColor: import_zod13.z.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(offers).values({
      ...input,
      isActive: "active",
      bookedSpots: 0
    });
    return { success: true };
  }),
  /** Update offer */
  update: adminProcedure.input(
    import_zod13.z.object({
      id: import_zod13.z.number(),
      title: import_zod13.z.string().optional(),
      description: import_zod13.z.string().optional(),
      discountType: import_zod13.z.enum(["percentage", "fixed"]).optional(),
      discountValue: import_zod13.z.string().optional(),
      promoCode: import_zod13.z.string().optional(),
      startDate: import_zod13.z.number().optional(),
      endDate: import_zod13.z.number().optional(),
      category: import_zod13.z.string().optional(),
      destination: import_zod13.z.string().optional(),
      imageUrl: import_zod13.z.string().optional(),
      totalSpots: import_zod13.z.number().optional(),
      badgeText: import_zod13.z.string().optional(),
      badgeColor: import_zod13.z.string().optional(),
      isActive: import_zod13.z.enum(["active", "inactive", "expired"]).optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(offers).set(data).where((0, import_drizzle_orm6.eq)(offers.id, id));
    return { success: true };
  }),
  /** Delete offer */
  delete: adminProcedure.input(import_zod13.z.object({ id: import_zod13.z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(offers).where((0, import_drizzle_orm6.eq)(offers.id, input.id));
    return { success: true };
  }),
  /** Bulk delete offers */
  bulkDelete: adminProcedure.input(import_zod13.z.object({ ids: import_zod13.z.array(import_zod13.z.number()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(offers).where((0, import_drizzle_orm6.inArray)(offers.id, input.ids));
    return { success: true, deleted: input.ids.length };
  }),
  /** Update offer status */
  updateStatus: adminProcedure.input(import_zod13.z.object({ id: import_zod13.z.number(), isActive: import_zod13.z.enum(["active", "inactive", "expired"]) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(offers).set({
      isActive: input.isActive
    }).where((0, import_drizzle_orm6.eq)(offers.id, input.id));
    return { success: true };
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allOffers = await db.select().from(offers);
    const activeCount = allOffers.filter((o) => o.isActive === "active").length;
    const totalDiscount = allOffers.reduce((sum, o) => sum + (parseFloat(o.discountValue) || 0), 0);
    const avgDiscount = allOffers.length > 0 ? (totalDiscount / allOffers.length).toFixed(2) : 0;
    return {
      total: allOffers.length,
      active: activeCount,
      inactive: allOffers.length - activeCount,
      avgDiscount: parseFloat(avgDiscount)
    };
  })
});

// server/routers/admin.blog.ts
var import_zod14 = require("zod");
var import_drizzle_orm7 = require("drizzle-orm");
var adminBlogRouter = router({
  /** List all blog posts with pagination and filtering */
  list: adminProcedure.input(
    import_zod14.z.object({
      limit: import_zod14.z.number().min(1).max(100).default(20),
      offset: import_zod14.z.number().min(0).default(0),
      search: import_zod14.z.string().optional(),
      status: import_zod14.z.enum(["draft", "published", "archived"]).optional(),
      category: import_zod14.z.string().optional(),
      sortBy: import_zod14.z.enum(["title", "publishedAt", "createdAt", "viewCount"]).default("createdAt"),
      sortOrder: import_zod14.z.enum(["asc", "desc"]).default("desc")
    }).optional()
  ).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { limit = 20, offset = 0, search = "", status, category, sortBy = "createdAt", sortOrder = "desc" } = input ?? {};
    let query = db.select().from(blogPosts);
    if (search) {
      query = query.where((0, import_drizzle_orm7.like)(blogPosts.title, `%${search}%`));
    }
    if (status) {
      query = query.where((0, import_drizzle_orm7.eq)(blogPosts.status, status));
    }
    if (category) {
      query = query.where((0, import_drizzle_orm7.eq)(blogPosts.category, category));
    }
    const orderColumn = sortBy === "title" ? blogPosts.title : sortBy === "publishedAt" ? blogPosts.publishedAt : sortBy === "viewCount" ? blogPosts.viewCount : blogPosts.createdAt;
    query = query.orderBy(sortOrder === "desc" ? (0, import_drizzle_orm7.desc)(orderColumn) : (0, import_drizzle_orm7.asc)(orderColumn));
    query = query.limit(limit).offset(offset);
    return await query;
  }),
  /** Get single blog post by ID */
  getById: adminProcedure.input(import_zod14.z.object({ id: import_zod14.z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(blogPosts).where((0, import_drizzle_orm7.eq)(blogPosts.id, input.id));
    return result[0] || null;
  }),
  /** Get blog post by slug */
  getBySlug: adminProcedure.input(import_zod14.z.object({ slug: import_zod14.z.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(blogPosts).where((0, import_drizzle_orm7.eq)(blogPosts.slug, input.slug));
    return result[0] || null;
  }),
  /** Create new blog post */
  create: adminProcedure.input(
    import_zod14.z.object({
      slug: import_zod14.z.string().min(1, "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0648\u062F\u0648\u062F \u0645\u0637\u0644\u0648\u0628"),
      title: import_zod14.z.string().min(1, "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
      excerpt: import_zod14.z.string().min(1, "\u0627\u0644\u0645\u0644\u062E\u0635 \u0645\u0637\u0644\u0648\u0628"),
      content: import_zod14.z.string().min(1, "\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0642\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
      metaTitle: import_zod14.z.string().optional(),
      metaDescription: import_zod14.z.string().optional(),
      metaKeywords: import_zod14.z.string().optional(),
      coverImageUrl: import_zod14.z.string().optional(),
      category: import_zod14.z.string().optional(),
      tags: import_zod14.z.array(import_zod14.z.string()).optional(),
      authorName: import_zod14.z.string().optional(),
      readingTime: import_zod14.z.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.insert(blogPosts).values({
      ...input,
      status: "draft",
      viewCount: 0
    });
    return { success: true };
  }),
  /** Update blog post */
  update: adminProcedure.input(
    import_zod14.z.object({
      id: import_zod14.z.number(),
      slug: import_zod14.z.string().optional(),
      title: import_zod14.z.string().optional(),
      excerpt: import_zod14.z.string().optional(),
      content: import_zod14.z.string().optional(),
      metaTitle: import_zod14.z.string().optional(),
      metaDescription: import_zod14.z.string().optional(),
      metaKeywords: import_zod14.z.string().optional(),
      coverImageUrl: import_zod14.z.string().optional(),
      category: import_zod14.z.string().optional(),
      tags: import_zod14.z.array(import_zod14.z.string()).optional(),
      authorName: import_zod14.z.string().optional(),
      readingTime: import_zod14.z.number().optional(),
      status: import_zod14.z.enum(["draft", "published", "archived"]).optional()
    })
  ).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...data } = input;
    await db.update(blogPosts).set(data).where((0, import_drizzle_orm7.eq)(blogPosts.id, id));
    return { success: true };
  }),
  /** Delete blog post */
  delete: adminProcedure.input(import_zod14.z.object({ id: import_zod14.z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(blogPosts).where((0, import_drizzle_orm7.eq)(blogPosts.id, input.id));
    return { success: true };
  }),
  /** Bulk delete blog posts */
  bulkDelete: adminProcedure.input(import_zod14.z.object({ ids: import_zod14.z.array(import_zod14.z.number()) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(blogPosts).where((0, import_drizzle_orm7.inArray)(blogPosts.id, input.ids));
    return { success: true, deleted: input.ids.length };
  }),
  /** Publish blog post */
  publish: adminProcedure.input(import_zod14.z.object({ id: import_zod14.z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(blogPosts).set({
      status: "published",
      publishedAt: /* @__PURE__ */ new Date()
    }).where((0, import_drizzle_orm7.eq)(blogPosts.id, input.id));
    return { success: true };
  }),
  /** Archive blog post */
  archive: adminProcedure.input(import_zod14.z.object({ id: import_zod14.z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(blogPosts).set({
      status: "archived"
    }).where((0, import_drizzle_orm7.eq)(blogPosts.id, input.id));
    return { success: true };
  }),
  /** Get statistics */
  getStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const allPosts = await db.select().from(blogPosts);
    const publishedCount = allPosts.filter((p) => p.status === "published").length;
    const draftCount = allPosts.filter((p) => p.status === "draft").length;
    const totalViews = allPosts.reduce((sum, p) => sum + (p.viewCount || 0), 0);
    const avgViews = allPosts.length > 0 ? (totalViews / allPosts.length).toFixed(0) : 0;
    return {
      total: allPosts.length,
      published: publishedCount,
      draft: draftCount,
      archived: allPosts.length - publishedCount - draftCount,
      totalViews,
      avgViews: parseInt(avgViews)
    };
  })
});

// server/routers/aiCommand.ts
var import_zod15 = require("zod");
var import_nanoid4 = require("nanoid");
var VANIR_SYSTEM_PROMPT = `You are the AI Command Center assistant for Vanir Travel Group \u2014 a luxury travel company specializing in Egyptian heritage and premium travel experiences. You combine ancient Egyptian elegance with modern luxury.

Brand voice: Sophisticated, knowledgeable, warm yet professional. Use rich descriptive language that evokes luxury and wonder.

Company details:
- Name: Vanir Travel Group (Vanir Group)
- Specialty: Luxury travel, Egyptian heritage tours, premium experiences
- Style: Art Deco, Black & Gold aesthetic
- Target audience: High-net-worth travelers, culture enthusiasts, luxury seekers

You are fluent in both Arabic and English. Respond in the same language the user writes in.
Always provide actionable, specific, and professional responses.`;
var TASK_PROMPTS = {
  content_writer: `${VANIR_SYSTEM_PROMPT}

You are a premium content writer for Vanir Travel Group. Your task is to create compelling, luxury-oriented travel content.

Guidelines:
- Write in an elegant, evocative style that captures the magic of travel
- Highlight unique experiences, cultural richness, and luxury amenities
- Use sensory language that transports the reader
- Include relevant keywords naturally for SEO
- Maintain the brand's sophisticated tone
- Format output in clean Markdown with headers, paragraphs, and lists where appropriate`,
  seo_analyst: `${VANIR_SYSTEM_PROMPT}

You are an expert SEO analyst for Vanir Travel Group. Analyze and optimize content for search engines.

Your capabilities:
- Audit page titles, meta descriptions, and keywords
- Suggest improvements for search rankings
- Analyze keyword density and relevance
- Recommend internal/external linking strategies
- Provide structured SEO reports with scores
- Suggest schema markup improvements
- Analyze competitor keywords in the luxury travel space

Format your analysis with clear sections, scores (1-100), and actionable recommendations.`,
  offer_generator: `${VANIR_SYSTEM_PROMPT}

You are a luxury travel offer creator for Vanir Travel Group. Design irresistible travel packages.

When creating offers:
- Include a compelling title and tagline
- Detail the itinerary day by day
- List included amenities and experiences
- Set pricing tiers (Standard, Premium, Royal)
- Add urgency elements (limited availability, seasonal)
- Highlight unique selling points
- Include terms and conditions summary

Format as a structured offer document in Markdown.`,
  data_analyst: `${VANIR_SYSTEM_PROMPT}

You are a data analyst for Vanir Travel Group. Analyze business metrics and provide insights.

Your capabilities:
- Analyze booking trends and patterns
- Revenue analysis and forecasting
- Customer segmentation insights
- Seasonal demand analysis
- Performance benchmarking
- ROI calculations for marketing campaigns
- Conversion funnel analysis

Provide data-driven insights with specific numbers, percentages, and actionable recommendations.
Use tables and structured formats for clarity.`,
  customer_support: `${VANIR_SYSTEM_PROMPT}

You are a premium customer support specialist for Vanir Travel Group. Handle customer inquiries with grace and professionalism.

Guidelines:
- Respond with warmth and empathy
- Provide detailed, helpful solutions
- Maintain the luxury brand experience in every interaction
- Offer alternatives when the requested option isn't available
- Use professional yet friendly language
- Include relevant policies when needed
- Escalate appropriately when necessary

Draft professional email responses that maintain the Vanir luxury standard.`,
  translator: `${VANIR_SYSTEM_PROMPT}

You are a professional translator for Vanir Travel Group. Translate content between Arabic and English while maintaining the luxury brand voice.

Guidelines:
- Preserve the tone and style of the original text
- Adapt cultural references appropriately
- Maintain marketing appeal in translations
- Keep technical terms accurate
- Preserve formatting and structure
- Add cultural context notes when helpful`,
  social_media: `${VANIR_SYSTEM_PROMPT}

You are a social media strategist for Vanir Travel Group. Create engaging social media content.

Capabilities:
- Write posts for Instagram, Facebook, Twitter/X, LinkedIn
- Create hashtag strategies
- Design content calendars
- Write engaging captions with CTAs
- Create story/reel scripts
- Suggest visual content ideas
- Plan influencer collaboration briefs

Adapt tone for each platform while maintaining brand consistency.`,
  itinerary_planner: `${VANIR_SYSTEM_PROMPT}

You are an expert luxury itinerary planner for Vanir Travel Group. Design detailed, day-by-day travel itineraries.

When creating itineraries:
- Structure each day with morning, afternoon, and evening activities
- Include luxury hotel recommendations with room categories
- Add restaurant suggestions with cuisine types
- Include private transportation arrangements
- Suggest optional VIP experiences and upgrades
- Add practical tips (best time to visit, dress code, local customs)
- Include estimated timing for each activity
- Factor in rest periods and leisure time for luxury travelers

Format as a beautifully structured day-by-day itinerary in Markdown.`,
  review_responder: `${VANIR_SYSTEM_PROMPT}

You are a guest relations specialist for Vanir Travel Group. Craft thoughtful, personalized responses to guest reviews.

Guidelines:
- Always thank the guest by name when available
- Address specific points mentioned in their review
- For positive reviews: express genuine gratitude, highlight what made their experience special
- For negative reviews: apologize sincerely, acknowledge the issue, explain corrective actions, offer resolution
- Maintain professional warmth without being defensive
- Invite them to return and mention upcoming experiences
- Keep responses concise but heartfelt (150-250 words)

Provide responses ready to post on TripAdvisor, Google, and Booking.com.`,
  pricing_advisor: `${VANIR_SYSTEM_PROMPT}

You are a revenue management and pricing strategist for Vanir Travel Group.

Your capabilities:
- Analyze competitive pricing in the luxury travel market
- Suggest dynamic pricing strategies based on seasonality
- Calculate profit margins and break-even points
- Design tiered pricing structures (Standard, Premium, Royal, Ultra-Luxury)
- Recommend upselling and cross-selling strategies
- Analyze price elasticity for different market segments
- Create promotional pricing calendars

Provide specific numbers, percentages, and comparison tables in your analysis.`,
  brand_voice: `${VANIR_SYSTEM_PROMPT}

You are a brand strategist and copywriter for Vanir Travel Group. Ensure all content aligns with the brand identity.

Your capabilities:
- Review and refine content to match brand voice
- Create brand-consistent taglines and slogans
- Develop brand messaging frameworks
- Write brand guidelines and style notes
- Adapt content for different audiences while maintaining brand identity
- Create brand stories that connect Egyptian heritage with modern luxury
- Design email signatures, bio texts, and boilerplate copy

Always maintain the Art Deco, Black & Gold aesthetic in your writing suggestions.`,
  competitor_analysis: `${VANIR_SYSTEM_PROMPT}

You are a competitive intelligence analyst for Vanir Travel Group.

Your capabilities:
- Analyze competitor offerings, pricing, and positioning
- Identify market gaps and opportunities
- Compare service features and unique selling points
- Assess competitor marketing strategies
- Provide SWOT analysis for competitive positioning
- Suggest differentiation strategies
- Monitor industry trends and emerging competitors

Provide structured analysis with comparison tables and actionable recommendations.`,
  report_generator: `${VANIR_SYSTEM_PROMPT}

You are a professional report writer for Vanir Travel Group. Create comprehensive business reports.

Report types you can generate:
- Monthly/quarterly performance reports
- Marketing campaign analysis reports
- Customer satisfaction summaries
- Destination performance reports
- Financial overview reports
- Market research summaries
- Operational efficiency reports

Format reports with executive summary, key findings, detailed analysis, charts descriptions, and recommendations.
Use professional formatting with headers, tables, and bullet points.`,
  email_composer: `${VANIR_SYSTEM_PROMPT}

You are an email communication specialist for Vanir Travel Group. Craft professional emails for various purposes.

Email types:
- Welcome emails for new clients
- Booking confirmations with luxury touches
- Pre-trip preparation guides
- Post-trip thank you and feedback requests
- Partnership and B2B proposals
- Newsletter content
- VIP client communications
- Event invitations
- Seasonal promotions

Maintain the luxury brand voice while being warm and personal. Include subject lines.`,
  general: VANIR_SYSTEM_PROMPT
};
var ALL_TASK_TYPES = [
  {
    id: "content_writer",
    name: "Content Writer",
    nameAr: "\u0643\u0627\u062A\u0628 \u0627\u0644\u0645\u062D\u062A\u0648\u0649",
    description: "Write compelling travel content, blog posts, and descriptions",
    descriptionAr: "\u0643\u062A\u0627\u0628\u0629 \u0645\u062D\u062A\u0648\u0649 \u0633\u064A\u0627\u062D\u064A \u062C\u0630\u0627\u0628 \u0648\u0645\u0642\u0627\u0644\u0627\u062A \u0648\u0648\u0635\u0641 \u0627\u0644\u0631\u062D\u0644\u0627\u062A",
    icon: "pen-tool",
    color: "blue",
    category: "content",
    suggestedPrompts: [
      "Write a luxury blog post about Luxor temples",
      "Create a destination description for Sharm El Sheikh",
      "Write an email newsletter about summer offers"
    ]
  },
  {
    id: "seo_analyst",
    name: "SEO Analyst",
    nameAr: "\u0645\u062D\u0644\u0644 SEO",
    description: "Analyze and optimize content for search engines",
    descriptionAr: "\u062A\u062D\u0644\u064A\u0644 \u0648\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0644\u0645\u062D\u0631\u0643\u0627\u062A \u0627\u0644\u0628\u062D\u062B",
    icon: "search",
    color: "green",
    category: "marketing",
    suggestedPrompts: [
      "Audit the SEO for our Egypt tours page",
      "Suggest keywords for luxury Nile cruise packages",
      "Analyze meta tags for our homepage"
    ]
  },
  {
    id: "offer_generator",
    name: "Offer Generator",
    nameAr: "\u0645\u0648\u0644\u062F \u0627\u0644\u0639\u0631\u0648\u0636",
    description: "Design irresistible travel packages and offers",
    descriptionAr: "\u062A\u0635\u0645\u064A\u0645 \u0639\u0631\u0648\u0636 \u0648\u0628\u0627\u0642\u0627\u062A \u0633\u0641\u0631 \u0644\u0627 \u062A\u0642\u0627\u0648\u0645",
    icon: "gift",
    color: "gold",
    category: "operations",
    suggestedPrompts: [
      "Create a 7-day luxury Egypt tour package",
      "Design a honeymoon package for Red Sea resorts",
      "Generate a group discount offer for Aswan"
    ]
  },
  {
    id: "data_analyst",
    name: "Data Analyst",
    nameAr: "\u0645\u062D\u0644\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A",
    description: "Analyze business metrics and provide insights",
    descriptionAr: "\u062A\u062D\u0644\u064A\u0644 \u0645\u0642\u0627\u064A\u064A\u0633 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0648\u062A\u0642\u062F\u064A\u0645 \u0631\u0624\u0649",
    icon: "bar-chart",
    color: "purple",
    category: "analysis",
    suggestedPrompts: [
      "Analyze booking trends for Q1 2026",
      "Suggest strategies to increase conversion rates",
      "Create a revenue forecast for summer season"
    ]
  },
  {
    id: "customer_support",
    name: "Customer Support",
    nameAr: "\u062F\u0639\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    description: "Draft professional customer responses",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0631\u062F\u0648\u062F \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0644\u0644\u0639\u0645\u0644\u0627\u0621",
    icon: "headphones",
    color: "teal",
    category: "operations",
    suggestedPrompts: [
      "Draft a response to a booking cancellation request",
      "Write a follow-up email after a completed trip",
      "Handle a complaint about hotel quality"
    ]
  },
  {
    id: "translator",
    name: "Translator",
    nameAr: "\u0627\u0644\u0645\u062A\u0631\u062C\u0645",
    description: "Translate content between Arabic and English",
    descriptionAr: "\u062A\u0631\u062C\u0645\u0629 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0628\u064A\u0646 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629",
    icon: "languages",
    color: "orange",
    category: "content",
    suggestedPrompts: [
      "Translate our about page to Arabic",
      "Translate this offer description to English",
      "Localize marketing copy for Arabic audience"
    ]
  },
  {
    id: "social_media",
    name: "Social Media",
    nameAr: "\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644",
    description: "Create engaging social media content",
    descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u0645\u062D\u062A\u0648\u0649 \u062C\u0630\u0627\u0628 \u0644\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A",
    icon: "share-2",
    color: "pink",
    category: "marketing",
    suggestedPrompts: [
      "Write 5 Instagram captions for pyramid photos",
      "Create a weekly content calendar for Facebook",
      "Draft a LinkedIn post about our new luxury service"
    ]
  },
  {
    id: "itinerary_planner",
    name: "Itinerary Planner",
    nameAr: "\u0645\u062E\u0637\u0637 \u0627\u0644\u0631\u062D\u0644\u0627\u062A",
    description: "Design detailed day-by-day luxury travel itineraries",
    descriptionAr: "\u062A\u0635\u0645\u064A\u0645 \u062C\u062F\u0627\u0648\u0644 \u0631\u062D\u0644\u0627\u062A \u0641\u0627\u062E\u0631\u0629 \u0645\u0641\u0635\u0644\u0629 \u064A\u0648\u0645\u0627\u064B \u0628\u064A\u0648\u0645",
    icon: "map-pin",
    color: "emerald",
    category: "operations",
    suggestedPrompts: [
      "Plan a 5-day luxury Cairo & Luxor itinerary",
      "Design a 10-day all-Egypt premium tour",
      "Create a 3-day Red Sea diving & relaxation itinerary"
    ]
  },
  {
    id: "review_responder",
    name: "Review Responder",
    nameAr: "\u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A",
    description: "Craft thoughtful responses to guest reviews",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0631\u062F\u0648\u062F \u0645\u062F\u0631\u0648\u0633\u0629 \u0639\u0644\u0649 \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0636\u064A\u0648\u0641",
    icon: "star",
    color: "amber",
    category: "operations",
    suggestedPrompts: [
      "Respond to a 5-star review praising our Nile cruise",
      "Draft a professional response to a negative hotel review",
      "Write a thank-you response to a returning guest"
    ]
  },
  {
    id: "pricing_advisor",
    name: "Pricing Advisor",
    nameAr: "\u0645\u0633\u062A\u0634\u0627\u0631 \u0627\u0644\u062A\u0633\u0639\u064A\u0631",
    description: "Revenue management and pricing strategy analysis",
    descriptionAr: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u062A\u0633\u0639\u064A\u0631",
    icon: "dollar-sign",
    color: "lime",
    category: "analysis",
    suggestedPrompts: [
      "Suggest pricing for a new premium Aswan package",
      "Analyze our pricing vs competitors for Nile cruises",
      "Create a seasonal pricing calendar for 2026"
    ]
  },
  {
    id: "brand_voice",
    name: "Brand Voice",
    nameAr: "\u0635\u0648\u062A \u0627\u0644\u0639\u0644\u0627\u0645\u0629",
    description: "Ensure content aligns with Vanir brand identity",
    descriptionAr: "\u0636\u0645\u0627\u0646 \u062A\u0648\u0627\u0641\u0642 \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0645\u0639 \u0647\u0648\u064A\u0629 \u0639\u0644\u0627\u0645\u0629 \u0641\u0627\u0646\u064A\u0631",
    icon: "crown",
    color: "yellow",
    category: "content",
    suggestedPrompts: [
      "Review and refine this page copy for brand consistency",
      "Create 5 brand-aligned taglines for our summer campaign",
      "Write brand guidelines for social media posts"
    ]
  },
  {
    id: "competitor_analysis",
    name: "Competitor Analysis",
    nameAr: "\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0646\u0627\u0641\u0633\u064A\u0646",
    description: "Competitive intelligence and market positioning",
    descriptionAr: "\u0627\u0644\u0627\u0633\u062A\u062E\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0646\u0627\u0641\u0633\u064A\u0629 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0645\u0648\u0627\u0642\u0639 \u0641\u064A \u0627\u0644\u0633\u0648\u0642",
    icon: "target",
    color: "red",
    category: "analysis",
    suggestedPrompts: [
      "Compare our luxury Egypt tours with top 3 competitors",
      "Identify gaps in the luxury Nile cruise market",
      "SWOT analysis for Vanir Travel Group"
    ]
  },
  {
    id: "report_generator",
    name: "Report Generator",
    nameAr: "\u0645\u0648\u0644\u062F \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631",
    description: "Create comprehensive business and performance reports",
    descriptionAr: "\u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0627\u0631\u064A\u0631 \u0623\u0639\u0645\u0627\u0644 \u0648\u0623\u062F\u0627\u0621 \u0634\u0627\u0645\u0644\u0629",
    icon: "file-text",
    color: "slate",
    category: "analysis",
    suggestedPrompts: [
      "Generate a monthly performance report template",
      "Create a marketing campaign analysis report",
      "Write a customer satisfaction summary report"
    ]
  },
  {
    id: "email_composer",
    name: "Email Composer",
    nameAr: "\u0645\u062D\u0631\u0631 \u0627\u0644\u0625\u064A\u0645\u064A\u0644\u0627\u062A",
    description: "Craft professional emails for all occasions",
    descriptionAr: "\u0635\u064A\u0627\u063A\u0629 \u0625\u064A\u0645\u064A\u0644\u0627\u062A \u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0627\u062A",
    icon: "mail",
    color: "cyan",
    category: "content",
    suggestedPrompts: [
      "Write a welcome email for new VIP clients",
      "Draft a partnership proposal email to a luxury hotel",
      "Create a pre-trip preparation guide email"
    ]
  }
];
function buildMessageContent(text2, attachments) {
  if (!attachments || attachments.length === 0) return text2;
  const parts = [];
  if (text2) {
    parts.push({ type: "text", text: text2 });
  }
  for (const att of attachments) {
    if (att.mimeType.startsWith("image/")) {
      parts.push({
        type: "image_url",
        image_url: { url: att.url, detail: "auto" }
      });
    } else if (["application/pdf", "audio/mpeg", "audio/wav", "audio/mp4", "video/mp4"].includes(att.mimeType)) {
      parts.push({
        type: "file_url",
        file_url: { url: att.url, mime_type: att.mimeType }
      });
    } else {
      parts.push({
        type: "text",
        text: `[Attached file: ${att.url} (${att.mimeType})]`
      });
    }
  }
  return parts.length === 1 && parts[0].type === "text" ? text2 : parts;
}
var allTaskTypeIds = ALL_TASK_TYPES.map((t2) => t2.id);
var taskTypeEnum = import_zod15.z.enum([
  "general",
  ...allTaskTypeIds
]);
var attachmentSchema = import_zod15.z.object({
  url: import_zod15.z.string().url(),
  mimeType: import_zod15.z.string(),
  filename: import_zod15.z.string().optional()
});
var aiCommandRouter = router({
  /**
   * Upload a file for AI chat (admin only)
   */
  uploadFile: adminProcedure.input(
    import_zod15.z.object({
      fileData: import_zod15.z.string(),
      // base64
      filename: import_zod15.z.string(),
      mimeType: import_zod15.z.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const buffer = Buffer.from(input.fileData, "base64");
    const fileSize = buffer.length;
    if (fileSize > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10MB limit");
    }
    const ext = input.filename.split(".").pop() || "bin";
    const randomSuffix = (0, import_nanoid4.nanoid)(8);
    const fileKey = `ai-command/${ctx.user.id}/${randomSuffix}.${ext}`;
    const { url } = await storagePut(fileKey, buffer, input.mimeType);
    return {
      url,
      fileKey,
      filename: input.filename,
      mimeType: input.mimeType,
      fileSize
    };
  }),
  /**
   * Main AI chat - send a message with optional file attachments
   */
  chat: adminProcedure.input(
    import_zod15.z.object({
      messages: import_zod15.z.array(
        import_zod15.z.object({
          role: import_zod15.z.enum(["system", "user", "assistant"]),
          content: import_zod15.z.string(),
          attachments: import_zod15.z.array(attachmentSchema).optional()
        })
      ),
      taskType: taskTypeEnum.default("general")
    })
  ).mutation(async ({ input }) => {
    const systemPrompt = TASK_PROMPTS[input.taskType] || TASK_PROMPTS.general;
    const llmMessages = [
      { role: "system", content: systemPrompt },
      ...input.messages.map((m) => ({
        role: m.role,
        content: buildMessageContent(m.content, m.attachments)
      }))
    ];
    const result = await invokeLLM({ messages: llmMessages });
    const content = result.choices?.[0]?.message?.content;
    const responseText = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c) => c.type === "text").map((c) => c.text).join("\n") : "No response generated.";
    return {
      response: responseText,
      usage: result.usage || null,
      model: result.model || "unknown"
    };
  }),
  /**
   * Quick task execution - one-shot tasks with structured output
   * Now supports file attachments
   */
  executeTask: adminProcedure.input(
    import_zod15.z.object({
      taskType: import_zod15.z.enum(allTaskTypeIds),
      prompt: import_zod15.z.string().min(1),
      context: import_zod15.z.string().optional(),
      language: import_zod15.z.enum(["ar", "en", "auto"]).default("auto"),
      attachments: import_zod15.z.array(attachmentSchema).optional()
    })
  ).mutation(async ({ input }) => {
    const systemPrompt = TASK_PROMPTS[input.taskType];
    let userPrompt = input.prompt;
    if (input.context) {
      userPrompt += `

Additional context:
${input.context}`;
    }
    if (input.language !== "auto") {
      userPrompt += `

Please respond in ${input.language === "ar" ? "Arabic" : "English"}.`;
    }
    const messageContent = buildMessageContent(userPrompt, input.attachments);
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: messageContent }
      ]
    });
    const content = result.choices?.[0]?.message?.content;
    const responseText = typeof content === "string" ? content : Array.isArray(content) ? content.filter((c) => c.type === "text").map((c) => c.text).join("\n") : "No response generated.";
    return {
      result: responseText,
      taskType: input.taskType,
      usage: result.usage || null,
      model: result.model || "unknown",
      executedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }),
  /**
   * Get available task types and their descriptions
   */
  getTaskTypes: adminProcedure.query(() => {
    return ALL_TASK_TYPES;
  })
});

// server/routers/siteSettings.ts
var import_zod16 = require("zod");
var import_drizzle_orm8 = require("drizzle-orm");
var siteSettingsRouter = router({
  /**
   * Get theme settings (public - no auth required for visitors)
   */
  getTheme: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const results = await db.select().from(siteSettings).where((0, import_drizzle_orm8.eq)(siteSettings.category, "theme"));
    if (!results.length) return null;
    const settings = {};
    for (const row of results) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Get a single setting by category + key
   */
  get: protectedProcedure.input(import_zod16.z.object({
    category: import_zod16.z.string(),
    key: import_zod16.z.string()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const [result] = await db.select().from(siteSettings).where(
      (0, import_drizzle_orm8.and)(
        (0, import_drizzle_orm8.eq)(siteSettings.category, input.category),
        (0, import_drizzle_orm8.eq)(siteSettings.settingKey, input.key)
      )
    ).limit(1);
    return result?.settingValue ?? null;
  }),
  /**
   * Get all settings for a category
   */
  getByCategory: protectedProcedure.input(import_zod16.z.object({
    category: import_zod16.z.string()
  })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return {};
    const results = await db.select().from(siteSettings).where((0, import_drizzle_orm8.eq)(siteSettings.category, input.category));
    const settings = {};
    for (const row of results) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Get all settings across all categories
   */
  getAll: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {};
    const results = await db.select().from(siteSettings);
    const grouped = {};
    for (const row of results) {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.settingKey] = row.settingValue ?? "";
    }
    return grouped;
  }),
  /**
   * Set a single setting (upsert)
   */
  set: protectedProcedure.input(import_zod16.z.object({
    category: import_zod16.z.string(),
    key: import_zod16.z.string(),
    value: import_zod16.z.string()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const [existing] = await db.select().from(siteSettings).where(
      (0, import_drizzle_orm8.and)(
        (0, import_drizzle_orm8.eq)(siteSettings.category, input.category),
        (0, import_drizzle_orm8.eq)(siteSettings.settingKey, input.key)
      )
    ).limit(1);
    if (existing) {
      await db.update(siteSettings).set({ settingValue: input.value, updatedBy: ctx.user.id }).where((0, import_drizzle_orm8.eq)(siteSettings.id, existing.id));
    } else {
      await db.insert(siteSettings).values({
        category: input.category,
        settingKey: input.key,
        settingValue: input.value,
        updatedBy: ctx.user.id
      });
    }
    return { success: true };
  }),
  /**
   * Set multiple settings at once (batch upsert)
   */
  setMany: protectedProcedure.input(import_zod16.z.object({
    category: import_zod16.z.string(),
    settings: import_zod16.z.record(import_zod16.z.string(), import_zod16.z.string())
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const entries = Object.entries(input.settings);
    for (const [key, value] of entries) {
      const [existing] = await db.select().from(siteSettings).where(
        (0, import_drizzle_orm8.and)(
          (0, import_drizzle_orm8.eq)(siteSettings.category, input.category),
          (0, import_drizzle_orm8.eq)(siteSettings.settingKey, key)
        )
      ).limit(1);
      if (existing) {
        await db.update(siteSettings).set({ settingValue: value, updatedBy: ctx.user.id }).where((0, import_drizzle_orm8.eq)(siteSettings.id, existing.id));
      } else {
        await db.insert(siteSettings).values({
          category: input.category,
          settingKey: key,
          settingValue: value,
          updatedBy: ctx.user.id
        });
      }
    }
    return { success: true, count: entries.length };
  }),
  /**
   * Delete a setting
   */
  delete: protectedProcedure.input(import_zod16.z.object({
    category: import_zod16.z.string(),
    key: import_zod16.z.string()
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.delete(siteSettings).where(
      (0, import_drizzle_orm8.and)(
        (0, import_drizzle_orm8.eq)(siteSettings.category, input.category),
        (0, import_drizzle_orm8.eq)(siteSettings.settingKey, input.key)
      )
    );
    return { success: true };
  })
});

// server/routers/backup.ts
var import_zod17 = require("zod");
var import_drizzle_orm9 = require("drizzle-orm");
var TABLE_MAP = {
  destinations: { table: destinations, label: "Destinations" },
  offers: { table: offers, label: "Offers & Packages" },
  blog: { table: blogPosts, label: "Blog Articles" },
  bookings: { table: bookings, label: "Bookings" },
  users: { table: users, label: "Users" },
  gallery: { table: galleryItems, label: "Gallery" },
  reviews: { table: reviews, label: "Reviews" },
  settings: { table: siteSettings, label: "Settings" },
  contacts: { table: contactMessages, label: "Contact Messages" },
  marketing: { table: marketingContent, label: "Marketing Content" }
};
var backupRouter = router({
  /**
   * Get record counts for all exportable tables
   */
  getExportSections: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const sections = [];
    for (const [id, { table, label }] of Object.entries(TABLE_MAP)) {
      try {
        const [result] = await db.select({ count: import_drizzle_orm9.sql`count(*)` }).from(table);
        sections.push({
          id,
          label,
          recordCount: Number(result?.count ?? 0)
        });
      } catch {
        sections.push({ id, label, recordCount: 0 });
      }
    }
    return sections;
  }),
  /**
   * Export selected sections as JSON data
   */
  exportData: protectedProcedure.input(import_zod17.z.object({
    sections: import_zod17.z.array(import_zod17.z.string()),
    format: import_zod17.z.enum(["json", "csv"]).default("json")
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const exportResult = {};
    for (const sectionId of input.sections) {
      const mapping = TABLE_MAP[sectionId];
      if (!mapping) continue;
      try {
        const rows = await db.select().from(mapping.table);
        exportResult[sectionId] = {
          label: mapping.label,
          recordCount: rows.length,
          data: rows
        };
      } catch {
        exportResult[sectionId] = {
          label: mapping.label,
          recordCount: 0,
          data: []
        };
      }
    }
    return {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      format: input.format,
      totalRecords: Object.values(exportResult).reduce((sum, s) => sum + s.recordCount, 0),
      sections: exportResult
    };
  }),
  /**
   * Get backup settings from DB
   */
  getSettings: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {};
    const results = await db.select().from(siteSettings).where(
      import_drizzle_orm9.sql`${siteSettings.category} = 'backup'`
    );
    const settings = {};
    for (const row of results) {
      settings[row.settingKey] = row.settingValue ?? "";
    }
    return settings;
  }),
  /**
   * Restore data from backup file
   */
  restoreData: protectedProcedure.input(import_zod17.z.object({
    sections: import_zod17.z.record(import_zod17.z.string(), import_zod17.z.object({
      label: import_zod17.z.string(),
      recordCount: import_zod17.z.number(),
      data: import_zod17.z.array(import_zod17.z.any())
    })),
    mode: import_zod17.z.enum(["merge", "replace"]).default("merge")
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const results = {};
    for (const [sectionId, section] of Object.entries(input.sections)) {
      const mapping = TABLE_MAP[sectionId];
      if (!mapping || !section.data || section.data.length === 0) {
        results[sectionId] = { restored: 0, skipped: 0, errors: 0 };
        continue;
      }
      let restored = 0;
      let skipped = 0;
      let errors = 0;
      try {
        if (input.mode === "replace") {
          await db.delete(mapping.table);
        }
        for (const row of section.data) {
          try {
            const cleanRow = { ...row };
            delete cleanRow.id;
            await db.insert(mapping.table).values(cleanRow);
            restored++;
          } catch (e) {
            if (e?.code === "ER_DUP_ENTRY" || e?.message?.includes("Duplicate")) {
              skipped++;
            } else {
              errors++;
            }
          }
        }
      } catch {
        errors = section.data.length;
      }
      results[sectionId] = { restored, skipped, errors };
    }
    const totalRestored = Object.values(results).reduce((s, r) => s + r.restored, 0);
    const totalSkipped = Object.values(results).reduce((s, r) => s + r.skipped, 0);
    const totalErrors = Object.values(results).reduce((s, r) => s + r.errors, 0);
    return {
      success: true,
      restoredAt: (/* @__PURE__ */ new Date()).toISOString(),
      totalRestored,
      totalSkipped,
      totalErrors,
      details: results
    };
  }),
  /**
   * Save backup settings
   */
  saveSettings: protectedProcedure.input(import_zod17.z.object({
    settings: import_zod17.z.record(import_zod17.z.string(), import_zod17.z.string())
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    for (const [key, value] of Object.entries(input.settings)) {
      const existing = await db.select().from(siteSettings).where(
        import_drizzle_orm9.sql`${siteSettings.category} = 'backup' AND ${siteSettings.settingKey} = ${key}`
      ).limit(1);
      if (existing.length > 0) {
        await db.update(siteSettings).set({ settingValue: value, updatedBy: ctx.user.id }).where(import_drizzle_orm9.sql`${siteSettings.id} = ${existing[0].id}`);
      } else {
        await db.insert(siteSettings).values({
          category: "backup",
          settingKey: key,
          settingValue: value,
          updatedBy: ctx.user.id
        });
      }
    }
    return { success: true };
  })
});

// server/routers.ts
var import_zod18 = require("zod");
var import_server6 = require("@trpc/server");
var import_crypto = require("crypto");
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    }),
    login: publicProcedure.input(import_zod18.z.object({ email: import_zod18.z.string().email(), password: import_zod18.z.string().min(1) })).mutation(async ({ ctx, input }) => {
      try {
        const adminEmail = ENV.adminEmail;
        const adminPasswordHash = ENV.adminPasswordHash;
        if (!adminEmail || !adminPasswordHash) {
          throw new import_server6.TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Admin login is not configured on this server. Set ADMIN_EMAIL and ADMIN_PASSWORD_HASH environment variables."
          });
        }
        if (input.email.toLowerCase() !== adminEmail.toLowerCase()) {
          throw new import_server6.TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        const storedHash = adminPasswordHash.trim();
        const isHashFormat = /^[a-f0-9]{64}$/.test(storedHash.toLowerCase());
        let match = false;
        if (isHashFormat) {
          const submittedHash = (0, import_crypto.createHash)("sha256").update(input.password).digest("hex");
          try {
            match = (0, import_crypto.timingSafeEqual)(
              Buffer.from(submittedHash, "utf8"),
              Buffer.from(storedHash.toLowerCase(), "utf8")
            );
          } catch {
            match = false;
          }
        } else {
          try {
            match = (0, import_crypto.timingSafeEqual)(
              Buffer.from(input.password, "utf8"),
              Buffer.from(storedHash, "utf8")
            );
          } catch {
            match = false;
          }
        }
        if (!match) {
          throw new import_server6.TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        const openId = `admin:${adminEmail.toLowerCase()}`;
        await upsertUser({
          openId,
          email: adminEmail,
          name: "Admin",
          loginMethod: "password",
          role: "admin",
          lastSignedIn: /* @__PURE__ */ new Date()
        });
        const sessionToken = await sdk.createSessionToken(openId, {
          expiresInMs: ONE_YEAR_MS,
          name: "Admin"
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS
        });
        return { success: true };
      } catch (err) {
        if (err instanceof import_server6.TRPCError) throw err;
        throw new import_server6.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during login. Please try again."
        });
      }
    }),
    /**
     * Bridge: accept a Supabase Auth JWT access token, verify it server-side,
     * check app_metadata.role === 'admin', upsert the user in DB with role='admin',
     * then issue a session cookie so the rest of the app treats them as authenticated admin.
     */
    supabaseLogin: publicProcedure.input(import_zod18.z.object({ accessToken: import_zod18.z.string().min(1) })).mutation(async ({ ctx, input }) => {
      const supabase = getServerSupabase();
      if (!supabase) {
        throw new import_server6.TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Supabase is not configured on this server."
        });
      }
      const { data, error } = await supabase.auth.getUser(input.accessToken);
      if (error || !data.user) {
        throw new import_server6.TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired Supabase session."
        });
      }
      const supabaseUser = data.user;
      const appMeta = supabaseUser.app_metadata ?? {};
      const role = appMeta["role"];
      if (role !== "admin") {
        throw new import_server6.TRPCError({
          code: "FORBIDDEN",
          message: "This account does not have admin privileges."
        });
      }
      const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "Admin";
      await upsertUser({
        openId: supabaseUser.id,
        email: supabaseUser.email ?? null,
        name,
        loginMethod: "supabase",
        role: "admin",
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(supabaseUser.id, {
        expiresInMs: ONE_YEAR_MS,
        name
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS
      });
      return { success: true };
    }),
    /**
     * One-time server-side operation: create (or confirm) the admin user in Supabase Auth
     * with app_metadata.role = 'admin'. Requires SUPABASE_SERVICE_ROLE_KEY to be set.
     * Call this once during setup; subsequent calls are idempotent (returns existing user).
     */
    ensureAdmin: publicProcedure.input(
      import_zod18.z.object({
        email: import_zod18.z.string().email(),
        password: import_zod18.z.string().min(8, "Password must be at least 8 characters")
      })
    ).mutation(async ({ input }) => {
      const supabase = getServerSupabase();
      if (!supabase) {
        throw new import_server6.TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Supabase service role key is not configured."
        });
      }
      const { data, error } = await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        app_metadata: { role: "admin" }
      });
      if (error) {
        if (error.message?.toLowerCase().includes("already") || error.message?.toLowerCase().includes("exists") || error.code === "email_exists") {
          const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
          if (listError) {
            throw new import_server6.TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to list users: ${listError.message}`
            });
          }
          const existing = listData.users.find(
            (u) => u.email?.toLowerCase() === input.email.toLowerCase()
          );
          if (existing) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, {
              app_metadata: { role: "admin" }
            });
            if (updateError) {
              throw new import_server6.TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Failed to update admin metadata: ${updateError.message}`
              });
            }
            return {
              success: true,
              action: "updated",
              userId: existing.id
            };
          }
          throw new import_server6.TRPCError({
            code: "CONFLICT",
            message: "User already exists but could not be located."
          });
        }
        throw new import_server6.TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Supabase error: ${error.message}`
        });
      }
      return {
        success: true,
        action: "created",
        userId: data.user?.id ?? null
      };
    })
  }),
  // Feature routers
  bookings: bookingsRouter,
  reviews: reviewsRouter,
  offers: offersRouter,
  contact: contactRouter,
  uploads: uploadsRouter,
  gallery: galleryRouter,
  aiStudio: aiStudioRouter,
  users: usersRouter,
  blog: blogRouter,
  marketing: marketingRouter,
  // Admin routers
  admin: router({
    destinations: adminDestinationsRouter,
    offers: adminOffersRouter,
    blog: adminBlogRouter
  }),
  // AI Command Center
  aiCommand: aiCommandRouter,
  // Site Settings (real DB-backed)
  siteSettings: siteSettingsRouter,
  // Backup & Export (real DB export)
  backup: backupRouter
});

// server/_core/context.ts
function getBearerToken(req) {
  const auth = req.headers["authorization"];
  if (!auth || Array.isArray(auth)) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}
async function createContext(opts) {
  let user = null;
  const supabase = getServerSupabase();
  const bearer = getBearerToken(opts.req);
  if (bearer && supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(bearer);
      if (!error && data.user) {
        const u = data.user;
        const name = u.user_metadata && u.user_metadata.name || u.user_metadata?.full_name || u.email?.split("@")[0] || null;
        const appMeta = u.app_metadata ?? {};
        const supabaseRole = appMeta["role"] === "admin" ? "admin" : void 0;
        await upsertUser({
          openId: u.id,
          name,
          email: u.email ?? null,
          loginMethod: "supabase",
          lastSignedIn: /* @__PURE__ */ new Date(),
          ...supabaseRole ? { role: supabaseRole } : {}
        });
        const found = await getUserByOpenId(u.id);
        if (found) {
          user = found;
        }
      }
    } catch {
    }
  }
  if (!user) {
    try {
      user = await sdk.authenticateRequest(opts.req);
    } catch {
      user = null;
    }
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
    supabase
  };
}

// server/_core/vite.ts
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_nanoid5 = require("nanoid");
var import_path = __toESM(require("path"), 1);
var import_meta = {};
var DIRNAME = typeof __dirname !== "undefined" ? __dirname : new URL(".", import_meta.url).pathname;
async function setupVite(app, server) {
  const { createServer: createViteServer } = await import("vite");
  const viteConfig = (await import("../../vite.config")).default;
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = import_path.default.resolve(DIRNAME, "../..", "client", "index.html");
      let template = await import_fs.default.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${(0, import_nanoid5.nanoid)()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? import_path.default.resolve(DIRNAME, "../..", "dist", "public") : import_path.default.resolve(DIRNAME, "public");
  if (!import_fs.default.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(import_express.default.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(import_path.default.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = import_net.default.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = (0, import_express2.default)();
  const server = (0, import_http.createServer)(app);
  app.use(import_express2.default.json({ limit: "50mb" }));
  app.use(import_express2.default.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerDownloadProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    (0, import_express3.createExpressMiddleware)({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
  return app;
}
startServer().catch(console.error);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  startServer
});
