/**
 * OpenAI DALL-E Image Generation Helper
 * Uses OpenAI API to generate images and stores them in S3
 */
import OpenAI from "openai";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";

export type ImageGenerationOptions = {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  style?: "vivid" | "natural";
  quality?: "standard" | "hd";
};

export type ImageGenerationResult = {
  url: string;
  s3Key: string;
  revisedPrompt?: string;
};

/**
 * Generate an image using OpenAI DALL-E 3 API
 * Returns the S3 URL and key of the stored image
 */
export async function generateImageWithDALLE(
  options: ImageGenerationOptions,
): Promise<ImageGenerationResult> {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Please add your OpenAI API key.",
    );
  }

  const openai = new OpenAI({ apiKey });

  // Map size strings to DALL-E 3 supported sizes
  let dalleSize: "1024x1024" | "1792x1024" | "1024x1792" = "1024x1024";
  if (options.size === "1792x1024") {
    dalleSize = "1792x1024";
  } else if (options.size === "1024x1792") {
    dalleSize = "1024x1792";
  }

  // Call OpenAI DALL-E 3 API
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: options.prompt,
    n: 1,
    size: dalleSize,
    style: options.style || "vivid",
    quality: options.quality || "standard",
    response_format: "b64_json",
  });

  if (!response.data || response.data.length === 0) {
    throw new Error("No image data returned from OpenAI API");
  }
  const imageData = response.data[0];
  if (!imageData?.b64_json) {
    throw new Error("No image data returned from OpenAI API");
  }

  // Convert base64 to buffer
  const buffer = Buffer.from(imageData.b64_json, "base64");

  // Generate unique filename
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const s3Key = `ai-generated/${timestamp}-${randomSuffix}.png`;

  // Upload to S3
  const { url } = await storagePut(s3Key, buffer, "image/png");

  return {
    url,
    s3Key,
    revisedPrompt: imageData.revised_prompt || undefined,
  };
}
