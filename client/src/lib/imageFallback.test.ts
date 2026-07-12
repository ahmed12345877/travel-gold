import { describe, expect, it } from "vitest";
import {
  applyLuxuryImageFallback,
  getLuxuryPlaceholderImageUrl,
} from "./imageFallback";

describe("imageFallback", () => {
  it("replaces broken image src with luxury placeholder", () => {
    const image = document.createElement("img");
    image.src = "https://example.com/broken.jpg";

    applyLuxuryImageFallback(image);

    expect(image.src).toBe(getLuxuryPlaceholderImageUrl());
    expect(image.getAttribute("data-luxury-fallback-applied")).toBe("true");
  });

  it("does not override src after fallback is already applied", () => {
    const image = document.createElement("img");
    image.src = "https://example.com/first.jpg";

    applyLuxuryImageFallback(image);
    image.src = "https://example.com/custom.jpg";
    applyLuxuryImageFallback(image);

    expect(image.src).toBe("https://example.com/custom.jpg");
  });
});
