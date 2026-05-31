import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getOrCreateAISubscription,
  updateAISubscription,
  getOrCreateAICredits,
  addAICredits,
  deductAICredits,
  createAIUsage,
  getUserAIUsage,
  getAIUsageStats,
  updateAIUsageStatus,
} from "../db";
import { generateImageWithDALLE } from "../openaiImageGen";
import { generateImageWithGemini, GEMINI_IMAGE_MODELS, type GeminiModelId } from "../geminiImageGen";

export const aiStudioRouter = router({
  /** Get or create AI subscription for current user */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateAISubscription(ctx.user.id);
  }),

  /** Upgrade subscription plan */
  upgradePlan: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["free", "pro", "enterprise"]),
        stripePaymentIntentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const subscription = await updateAISubscription(ctx.user.id, input.plan, input.stripePaymentIntentId);
      return subscription;
    }),

  /** Get current user's AI credits */
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    return getOrCreateAICredits(ctx.user.id);
  }),

  /** Add credits to user account (admin/webhook only) */
  addCredits: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        reason: z.enum(["purchase", "monthly_allowance", "bonus"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return addAICredits(ctx.user.id, input.amount, input.reason || "bonus");
    }),

  /** Generate image with DALL-E 3 or Nano Banana models - Real API call */
  generateImage: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(4000),
        model: z.enum(["dall-e-3", "nano-banana", "nano-banana-pro", "nano-banana-2"]).default("dall-e-3"),
        // DALL-E specific options
        size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).default("1024x1024"),
        style: z.enum(["vivid", "natural"]).default("vivid"),
        quality: z.enum(["standard", "hd"]).default("standard"),
        // Nano Banana specific options
        aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"]).default("1:1"),
        creditCost: z.number().min(1).default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Check credits
      const credits = await getOrCreateAICredits(ctx.user.id);
      const currentBalance = parseFloat(credits.balance.toString());

      if (currentBalance < input.creditCost) {
        throw new Error("Insufficient credits. Please upgrade your plan or purchase more credits.");
      }

      // 2. Deduct credits first
      await deductAICredits(ctx.user.id, input.creditCost);

      // 3. Determine if this is a Gemini model
      const isGeminiModel = input.model.startsWith("nano-banana");
      const modelName = input.model;

      // 4. Create usage record with pending status
      const usageRecord = await createAIUsage({
        userId: ctx.user.id,
        type: "image",
        model: modelName,
        prompt: input.prompt,
        creditsCost: input.creditCost.toString(),
        imageSize: isGeminiModel ? input.aspectRatio : input.size,
        status: "pending",
      });

      try {
        let result: { url: string; s3Key: string; revisedPrompt?: string };

        if (isGeminiModel) {
          // Call Gemini (Nano Banana) API with the specific model
          result = await generateImageWithGemini({
            prompt: input.prompt,
            model: input.model as GeminiModelId,
            aspectRatio: input.aspectRatio,
            style: input.style,
          });
        } else {
          // Call OpenAI DALL-E 3 API
          result = await generateImageWithDALLE({
            prompt: input.prompt,
            size: input.size,
            style: input.style,
            quality: input.quality,
          });
        }

        // 5. Update usage record with result
        await updateAIUsageStatus(usageRecord.id, "completed", result.url);

        return {
          success: true,
          imageUrl: result.url,
          s3Key: result.s3Key,
          revisedPrompt: result.revisedPrompt,
          model: modelName,
          usageId: usageRecord.id,
        };
      } catch (error: unknown) {
        // 6. On failure: refund credits and update usage record
        await addAICredits(ctx.user.id, input.creditCost, "bonus"); // refund
        const errorMsg = error instanceof Error ? error.message : "Unknown error during image generation";
        await updateAIUsageStatus(usageRecord.id, "failed", undefined, errorMsg);

        throw new Error(`Image generation failed (${modelName}): ${errorMsg}`);
      }
    }),

  /** Deduct credits for image generation (legacy - kept for backward compatibility) */
  deductCreditsForImage: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        imageModel: z.string().default("dall-e-3"),
        prompt: z.string().min(1),
        imageSize: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
        status: "pending",
      });

      return updated;
    }),

  /** Deduct credits for video generation */
  deductCreditsForVideo: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(1),
        videoModel: z.string().default("runway-ml"),
        prompt: z.string().min(1),
        videoDuration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
        status: "pending",
      });

      return updated;
    }),

  /** Get user's AI usage history */
  getUsageHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
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
        features: ["Revised prompt", "HD quality", "Multiple sizes"],
      },
      {
        id: "nano-banana",
        name: "Nano Banana",
        provider: "Google Gemini 2.5 Flash",
        description: GEMINI_IMAGE_MODELS["nano-banana"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana"].creditCost,
        badge: "Fast",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana"].aspectRatios],
        features: ["Text in images", "Multi-language", "Lowest cost"],
      },
      {
        id: "nano-banana-pro",
        name: "Nano Banana Pro",
        provider: "Google Gemini 3 Pro",
        description: GEMINI_IMAGE_MODELS["nano-banana-pro"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana-pro"].creditCost,
        badge: "4K Studio",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana-pro"].aspectRatios],
        features: ["4K resolution", "Complex layouts", "Precise text rendering", "Google Search grounding"],
      },
      {
        id: "nano-banana-2",
        name: "Nano Banana 2",
        provider: "Google Gemini 3.1 Flash",
        description: GEMINI_IMAGE_MODELS["nano-banana-2"].description,
        creditCost: GEMINI_IMAGE_MODELS["nano-banana-2"].creditCost,
        badge: "New",
        aspectRatios: [...GEMINI_IMAGE_MODELS["nano-banana-2"].aspectRatios],
        features: ["0.5K-4K resolution", "Extra aspect ratios", "Image Search grounding", "Production-scale"],
      },
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
          "10 صور شهرياً",
          "جودة معيارية",
          "دعم البريد الإلكتروني",
        ],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyCredits: 100,
        price: 29,
        features: [
          "100 صورة شهرياً",
          "جودة عالية",
          "دعم الفيديو",
          "أولوية في المعالجة",
          "دعم الأولويات",
        ],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyCredits: 1000,
        price: 99,
        features: [
          "1000 صورة شهرياً",
          "جودة احترافية",
          "فيديوهات غير محدودة",
          "معالجة فورية",
          "دعم مخصص 24/7",
          "واجهة برمجية (API)",
        ],
      },
    ];
  }),
});
