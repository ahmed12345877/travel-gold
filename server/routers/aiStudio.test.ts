import { describe, it, expect, beforeEach, vi } from "vitest";
import { aiStudioRouter } from "./aiStudio";
import * as db from "../db";
import * as openaiImageGen from "../openaiImageGen";
import * as geminiImageGen from "../geminiImageGen";

// Mock the database functions
vi.mock("../db", () => ({
  getOrCreateAISubscription: vi.fn(),
  updateAISubscription: vi.fn(),
  getOrCreateAICredits: vi.fn(),
  addAICredits: vi.fn(),
  deductAICredits: vi.fn(),
  createAIUsage: vi.fn(),
  getUserAIUsage: vi.fn(),
  getAIUsageStats: vi.fn(),
  updateAIUsageStatus: vi.fn(),
}));

// Mock the OpenAI image generation
vi.mock("../openaiImageGen", () => ({
  generateImageWithDALLE: vi.fn(),
}));

// Mock the Gemini image generation
vi.mock("../geminiImageGen", () => ({
  generateImageWithGemini: vi.fn(),
  GEMINI_IMAGE_MODELS: {
    "nano-banana": {
      modelCode: "gemini-2.5-flash-image",
      name: "Nano Banana",
      description: "Fast, creative workflows",
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
      creditCost: 1,
    },
    "nano-banana-pro": {
      modelCode: "gemini-3-pro-image-preview",
      name: "Nano Banana Pro",
      description: "Studio-quality 4K visuals",
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
      creditCost: 3,
    },
    "nano-banana-2": {
      modelCode: "gemini-3.1-flash-image-preview",
      name: "Nano Banana 2",
      description: "High-efficiency production-scale",
      aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"],
      creditCost: 2,
    },
  },
}));

