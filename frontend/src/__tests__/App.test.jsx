import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

// Mock fetch for dynamic components
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

describe("App", () => {
  it("renders the hero section with name", async () => {
    render(<App />);
    expect(screen.getByText("Roman Shveda")).toBeInTheDocument();
    await waitFor(() => {});
  });

  it("renders the navbar", async () => {
    render(<App />);
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    await waitFor(() => {});
  });

  it("renders the education section", async () => {
    render(<App />);
    expect(screen.getByText("Bachelor's Degree in Finance")).toBeInTheDocument();
    await waitFor(() => {});
  });
});
