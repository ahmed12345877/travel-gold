CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "openId" varchar(64) NOT NULL,
  "name" text,
  "email" varchar(320),
  "phone" varchar(32),
  "loginMethod" varchar(64),
  "avatarUrl" text,
  "role" text DEFAULT 'user' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "lastSignedIn" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "users" ADD CONSTRAINT "users_openId_unique" UNIQUE("openId");

CREATE TABLE IF NOT EXISTS "bookings" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer,
  "guestName" varchar(255),
  "guestEmail" varchar(320),
  "guestPhone" varchar(32),
  "packageName" varchar(255) NOT NULL,
  "packageCategory" varchar(100),
  "destination" varchar(255),
  "checkInDate" bigint,
  "checkOutDate" bigint,
  "adults" integer DEFAULT 1,
  "children" integer DEFAULT 0,
  "roomType" varchar(100),
  "totalPrice" numeric(10, 2),
  "currency" varchar(10) DEFAULT 'USD',
  "paymentMethod" text,
  "paymentStatus" text DEFAULT 'pending' NOT NULL,
  "promoCode" varchar(50),
  "discountAmount" numeric(10, 2),
  "specialRequests" text,
  "billingAddress" json,
  "status" text DEFAULT 'pending' NOT NULL,
  "confirmationCode" varchar(20),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_confirmationCode_unique" UNIQUE("confirmationCode");

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer,
  "guestName" varchar(255),
  "guestAvatarUrl" text,
  "tripName" varchar(255) NOT NULL,
  "destination" varchar(255),
  "rating" integer NOT NULL,
  "title" varchar(500),
  "content" text NOT NULL,
  "photoUrls" json,
  "travelDate" bigint,
  "adminReply" text,
  "adminReplyAt" timestamp,
  "isApproved" text DEFAULT 'pending' NOT NULL,
  "helpfulCount" integer DEFAULT 0,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "offers" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "discountType" text NOT NULL,
  "discountValue" numeric(10, 2) NOT NULL,
  "promoCode" varchar(50),
  "startDate" bigint NOT NULL,
  "endDate" bigint NOT NULL,
  "category" varchar(100),
  "destination" varchar(255),
  "imageUrl" text,
  "totalSpots" integer,
  "bookedSpots" integer DEFAULT 0,
  "isActive" text DEFAULT 'active' NOT NULL,
  "badgeText" varchar(50),
  "badgeColor" varchar(20),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "offers" ADD CONSTRAINT "offers_promoCode_unique" UNIQUE("promoCode");

CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(320) NOT NULL,
  "phone" varchar(32),
  "subject" varchar(500),
  "message" text NOT NULL,
  "status" text DEFAULT 'new' NOT NULL,
  "adminNotes" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "file_uploads" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer,
  "fileKey" varchar(500) NOT NULL,
  "url" text NOT NULL,
  "filename" varchar(255) NOT NULL,
  "mimeType" varchar(100),
  "fileSize" integer,
  "purpose" varchar(50),
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "gallery_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "imageUrl" text NOT NULL,
  "title" varchar(255) NOT NULL,
  "titleAr" varchar(255),
  "description" text,
  "descriptionAr" text,
  "category" varchar(100) NOT NULL,
  "categoryAr" varchar(100),
  "location" varchar(255),
  "locationAr" varchar(255),
  "featured" text DEFAULT 'no' NOT NULL,
  "aspect" text DEFAULT 'landscape' NOT NULL,
  "sortOrder" integer DEFAULT 0,
  "isVisible" text DEFAULT 'visible' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "gallery_videos" (
  "id" serial PRIMARY KEY NOT NULL,
  "thumbnailUrl" text NOT NULL,
  "title" varchar(255) NOT NULL,
  "titleAr" varchar(255),
  "youtubeId" varchar(20) NOT NULL,
  "duration" varchar(20),
  "views" varchar(20),
  "sortOrder" integer DEFAULT 0,
  "isVisible" text DEFAULT 'visible' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ai_subscriptions" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "plan" text DEFAULT 'free' NOT NULL,
  "monthlyPrice" numeric(10, 2) DEFAULT '0',
  "status" text DEFAULT 'active' NOT NULL,
  "stripeSubscriptionId" varchar(255),
  "startDate" bigint NOT NULL,
  "renewalDate" bigint,
  "cancelledAt" timestamp,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ai_credits" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "balance" numeric(12, 2) DEFAULT '0' NOT NULL,
  "totalUsed" numeric(12, 2) DEFAULT '0' NOT NULL,
  "lastResetDate" bigint,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "ai_credits" ADD CONSTRAINT "ai_credits_userId_unique" UNIQUE("userId");

CREATE TABLE IF NOT EXISTS "ai_usage" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "type" text NOT NULL,
  "model" varchar(100) NOT NULL,
  "prompt" text NOT NULL,
  "resultUrl" text,
  "resultKey" varchar(500),
  "creditsCost" numeric(10, 2) NOT NULL,
  "imageSize" varchar(50),
  "videoDuration" integer,
  "status" text DEFAULT 'pending' NOT NULL,
  "errorMessage" text,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ai_transactions" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "type" text NOT NULL,
  "amount" numeric(12, 2) NOT NULL,
  "stripePaymentId" varchar(255),
  "paymentMethod" varchar(50),
  "status" text DEFAULT 'pending' NOT NULL,
  "description" text,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "blog_posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(255) NOT NULL,
  "title" varchar(500) NOT NULL,
  "excerpt" text NOT NULL,
  "content" text NOT NULL,
  "metaTitle" varchar(70),
  "metaDescription" varchar(160),
  "metaKeywords" varchar(500),
  "coverImageUrl" text,
  "category" varchar(100),
  "tags" json,
  "authorId" integer,
  "authorName" varchar(255) DEFAULT 'VANIR GROUP',
  "status" text DEFAULT 'draft' NOT NULL,
  "publishedAt" timestamp,
  "viewCount" integer DEFAULT 0,
  "readingTime" integer DEFAULT 5,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug");

CREATE TABLE IF NOT EXISTS "marketing_content" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "type" text NOT NULL,
  "platform" varchar(50),
  "title" varchar(500),
  "content" text NOT NULL,
  "prompt" text NOT NULL,
  "language" varchar(10) DEFAULT 'en',
  "tone" varchar(50),
  "destination" varchar(255),
  "hashtags" json,
  "creditsCost" numeric(10, 2) DEFAULT '1',
  "isFavorite" text DEFAULT 'no' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "marketing_calendar" (
  "id" serial PRIMARY KEY NOT NULL,
  "userId" integer NOT NULL,
  "contentId" integer,
  "title" varchar(500) NOT NULL,
  "description" text,
  "platform" varchar(50),
  "scheduledDate" bigint NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "colorTag" varchar(20) DEFAULT '#D4A853',
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "marketing_templates" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "type" text NOT NULL,
  "platform" varchar(50),
  "templateContent" text NOT NULL,
  "systemPrompt" text,
  "category" varchar(100),
  "icon" varchar(50),
  "isBuiltIn" text DEFAULT 'no' NOT NULL,
  "sortOrder" integer DEFAULT 0,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "destinations" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "location" varchar(255) NOT NULL,
  "pricePerPerson" numeric(10, 2) DEFAULT '0',
  "rating" numeric(3, 2) DEFAULT '5',
  "imageUrl" text,
  "highlights" text,
  "bestTimeToVisit" varchar(255),
  "duration" varchar(100),
  "difficulty" text,
  "groupSize" varchar(100),
  "inclusions" text,
  "exclusions" text,
  "isActive" text DEFAULT 'active' NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "category" varchar(50) NOT NULL,
  "setting_key" varchar(100) NOT NULL,
  "setting_value" text,
  "updated_by" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "ai_subscriptions" ADD CONSTRAINT "ai_subscriptions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "ai_credits" ADD CONSTRAINT "ai_credits_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "ai_transactions" ADD CONSTRAINT "ai_transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marketing_content" ADD CONSTRAINT "marketing_content_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marketing_calendar" ADD CONSTRAINT "marketing_calendar_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "marketing_calendar" ADD CONSTRAINT "marketing_calendar_contentId_marketing_content_id_fk" FOREIGN KEY ("contentId") REFERENCES "marketing_content"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
