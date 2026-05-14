/**
 * CaseStudies page – unit tests
 * Tests: rendering, category filters, expanded view, metrics
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import CaseStudies from "./CaseStudies";

/* ─── Mocks ─── */
vi.mock("framer-motion", () => {
  const Proxy = ({ children, ...p }: any) => <div {...p}>{children}</div>;
  return {
    motion: new window.Proxy({}, { get: () => Proxy }),
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

vi.mock("@/components/Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}));
vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer" />,
}));
vi.mock("@/components/PageMeta", () => ({ default: () => null }));
vi.mock("react-helmet-async", () => ({
  Helmet: ({ children }: any) => <div data-testid="helmet">{children}</div>,
  HelmetProvider: ({ children }: any) => <>{children}</>,
}));

describe("CaseStudies Page", () => {
  afterEach(() => {
    cleanup();
  });

  /* ─── Structure ─── */
  it("renders Navbar and Footer", () => {
    render(<CaseStudies />);
    expect(screen.getByTestId("navbar")).toBeDefined();
    expect(screen.getByTestId("footer")).toBeDefined();
  });

  it("renders page heading with Case Studies text", () => {
    render(<CaseStudies />);
    const headings = screen.getAllByText(/Case Studies/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders Our Portfolio badge", () => {
    render(<CaseStudies />);
    const badges = screen.getAllByText("Our Portfolio");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  /* ─── Stats ─── */
  it("renders stats section with metric values", () => {
    render(<CaseStudies />);
    expect(screen.getAllByText("150+").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("98%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("$500M+").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("45+").length).toBeGreaterThanOrEqual(1);
  });

  it("renders stat labels", () => {
    render(<CaseStudies />);
    expect(
      screen.getAllByText("Projects Completed").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Client Satisfaction").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Revenue Generated").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Countries Reached").length,
    ).toBeGreaterThanOrEqual(1);
  });

  /* ─── Category Filters ─── */
  it("renders category filter buttons", () => {
    render(<CaseStudies />);
    expect(screen.getAllByText(/All Projects/).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText(/Tourism/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Branding/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Investment/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Events/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Corporate/).length).toBeGreaterThanOrEqual(1);
  });

  it("filters case studies by Tourism category", () => {
    render(<CaseStudies />);
    const tourismBtn = screen
      .getAllByRole("button")
      .find((b: HTMLElement) => b.textContent?.includes("Tourism"));
    fireEvent.click(tourismBtn!);
    const viewButtons = screen.getAllByText("View Full Case Study");
    expect(viewButtons.length).toBe(2);
  });

  it("filters case studies by Branding category", () => {
    render(<CaseStudies />);
    const brandingBtn = screen
      .getAllByRole("button")
      .find((b: HTMLElement) => b.textContent?.includes("Branding"));
    fireEvent.click(brandingBtn!);
    const viewButtons = screen.getAllByText("View Full Case Study");
    expect(viewButtons.length).toBe(1);
  });

  it("returns to all when All Projects is clicked", () => {
    render(<CaseStudies />);
    const tourismBtn = screen
      .getAllByRole("button")
      .find((b: HTMLElement) => b.textContent?.includes("Tourism"));
    fireEvent.click(tourismBtn!);
    const allBtn = screen
      .getAllByRole("button")
      .find((b: HTMLElement) => b.textContent?.includes("All Projects"));
    fireEvent.click(allBtn!);
    const viewButtons = screen.getAllByText("View Full Case Study");
    expect(viewButtons.length).toBe(6);
  });

  /* ─── Case Study Cards ─── */
  it("renders 6 case study cards by default", () => {
    render(<CaseStudies />);
    const viewButtons = screen.getAllByText("View Full Case Study");
    expect(viewButtons.length).toBe(6);
  });

  it("renders case study titles", () => {
    render(<CaseStudies />);
    expect(
      screen.getAllByText("Luxury Nile Cruise Experience").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("El Gouna Luxury Resort Branding").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("Abu Simbel Heritage Tourism Campaign").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders client names", () => {
    render(<CaseStudies />);
    expect(
      screen.getAllByText(/Royal Nile Cruises/).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Oasis Resorts International/).length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Egypt Tourism Authority/).length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders featured badges on featured cards", () => {
    render(<CaseStudies />);
    const featuredBadges = screen.getAllByText("Featured");
    expect(featuredBadges.length).toBeGreaterThanOrEqual(1);
  });

  it("renders year and location on cards", () => {
    render(<CaseStudies />);
    // Location text is rendered inline with year and icons, use queryByText with function
    const container = document.body;
    expect(container.textContent).toContain("Luxor - Aswan, Egypt");
    expect(container.textContent).toContain("El Gouna, Red Sea");
  });

  it("renders metric values on cards", () => {
    render(<CaseStudies />);
    expect(screen.getAllByText("340%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("2,500+").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("185%").length).toBeGreaterThanOrEqual(1);
  });

  it("renders tags on cards", () => {
    render(<CaseStudies />);
    expect(screen.getAllByText("Luxury Travel").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("Nile Cruise").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Brand Identity").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  /* ─── Expanded View ─── */
  it("expands case study on View Full Case Study click", () => {
    render(<CaseStudies />);
    const viewButtons = screen.getAllByText("View Full Case Study");
    fireEvent.click(viewButtons[0]);
    expect(screen.getAllByText("The Challenge").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("Our Solution").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("Key Results").length).toBeGreaterThanOrEqual(1);
  });

  it("shows testimonial in expanded view", () => {
    render(<CaseStudies />);
    const viewButtons = screen.getAllByText("View Full Case Study");
    fireEvent.click(viewButtons[0]);
    // Testimonial section shows the quote text and author
    const container = document.body;
    expect(container.textContent).toContain("VANIR GROUP transformed");
  });

  /* ─── CTA Section ─── */
  it("renders CTA section", () => {
    render(<CaseStudies />);
    expect(screen.getAllByText(/GET IN TOUCH/i).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(
      screen.getAllByText(/BOOK A CONSULTATION/i).length,
    ).toBeGreaterThanOrEqual(1);
  });

  /* ─── Breadcrumb ─── */
  it("renders breadcrumb navigation", () => {
    render(<CaseStudies />);
    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Case Studies/).length).toBeGreaterThanOrEqual(
      1,
    );
  });
});