describe("AI Studio Router", () => {
  const mockUserId = 1;
  const mockContext = {
    user: { id: mockUserId, name: "Test User" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getSubscription", () => {
    it("should fetch user subscription", async () => {
      const mockSubscription = {
        id: 1,
        userId: mockUserId,
        plan: "free",
        status: "active",
        startDate: Date.now(),
      };

      vi.mocked(db.getOrCreateAISubscription).mockResolvedValue(
        mockSubscription as any,
      );

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .getSubscription();

      expect(db.getOrCreateAISubscription).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockSubscription);
    });
  });

  describe("getCredits", () => {
    it("should fetch user credits", async () => {
      const mockCredits = {
        id: 1,
        userId: mockUserId,
        balance: "10",
        totalUsed: "0",
      };

      vi.mocked(db.getOrCreateAICredits).mockResolvedValue(mockCredits as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .getCredits();

      expect(db.getOrCreateAICredits).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockCredits);
    });
  });

  describe("addCredits", () => {
    it("should add credits to user account", async () => {
      const mockCredits = {
        id: 1,
        userId: mockUserId,
        balance: "15",
        totalUsed: "0",
      };

      vi.mocked(db.addAICredits).mockResolvedValue(mockCredits as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .addCredits({ amount: 5, reason: "bonus" });

      expect(db.addAICredits).toHaveBeenCalledWith(mockUserId, 5, "bonus");
      expect(result).toEqual(mockCredits);
    });
  });

  describe("generateImage", () => {
    it("should generate image successfully with DALL-E", async () => {
      // Mock sufficient credits
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "5",
      } as any);

      // Mock credit deduction
      vi.mocked(db.deductAICredits).mockResolvedValue({
        balance: "8",
        totalUsed: "7",
      } as any);

      // Mock usage record creation
      vi.mocked(db.createAIUsage).mockResolvedValue({
        id: 42,
        userId: mockUserId,
        type: "image",
        model: "dall-e-3",
        prompt: "A beautiful pyramid",
        creditsCost: "2",
        status: "pending",
      } as any);

      // Mock DALL-E generation
      vi.mocked(openaiImageGen.generateImageWithDALLE).mockResolvedValue({
        url: "https://s3.example.com/ai-generated/123.png",
        s3Key: "ai-generated/123.png",
        revisedPrompt:
          "A stunning photograph of a beautiful pyramid in Egypt at golden hour",
      });

      // Mock usage status update
      vi.mocked(db.updateAIUsageStatus).mockResolvedValue({
        id: 42,
        status: "completed",
        resultUrl: "https://s3.example.com/ai-generated/123.png",
      } as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .generateImage({
          prompt: "A beautiful pyramid",
          size: "1024x1024",
          style: "vivid",
          quality: "standard",
          creditCost: 2,
        });

      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe(
        "https://s3.example.com/ai-generated/123.png",
      );
      expect(result.revisedPrompt).toBe(
        "A stunning photograph of a beautiful pyramid in Egypt at golden hour",
      );
      expect(result.usageId).toBe(42);

      // Verify credit deduction was called
      expect(db.deductAICredits).toHaveBeenCalledWith(mockUserId, 2);

      // Verify usage record was created
      expect(db.createAIUsage).toHaveBeenCalledWith({
        userId: mockUserId,
        type: "image",
        model: "dall-e-3",
        prompt: "A beautiful pyramid",
        creditsCost: "2",
        imageSize: "1024x1024",
        status: "pending",
      });

      // Verify DALL-E was called with correct params
      expect(openaiImageGen.generateImageWithDALLE).toHaveBeenCalledWith({
        prompt: "A beautiful pyramid",
        size: "1024x1024",
        style: "vivid",
        quality: "standard",
      });

      // Verify usage status was updated to completed
      expect(db.updateAIUsageStatus).toHaveBeenCalledWith(
        42,
        "completed",
        "https://s3.example.com/ai-generated/123.png",
      );
    });

    it("should throw error if insufficient credits", async () => {
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "1",
        totalUsed: "9",
      } as any);

      await expect(
        aiStudioRouter.createCaller(mockContext as any).generateImage({
          prompt: "A beautiful pyramid",
          size: "1024x1024",
          creditCost: 2,
        }),
      ).rejects.toThrow("Insufficient credits");
    });

    it("should refund credits on DALL-E API failure", async () => {
      // Mock sufficient credits
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "5",
      } as any);

      vi.mocked(db.deductAICredits).mockResolvedValue({
        balance: "8",
        totalUsed: "7",
      } as any);

      vi.mocked(db.createAIUsage).mockResolvedValue({
        id: 43,
        userId: mockUserId,
        status: "pending",
      } as any);

      // Mock DALL-E failure
      vi.mocked(openaiImageGen.generateImageWithDALLE).mockRejectedValue(
        new Error("OpenAI API rate limit exceeded"),
      );

      vi.mocked(db.addAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "5",
      } as any);

      vi.mocked(db.updateAIUsageStatus).mockResolvedValue({
        id: 43,
        status: "failed",
      } as any);

      await expect(
        aiStudioRouter.createCaller(mockContext as any).generateImage({
          prompt: "A beautiful pyramid",
          size: "1024x1024",
          creditCost: 2,
        }),
      ).rejects.toThrow("Image generation failed");

      // Verify credits were refunded
      expect(db.addAICredits).toHaveBeenCalledWith(mockUserId, 2, "bonus");

      // Verify usage status was updated to failed
      expect(db.updateAIUsageStatus).toHaveBeenCalledWith(
        43,
        "failed",
        undefined,
        "OpenAI API rate limit exceeded",
      );
    });

    it("should support landscape size", async () => {
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "0",
      } as any);

      vi.mocked(db.deductAICredits).mockResolvedValue({
        balance: "7",
        totalUsed: "3",
      } as any);

      vi.mocked(db.createAIUsage).mockResolvedValue({
        id: 44,
        status: "pending",
      } as any);

      vi.mocked(openaiImageGen.generateImageWithDALLE).mockResolvedValue({
        url: "https://s3.example.com/ai-generated/456.png",
        s3Key: "ai-generated/456.png",
      });

      vi.mocked(db.updateAIUsageStatus).mockResolvedValue({
        id: 44,
        status: "completed",
      } as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .generateImage({
          prompt: "Pyramids panorama",
          size: "1792x1024",
          style: "natural",
          quality: "hd",
          creditCost: 3,
        });

      expect(result.success).toBe(true);
      expect(openaiImageGen.generateImageWithDALLE).toHaveBeenCalledWith({
        prompt: "Pyramids panorama",
        size: "1792x1024",
        style: "natural",
        quality: "hd",
      });
    });
  });

  describe("generateImage with Nano Banana", () => {
    it("should generate image successfully with Nano Banana (Gemini)", async () => {
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "5",
      } as any);

      vi.mocked(db.deductAICredits).mockResolvedValue({
        balance: "9",
        totalUsed: "6",
      } as any);

      vi.mocked(db.createAIUsage).mockResolvedValue({
        id: 50,
        userId: mockUserId,
        type: "image",
        model: "nano-banana",
        prompt: "Egyptian temple at sunset",
        creditsCost: "1",
        status: "pending",
      } as any);

      vi.mocked(geminiImageGen.generateImageWithGemini).mockResolvedValue({
        url: "https://s3.example.com/ai-generated/gemini-789.png",
        s3Key: "ai-generated/gemini-789.png",
      });

      vi.mocked(db.updateAIUsageStatus).mockResolvedValue({
        id: 50,
        status: "completed",
        resultUrl: "https://s3.example.com/ai-generated/gemini-789.png",
      } as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .generateImage({
          prompt: "Egyptian temple at sunset",
          model: "nano-banana",
          aspectRatio: "16:9",
          creditCost: 1,
        });

      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe(
        "https://s3.example.com/ai-generated/gemini-789.png",
      );
      expect(result.usageId).toBe(50);

      expect(db.deductAICredits).toHaveBeenCalledWith(mockUserId, 1);

      expect(geminiImageGen.generateImageWithGemini).toHaveBeenCalledWith({
        prompt: "Egyptian temple at sunset",
        model: "nano-banana",
        aspectRatio: "16:9",
        style: "vivid",
      });

      // Verify DALL-E was NOT called
      expect(openaiImageGen.generateImageWithDALLE).not.toHaveBeenCalled();
    });

    it("should refund credits on Gemini API failure", async () => {
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "5",
      } as any);

      vi.mocked(db.deductAICredits).mockResolvedValue({
        balance: "9",
        totalUsed: "6",
      } as any);

      vi.mocked(db.createAIUsage).mockResolvedValue({
        id: 51,
        userId: mockUserId,
        status: "pending",
      } as any);

      vi.mocked(geminiImageGen.generateImageWithGemini).mockRejectedValue(
        new Error("Gemini API quota exceeded"),
      );

      vi.mocked(db.addAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "5",
      } as any);

      vi.mocked(db.updateAIUsageStatus).mockResolvedValue({
        id: 51,
        status: "failed",
      } as any);

      await expect(
        aiStudioRouter.createCaller(mockContext as any).generateImage({
          prompt: "Egyptian temple at sunset",
          model: "nano-banana",
          aspectRatio: "1:1",
          creditCost: 1,
        }),
      ).rejects.toThrow("Image generation failed");

      expect(db.addAICredits).toHaveBeenCalledWith(mockUserId, 1, "bonus");
      expect(db.updateAIUsageStatus).toHaveBeenCalledWith(
        51,
        "failed",
        undefined,
        "Gemini API quota exceeded",
      );
    });
  });

  describe("generateImage with Nano Banana Pro", () => {
    it("should generate image successfully with Nano Banana Pro", async () => {
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "5",
      } as any);

      vi.mocked(db.deductAICredits).mockResolvedValue({
        balance: "7",
        totalUsed: "8",
      } as any);

      vi.mocked(db.createAIUsage).mockResolvedValue({
        id: 60,
        userId: mockUserId,
        type: "image",
        model: "nano-banana-pro",
        prompt: "4K luxury hotel lobby",
        creditsCost: "3",
        status: "pending",
      } as any);

      vi.mocked(geminiImageGen.generateImageWithGemini).mockResolvedValue({
        url: "https://s3.example.com/ai-generated/pro-123.png",
        s3Key: "ai-generated/pro-123.png",
        revisedPrompt: "A luxurious hotel lobby with golden accents",
      });

      vi.mocked(db.updateAIUsageStatus).mockResolvedValue({
        id: 60,
        status: "completed",
      } as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .generateImage({
          prompt: "4K luxury hotel lobby",
          model: "nano-banana-pro",
          aspectRatio: "4:3",
          creditCost: 3,
        });

      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe(
        "https://s3.example.com/ai-generated/pro-123.png",
      );
      expect(result.model).toBe("nano-banana-pro");

      expect(db.deductAICredits).toHaveBeenCalledWith(mockUserId, 3);

      expect(geminiImageGen.generateImageWithGemini).toHaveBeenCalledWith({
        prompt: "4K luxury hotel lobby",
        model: "nano-banana-pro",
        aspectRatio: "4:3",
        style: "vivid",
      });

      expect(openaiImageGen.generateImageWithDALLE).not.toHaveBeenCalled();
    });
  });

  describe("generateImage with Nano Banana 2", () => {
    it("should generate image successfully with Nano Banana 2 and extra aspect ratios", async () => {
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "5",
      } as any);

      vi.mocked(db.deductAICredits).mockResolvedValue({
        balance: "8",
        totalUsed: "7",
      } as any);

      vi.mocked(db.createAIUsage).mockResolvedValue({
        id: 70,
        userId: mockUserId,
        type: "image",
        model: "nano-banana-2",
        prompt: "Ultra tall pyramid view",
        creditsCost: "2",
        status: "pending",
      } as any);

      vi.mocked(geminiImageGen.generateImageWithGemini).mockResolvedValue({
        url: "https://s3.example.com/ai-generated/nb2-456.png",
        s3Key: "ai-generated/nb2-456.png",
      });

      vi.mocked(db.updateAIUsageStatus).mockResolvedValue({
        id: 70,
        status: "completed",
      } as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .generateImage({
          prompt: "Ultra tall pyramid view",
          model: "nano-banana-2",
          aspectRatio: "1:4",
          creditCost: 2,
        });

      expect(result.success).toBe(true);
      expect(result.imageUrl).toBe(
        "https://s3.example.com/ai-generated/nb2-456.png",
      );
      expect(result.model).toBe("nano-banana-2");

      expect(db.deductAICredits).toHaveBeenCalledWith(mockUserId, 2);

      expect(geminiImageGen.generateImageWithGemini).toHaveBeenCalledWith({
        prompt: "Ultra tall pyramid view",
        model: "nano-banana-2",
        aspectRatio: "1:4",
        style: "vivid",
      });

      expect(openaiImageGen.generateImageWithDALLE).not.toHaveBeenCalled();
    });

    it("should support 4:1 ultra wide aspect ratio with Nano Banana 2", async () => {
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "0",
      } as any);

      vi.mocked(db.deductAICredits).mockResolvedValue({
        balance: "8",
        totalUsed: "2",
      } as any);

      vi.mocked(db.createAIUsage).mockResolvedValue({
        id: 71,
        status: "pending",
      } as any);

      vi.mocked(geminiImageGen.generateImageWithGemini).mockResolvedValue({
        url: "https://s3.example.com/ai-generated/nb2-wide.png",
        s3Key: "ai-generated/nb2-wide.png",
      });

      vi.mocked(db.updateAIUsageStatus).mockResolvedValue({
        id: 71,
        status: "completed",
      } as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .generateImage({
          prompt: "Ultra wide panoramic desert view",
          model: "nano-banana-2",
          aspectRatio: "4:1",
          creditCost: 2,
        });

      expect(result.success).toBe(true);
      expect(geminiImageGen.generateImageWithGemini).toHaveBeenCalledWith({
        prompt: "Ultra wide panoramic desert view",
        model: "nano-banana-2",
        aspectRatio: "4:1",
        style: "vivid",
      });
    });
  });

  describe("getModels", () => {
    it("should return all 4 AI models", async () => {
      const result = await aiStudioRouter.createCaller({} as any).getModels();

      expect(result).toHaveLength(4);
      expect(result[0].id).toBe("dall-e-3");
      expect(result[1].id).toBe("nano-banana");
      expect(result[2].id).toBe("nano-banana-pro");
      expect(result[3].id).toBe("nano-banana-2");

      // Verify credit costs
      expect(result[0].creditCost).toBe(2);
      expect(result[1].creditCost).toBe(1);
      expect(result[2].creditCost).toBe(3);
      expect(result[3].creditCost).toBe(2);
    });
  });

  describe("deductCreditsForImage", () => {
    it("should deduct credits for image generation", async () => {
      const mockCredits = {
        id: 1,
        userId: mockUserId,
        balance: "9",
        totalUsed: "1",
      };

      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "10",
        totalUsed: "0",
      } as any);

      vi.mocked(db.deductAICredits).mockResolvedValue(mockCredits as any);
      vi.mocked(db.createAIUsage).mockResolvedValue({ id: 1 } as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .deductCreditsForImage({
          amount: 1,
          prompt: "A beautiful beach",
          imageModel: "dall-e-3",
        });

      expect(db.deductAICredits).toHaveBeenCalledWith(mockUserId, 1);
      expect(db.createAIUsage).toHaveBeenCalled();
      expect(result).toEqual(mockCredits);
    });

    it("should throw error if insufficient credits", async () => {
      vi.mocked(db.getOrCreateAICredits).mockResolvedValue({
        balance: "0",
        totalUsed: "10",
      } as any);

      await expect(
        aiStudioRouter.createCaller(mockContext as any).deductCreditsForImage({
          amount: 1,
          prompt: "A beautiful beach",
          imageModel: "dall-e-3",
        }),
      ).rejects.toThrow("Insufficient credits");
    });
  });

  describe("getUsageHistory", () => {
    it("should fetch user usage history", async () => {
      const mockUsage = [
        {
          id: 1,
          userId: mockUserId,
          type: "image",
          model: "dall-e-3",
          prompt: "A beach",
          creditsCost: "1",
          status: "completed",
        },
      ];

      vi.mocked(db.getUserAIUsage).mockResolvedValue(mockUsage as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .getUsageHistory({ limit: 50, offset: 0 });

      expect(db.getUserAIUsage).toHaveBeenCalledWith(mockUserId, 50, 0);
      expect(result).toEqual(mockUsage);
    });
  });

  describe("getStats", () => {
    it("should fetch user AI usage statistics", async () => {
      const mockStats = {
        totalGenerations: 5,
        byType: {
          image: 4,
          video: 1,
          edit: 0,
        },
        totalCost: 6,
      };

      vi.mocked(db.getAIUsageStats).mockResolvedValue(mockStats as any);

      const result = await aiStudioRouter
        .createCaller(mockContext as any)
        .getStats();

      expect(db.getAIUsageStats).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockStats);
    });
  });

  describe("getPlans", () => {
    it("should return subscription plans", async () => {
      const result = await aiStudioRouter.createCaller({} as any).getPlans();

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("free");
      expect(result[1].id).toBe("pro");
      expect(result[2].id).toBe("enterprise");
    });
  });
});
