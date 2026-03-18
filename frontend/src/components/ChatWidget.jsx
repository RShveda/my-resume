import { useState, useRef, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^\s;]+)/);
  return match ? match[1] : null;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [labelVisible, setLabelVisible] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me anything about Roman's experience, skills, or background." },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const openedAtRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show label on initial load and periodically
  useEffect(() => {
    if (isOpen) return;

    const show = () => {
      setShowLabel(true);
      setLabelVisible(true);
      setTimeout(() => {
        setLabelVisible(false);
        setTimeout(() => setShowLabel(false), 300);
      }, 3000);
    };

    // Show after 2s on first load
    const initialTimer = setTimeout(show, 2000);
    // Then every 15s
    const interval = setInterval(show, 15000);
    return () => { clearTimeout(initialTimer); clearInterval(interval); };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = Date.now();
      inputRef.current?.focus();
      // Fetch CSRF cookie from Django so POST requests include it
      if (!getCsrfToken()) {
        fetch(`${API_URL}/csrf/`, { credentials: "include" }).catch(() => {});
      }
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsStreaming(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const csrfToken = getCsrfToken();
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRFToken"] = csrfToken;

      const response = await fetch(`${API_URL}/chat/`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          message: text,
          website: "",
          _ts: openedAtRef.current || Date.now(),
        }),
      });

      if (response.status === 429) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "You've sent too many messages. Please try again later.",
          };
          return updated;
        });
        setIsStreaming(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.token) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + data.token,
                };
                return updated;
              });
            }
            if (data.error) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: data.error,
                };
                return updated;
              });
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Floating label */}
        {showLabel && (
          <div
            className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm font-medium px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap pointer-events-none select-none"
            style={{ animation: `${labelVisible ? "chat-label-enter" : "chat-label-exit"} 0.3s ease forwards` }}
          >
            <span className="text-indigo-500 font-semibold">AI</span> &mdash; Ask me about Roman!
          </div>
        )}
        {/* Chat button */}
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI chat"
          className="relative w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105"
          style={{ animation: "chat-glow 3s ease-in-out infinite" }}
        >
          {/* Chat icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {/* AI sparkle badge */}
          <span
            className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-900 ring-2 ring-white dark:ring-gray-900"
            style={{ animation: "sparkle 2s ease-in-out infinite" }}
          >
            ✦
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[28rem] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-xl">
        <span className="text-white font-medium text-sm">✦ AI &mdash; Ask about Roman</span>
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close chat"
          className="text-white/80 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              {msg.content}
              {isStreaming && i === messages.length - 1 && msg.role === "assistant" && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse align-middle" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a question..."
            maxLength={500}
            disabled={isStreaming}
            className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            aria-label="Send message"
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
