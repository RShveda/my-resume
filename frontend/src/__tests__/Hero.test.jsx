import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Hero from "../components/Hero";

describe("Hero", () => {
  it("displays name and title", () => {
    render(<Hero />);
    expect(screen.getByText("Roman Shveda")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("contains email link", () => {
    render(<Hero />);
    expect(screen.getByText("rshveda@gmail.com")).toHaveAttribute(
      "href",
      "mailto:rshveda@gmail.com"
    );
  });

  it("contains LinkedIn link", () => {
    render(<Hero />);
    const link = screen.getByText("LinkedIn");
    expect(link).toHaveAttribute("href", "https://linkedin.com/in/roman-shveda");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
