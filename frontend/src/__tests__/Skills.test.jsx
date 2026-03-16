import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Skills from "../components/Skills";

describe("Skills", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    globalThis.fetch = vi.fn(() => new Promise(() => {}));
    render(<Skills />);
    expect(screen.getByText("Loading skills...")).toBeInTheDocument();
  });

  it("renders skills grouped by category", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 1, name: "Python", category: "Programming", order: 1 },
            { id: 2, name: "Django", category: "Frameworks", order: 1 },
          ]),
      })
    );

    render(<Skills />);
    await waitFor(() => {
      expect(screen.getByText("Python")).toBeInTheDocument();
      expect(screen.getByText("Django")).toBeInTheDocument();
    });
  });

  it("shows error state on failure", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500 })
    );

    render(<Skills />);
    await waitFor(() => {
      expect(screen.getByText("Failed to load skills.")).toBeInTheDocument();
    });
  });
});
