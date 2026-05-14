import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OptimizedImage, { ImageGrid, ImageSkeleton } from "./OptimizedImage";

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  global.IntersectionObserver = vi.fn((callback) => ({
    observe: mockObserve.mockImplementation(() => {
      callback([{ isIntersecting: true }]);
    }),
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
    root: null,
    rootMargin: "",
    thresholds: [],
    takeRecords: () => [],
  })) as any;
});

describe("OptimizedImage", () => {
  it("renders with lazy loading attributes", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Lazy test image"
      />,
    );
    const img = container.querySelector("img");
    expect(img).toBeDefined();
    expect(img?.getAttribute("loading")).toBe("lazy");
    expect(img?.getAttribute("decoding")).toBe("async");
  });

  it("renders with eager loading when lazy=false", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Eager test image"
        lazy={false}
      />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("loading")).toBe("eager");
  });

  it("applies custom className to image", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Styled test image"
        className="w-full h-full object-cover"
      />,
    );
    const img = container.querySelector("img");
    expect(img?.className).toContain("object-cover");
  });

  it("applies containerClassName to wrapper div", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Container test image"
        containerClassName="w-full h-64"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("w-full");
    expect(wrapper.className).toContain("h-64");
  });

  it("shows shimmer placeholder before image loads", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Shimmer test image"
      />,
    );
    const shimmer = container.querySelector(".animate-pulse");
    expect(shimmer).toBeDefined();
  });

  it("hides shimmer after image loads", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Load test image"
      />,
    );
    const img = container.querySelector("img")!;
    fireEvent.load(img);
    const shimmer = container.querySelector(".animate-pulse");
    expect(shimmer).toBeNull();
  });

  it("shows error fallback when image fails to load", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/broken.jpg"
        alt="Broken test image"
      />,
    );
    const img = container.querySelector("img")!;
    fireEvent.error(img);
    expect(screen.getByText("Image unavailable")).toBeDefined();
  });

  it("calls onImageLoad callback when image loads", () => {
    const onLoad = vi.fn();
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Callback test image"
        onImageLoad={onLoad}
      />,
    );
    const img = container.querySelector("img")!;
    fireEvent.load(img);
    expect(onLoad).toHaveBeenCalledOnce();
  });

  it("calls onImageError callback when image fails", () => {
    const onError = vi.fn();
    const { container } = render(
      <OptimizedImage
        src="https://example.com/broken.jpg"
        alt="Error callback test image"
        onImageError={onError}
      />,
    );
    const img = container.querySelector("img")!;
    fireEvent.error(img);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("applies aspect ratio style to container", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Aspect ratio test image"
        aspectRatio="16/9"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe("16/9");
  });

  it("uses IntersectionObserver for lazy loading", () => {
    render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Observer test image"
        lazy={true}
      />,
    );
    expect(global.IntersectionObserver).toHaveBeenCalled();
    expect(mockObserve).toHaveBeenCalled();
  });

  it("applies placeholder color", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Color test image"
        placeholderColor="#ff0000"
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  // New animation tests
  it("applies blur-up animation by default (blur-sm before load)", () => {
    const { container } = render(
      <OptimizedImage src="https://example.com/test.jpg" alt="Blur-up test" />,
    );
    const img = container.querySelector("img");
    expect(img?.className).toContain("blur-sm");
  });

  it("removes blur after load with blur-up animation", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Blur load test"
      />,
    );
    const img = container.querySelector("img")!;
    fireEvent.load(img);
    expect(img.className).toContain("blur-0");
    expect(img.className).toContain("opacity-100");
  });

  it("applies fade animation when specified", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Fade test"
        animation="fade"
      />,
    );
    const img = container.querySelector("img");
    expect(img?.className).toContain("opacity-0");
    expect(img?.className).not.toContain("blur");
  });

  it("applies scale animation when specified", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Scale test"
        animation="scale"
      />,
    );
    const img = container.querySelector("img");
    expect(img?.className).toContain("scale-95");
  });

  it("applies slide-up animation when specified", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Slide test"
        animation="slide-up"
      />,
    );
    const img = container.querySelector("img");
    expect(img?.className).toContain("translate-y-4");
  });

  it("uses gold shimmer when goldShimmer=true", () => {
    const { container } = render(
      <OptimizedImage
        src="https://example.com/test.jpg"
        alt="Gold test"
        goldShimmer={true}
      />,
    );
    // Check for gold-colored element in placeholder
    const goldEl = container.querySelector("[class*='theme-primary']");
    expect(goldEl).not.toBeNull();
  });

  it("shows center icon placeholder before load", () => {
    const { container } = render(
      <OptimizedImage src="https://example.com/test.jpg" alt="Icon test" />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});

describe("ImageGrid", () => {
  const images = [
    { src: "img1.jpg", alt: "Image 1", id: "1" },
    { src: "img2.jpg", alt: "Image 2", id: "2" },
    { src: "img3.jpg", alt: "Image 3", id: "3" },
  ];

  it("renders correct number of images", () => {
    const { container } = render(<ImageGrid images={images} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(3);
  });

  it("applies correct column classes for 4 columns", () => {
    const { container } = render(<ImageGrid images={images} columns={4} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("xl:grid-cols-4");
  });

  it("applies correct column classes for 5 columns", () => {
    const { container } = render(<ImageGrid images={images} columns={5} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("xl:grid-cols-5");
  });

  it("calls onImageClick when image is clicked", () => {
    const onClick = vi.fn();
    const { container } = render(
      <ImageGrid images={images} onImageClick={onClick} />,
    );
    const firstItem = container.querySelector(
      "[class*='group']",
    ) as HTMLElement;
    fireEvent.click(firstItem);
    expect(onClick).toHaveBeenCalledWith(images[0], 0);
  });

  it("applies hover ring when onImageClick is provided", () => {
    const { container } = render(
      <ImageGrid images={images} onImageClick={() => {}} />,
    );
    const firstItem = container.querySelector(
      "[class*='group']",
    ) as HTMLElement;
    expect(firstItem.className).toContain("hover:ring-2");
  });

  it("applies custom gap", () => {
    const { container } = render(<ImageGrid images={images} gap="gap-8" />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("gap-8");
  });
});

describe("ImageSkeleton", () => {
  it("renders correct number of skeleton items", () => {
    const { container } = render(<ImageSkeleton count={4} />);
    const items = container.querySelectorAll("[class*='rounded-lg']");
    expect(items.length).toBe(4);
  });

  it("renders 1 skeleton by default", () => {
    const { container } = render(<ImageSkeleton />);
    const items = container.querySelectorAll("[class*='rounded-lg']");
    expect(items.length).toBe(1);
  });

  it("applies gold shimmer when specified", () => {
    const { container } = render(
      <ImageSkeleton count={2} goldShimmer={true} />,
    );
    const goldEl = container.querySelector("[class*='theme-primary']");
    expect(goldEl).not.toBeNull();
  });

  it("applies correct column classes for 5 columns", () => {
    const { container } = render(<ImageSkeleton count={4} columns={5} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("xl:grid-cols-5");
  });

  it("applies custom containerClassName", () => {
    const { container } = render(
      <ImageSkeleton count={2} containerClassName="my-custom" />,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain("my-custom");
  });
});
