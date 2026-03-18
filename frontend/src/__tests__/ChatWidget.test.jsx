import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import ChatWidget from "../components/ChatWidget";

describe("ChatWidget", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the chat bubble", () => {
    render(<ChatWidget />);
    expect(screen.getByLabelText("Open chat")).toBeInTheDocument();
  });

  it("opens the chat window when bubble is clicked", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText("Open chat"));
    expect(screen.getByText("Ask about Roman")).toBeInTheDocument();
  });

  it("shows greeting message when opened", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText("Open chat"));
    expect(
      screen.getByText(/Ask me anything about Roman/)
    ).toBeInTheDocument();
  });

  it("closes the chat window", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText("Open chat"));
    expect(screen.getByText("Ask about Roman")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Close chat"));
    expect(screen.getByLabelText("Open chat")).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText("Open chat"));
    expect(screen.getByLabelText("Send message")).toBeDisabled();
  });

  it("shows user message after sending", async () => {
    // Mock a successful SSE response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"token": "Hi"}\n\n'));
        controller.enqueue(encoder.encode('data: {"done": true}\n\n'));
        controller.close();
      },
    });

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        body: { getReader: () => stream.getReader() },
      })
    );

    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText("Open chat"));

    const input = screen.getByPlaceholderText("Type a question...");
    fireEvent.change(input, { target: { value: "What skills?" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    expect(screen.getByText("What skills?")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Hi")).toBeInTheDocument();
    });
  });

  it("handles 429 rate limit", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 429,
      })
    );

    render(<ChatWidget />);
    fireEvent.click(screen.getByLabelText("Open chat"));

    const input = screen.getByPlaceholderText("Type a question...");
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(screen.getByLabelText("Send message"));

    await waitFor(() => {
      expect(screen.getByText(/too many messages/i)).toBeInTheDocument();
    });
  });
});
