/**
 * Gemini (Nano Banana) Image Generation Helper
 * Supports 3 models: Nano Banana, Nano Banana Pro, Nano Banana 2
 * Uses Google Gemini API to generate images and stores them in S3
 */
import { GoogleGenAI } from "@google/genai";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";

/** Supported Gemini image models */
export const GEMINI_IMAGE_MODELS = {
  "nano-banana": {
    modelCode: "gemini-2.5-flash-image",
    name: "Nano Banana",
    description: "Fast, creative workflows with state-of-the-art speed",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"] as const,
    creditCost: 1,
  },
  "nano-banana-pro": {
    modelCode: "gemini-3-pro-image-preview",
    name: "Nano Banana Pro",
    description:
      "Studio-quality 4K visuals, complex layouts, precise text rendering",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"] as const,
    creditCost: 3,
  },
  "nano-banana-2": {
    modelCode: "gemini-3.1-flash-image-preview",
    name: "Nano Banana 2",
    description:
      "High-efficiency production-scale, supports 0.5K-4K and extra aspect ratios",
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "1:4", "4:1"] as const,
    creditCost: 2,
  },
} as const;

export type GeminiModelId = keyof typeof GEMINI_IMAGE_MODELS;

export type GeminiImageOptions = {
  prompt: string;
  model?: GeminiModelId;
  aspectRatio?: string;
  style?: string;
};

export type GeminiImageResult = {
  url: string;
  s3Key: string;
  revisedPrompt?: string;
};

/**
 * Generate an image using Gemini (Nano Banana) API
 * Returns the S3 URL and key of the stored image
 */
export async function generateImageWithGemini(
  options: GeminiImageOptions,
): Promise<GeminiImageResult> {
  const apiKey = ENV.geminiApiKey;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please add your Gemini API key.",
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  // Determine which model to use
  const modelId = options.model || "nano-banana";
  const modelConfig = GEMINI_IMAGE_MODELS[modelId];
  if (!modelConfig) {
    throw new Error(`Unknown Gemini model: ${modelId}`);
  }

  // Build the prompt with style if provided
  let fullPrompt = options.prompt;
  if (options.style && options.style !== "vivid") {
    fullPrompt = `${options.style} style: ${options.prompt}`;
  }

  // Add aspect ratio hint to prompt if not square
  if (options.aspectRatio && options.aspectRatio !== "1:1") {
    fullPrompt += ` (aspect ratio: ${options.aspectRatio})`;
  }

  // Call Gemini API for image generation
  const response = await ai.models.generateContent({
    model: modelConfig.modelCode,
    contents: fullPrompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  // Extract image data from response
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No response candidates from Gemini API");
  }

  const parts = candidates[0].content?.parts;
  if (!parts || parts.length === 0) {
    throw new Error("No content parts in Gemini API response");
  }

  // Find the image part and optional text part
  let imageBuffer: Buffer | null = null;
  let mimeType = "image/png";
  let textResponse: string | undefined;

  for (const part of parts) {
    if (part.inlineData) {
      imageBuffer = Buffer.from(part.inlineData.data as string, "base64");
      mimeType = part.inlineData.mimeType || "image/png";
    } else if (part.text) {
      textResponse = part.text;
    }
  }

  if (!imageBuffer) {
    throw new Error(
      "No image data returned from Gemini API. The model may have declined to generate this image.",
    );
  }

  // Determine file extension from mime type
  const ext =
    mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";

  // Generate unique filename with model prefix
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const modelPrefix = modelId.replace(/-/g, "");
  const s3Key = `ai-generated/${modelPrefix}-${timestamp}-${randomSuffix}.${ext}`;

  // Upload to S3
  const { url } = await storagePut(s3Key, imageBuffer, mimeType);

  return {
    url,
    s3Key,
    revisedPrompt: textResponse || undefined,
  };
}
