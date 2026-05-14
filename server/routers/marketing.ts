/**
 * Marketing Suite Router - AI-powered content generation for tourism companies
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { marketingContent, marketingCalendar, marketingTemplates } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// ─── System Prompts for Different Content Types ───

const SYSTEM_PROMPTS: Record<string, string> = {
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
Focus on unique selling points, urgency, and luxury appeal.`,
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  luxurious: "Use elegant, sophisticated language that conveys exclusivity and premium quality.",
  adventurous: "Use exciting, dynamic language that inspires exploration and discovery.",
  professional: "Use formal, authoritative language suitable for business communications.",
  casual: "Use friendly, conversational language that feels approachable and warm.",
  romantic: "Use poetic, evocative language that appeals to couples and honeymoon travelers.",
  cultural: "Use educational, respectful language that highlights heritage and traditions.",
};

export const marketingRouter = router({
  /**
   * Generate marketing content using AI
   */
  generate: protectedProcedure
    .input(
      z.object({
        type: z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]),
        platform: z.string().optional(),
        prompt: z.string().min(5, "Prompt must be at least 5 characters"),
        language: z.string().default("en"),
        tone: z.string().default("luxurious"),
        destination: z.string().optional(),
        templateId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Build the system prompt
      let systemPrompt = SYSTEM_PROMPTS[input.type] || SYSTEM_PROMPTS.social_media;

      // Add tone instruction
      const toneInstruction = TONE_INSTRUCTIONS[input.tone] || TONE_INSTRUCTIONS.luxurious;
      systemPrompt += `\n\nTone: ${toneInstruction}`;

      // Add language instruction
      if (input.language !== "en") {
        const langMap: Record<string, string> = {
          ar: "Arabic", fr: "French", de: "German", es: "Spanish",
          it: "Italian", pt: "Portuguese", zh: "Chinese", ja: "Japanese",
          ko: "Korean", ru: "Russian",
        };
        const langName = langMap[input.language] || input.language;
        systemPrompt += `\n\nIMPORTANT: Write the entire content in ${langName}.`;
      }

      // Add platform-specific instructions
      if (input.platform) {
        systemPrompt += `\n\nTarget platform: ${input.platform}. Optimize content format and length for this platform.`;
      }

      // Add destination context
      if (input.destination) {
        systemPrompt += `\n\nFocus destination: ${input.destination}. Include specific details about this destination.`;
      }

      // If using a template, fetch and include it
      if (input.templateId) {
        const [template] = await db
          .select()
          .from(marketingTemplates)
          .where(eq(marketingTemplates.id, input.templateId))
          .limit(1);

        if (template?.systemPrompt) {
          systemPrompt += `\n\nTemplate context: ${template.systemPrompt}`;
        }
        if (template?.templateContent) {
          systemPrompt += `\n\nFollow this template structure:\n${template.templateContent}`;
        }
      }

      // Use structured output for consistent results
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input.prompt },
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
                  description: "Relevant hashtags (without # prefix)",
                },
                metadata: {
                  type: "object",
                  properties: {
                    wordCount: { type: "number", description: "Approximate word count" },
                    readingTime: { type: "number", description: "Estimated reading time in minutes" },
                    seoScore: { type: "number", description: "Estimated SEO score 1-100 (for blog/SEO content)" },
                  },
                  required: ["wordCount", "readingTime", "seoScore"],
                  additionalProperties: false,
                },
              },
              required: ["title", "content", "hashtags", "metadata"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices[0]?.message?.content;
      const contentStr = typeof rawContent === "string" ? rawContent : "";
      let parsed: { title: string; content: string; hashtags: string[]; metadata: { wordCount: number; readingTime: number; seoScore: number } };

      try {
        parsed = JSON.parse(contentStr);
      } catch {
        // Fallback if JSON parsing fails
        parsed = {
          title: input.prompt.slice(0, 100),
          content: contentStr,
          hashtags: [],
          metadata: { wordCount: 0, readingTime: 0, seoScore: 0 },
        };
      }

      // Save to database
      const [saved] = await db
        .insert(marketingContent)
        .values({
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
          creditsCost: "1",
        })
        .$returningId();

      return {
        id: saved.id,
        title: parsed.title,
        content: parsed.content,
        hashtags: parsed.hashtags,
        metadata: parsed.metadata,
        type: input.type,
        platform: input.platform,
      };
    }),

  /**
   * List user's generated content
   */
  listContent: protectedProcedure
    .input(
      z.object({
        type: z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const conditions = [eq(marketingContent.userId, ctx.user.id)];
      if (input.type) {
        conditions.push(eq(marketingContent.type, input.type));
      }

      const items = await db
        .select()
        .from(marketingContent)
        .where(and(...conditions))
        .orderBy(desc(marketingContent.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [countResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(marketingContent)
        .where(and(...conditions));

      return {
        items,
        total: countResult?.count || 0,
      };
    }),

  /**
   * Toggle favorite status
   */
  toggleFavorite: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [item] = await db
        .select()
        .from(marketingContent)
        .where(and(eq(marketingContent.id, input.id), eq(marketingContent.userId, ctx.user.id)))
        .limit(1);

      if (!item) throw new TRPCError({ code: "NOT_FOUND" });

      const newStatus = item.isFavorite === "yes" ? "no" : "yes";
      await db
        .update(marketingContent)
        .set({ isFavorite: newStatus })
        .where(eq(marketingContent.id, input.id));

      return { isFavorite: newStatus };
    }),

  /**
   * Delete content
   */
  deleteContent: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [item] = await db
        .select()
        .from(marketingContent)
        .where(and(eq(marketingContent.id, input.id), eq(marketingContent.userId, ctx.user.id)))
        .limit(1);

      if (!item) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(marketingContent).where(eq(marketingContent.id, input.id));
      return { success: true };
    }),

  // ─── Calendar ───

  /**
   * List calendar entries
   */
  listCalendar: protectedProcedure
    .input(
      z.object({
        startDate: z.number().optional(),
        endDate: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const conditions = [eq(marketingCalendar.userId, ctx.user.id)];

      if (input.startDate) {
        conditions.push(sql`${marketingCalendar.scheduledDate} >= ${input.startDate}`);
      }
      if (input.endDate) {
        conditions.push(sql`${marketingCalendar.scheduledDate} <= ${input.endDate}`);
      }

      return db
        .select()
        .from(marketingCalendar)
        .where(and(...conditions))
        .orderBy(marketingCalendar.scheduledDate);
    }),

  /**
   * Add calendar entry
   */
  addCalendarEntry: protectedProcedure
    .input(
      z.object({
        contentId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        platform: z.string().optional(),
        scheduledDate: z.number(),
        status: z.enum(["draft", "scheduled", "published", "cancelled"]).default("draft"),
        colorTag: z.string().default("#D4A853"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [entry] = await db
        .insert(marketingCalendar)
        .values({
          userId: ctx.user.id,
          contentId: input.contentId || null,
          title: input.title,
          description: input.description || null,
          platform: input.platform || null,
          scheduledDate: input.scheduledDate,
          status: input.status,
          colorTag: input.colorTag,
        })
        .$returningId();

      return { id: entry.id };
    }),

  /**
   * Update calendar entry status
   */
  updateCalendarEntry: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        scheduledDate: z.number().optional(),
        status: z.enum(["draft", "scheduled", "published", "cancelled"]).optional(),
        colorTag: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { id, ...updates } = input;

      const [item] = await db
        .select()
        .from(marketingCalendar)
        .where(and(eq(marketingCalendar.id, id), eq(marketingCalendar.userId, ctx.user.id)))
        .limit(1);

      if (!item) throw new TRPCError({ code: "NOT_FOUND" });

      const cleanUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) cleanUpdates.title = updates.title;
      if (updates.description !== undefined) cleanUpdates.description = updates.description;
      if (updates.scheduledDate !== undefined) cleanUpdates.scheduledDate = updates.scheduledDate;
      if (updates.status !== undefined) cleanUpdates.status = updates.status;
      if (updates.colorTag !== undefined) cleanUpdates.colorTag = updates.colorTag;

      if (Object.keys(cleanUpdates).length > 0) {
        await db
          .update(marketingCalendar)
          .set(cleanUpdates)
          .where(eq(marketingCalendar.id, id));
      }

      return { success: true };
    }),

  /**
   * Delete calendar entry
   */
  deleteCalendarEntry: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [item] = await db
        .select()
        .from(marketingCalendar)
        .where(and(eq(marketingCalendar.id, input.id), eq(marketingCalendar.userId, ctx.user.id)))
        .limit(1);

      if (!item) throw new TRPCError({ code: "NOT_FOUND" });

      await db.delete(marketingCalendar).where(eq(marketingCalendar.id, input.id));
      return { success: true };
    }),

  // ─── Templates ───

  /**
   * List available templates
   */
  listTemplates: publicProcedure
    .input(
      z.object({
        type: z.enum(["social_media", "email", "trip_description", "blog_seo", "ad_copy"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const conditions = [];
      if (input.type) {
        conditions.push(eq(marketingTemplates.type, input.type));
      }

      return db
        .select()
        .from(marketingTemplates)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(marketingTemplates.sortOrder);
    }),

  /**
   * Get content generation stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

    const [totalContent] = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketingContent)
      .where(eq(marketingContent.userId, ctx.user.id));

    const [socialCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketingContent)
      .where(and(eq(marketingContent.userId, ctx.user.id), eq(marketingContent.type, "social_media")));

    const [emailCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketingContent)
      .where(and(eq(marketingContent.userId, ctx.user.id), eq(marketingContent.type, "email")));

    const [blogCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketingContent)
      .where(and(eq(marketingContent.userId, ctx.user.id), eq(marketingContent.type, "blog_seo")));

    const [calendarCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(marketingCalendar)
      .where(eq(marketingCalendar.userId, ctx.user.id));

    return {
      totalContent: totalContent?.count || 0,
      socialMedia: socialCount?.count || 0,
      emails: emailCount?.count || 0,
      blogPosts: blogCount?.count || 0,
      calendarEntries: calendarCount?.count || 0,
    };
  }),
});
