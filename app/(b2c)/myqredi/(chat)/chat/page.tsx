"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import ChatBubble from "@/components/b2c/chat/ChatBubble";
import ChatInput from "@/components/b2c/chat/ChatInput";
import { chatHistory, type Message } from "@/lib/chat-history";

const HISTORY_MAX_TURNS = 10;

export default function ChatbotPage() {
  const { user } = useAuth();
  const messages = useSyncExternalStore(
    chatHistory.subscribe,
    chatHistory.getSnapshot,
    chatHistory.getServerSnapshot,
  );
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages, loading]);

  async function handleSend(message: string) {
    const userMessage: Message = { role: "user", content: message };
    const nextMessages = [...messages, userMessage];
    chatHistory.setMessages(nextMessages);
    setLoading(true);

    const history = nextMessages.slice(-HISTORY_MAX_TURNS);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: message, history, userId: user?.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Request failed (${res.status})`);
      }

      const data = (await res.json()) as { answer: string };
      chatHistory.setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Unknown error";
      chatHistory.setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Maaf, terjadi kesalahan saat menghubungi asisten. (${detail})`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-surface">
        {/* Header */}
        <header
          className="
            sticky top-0 z-30
            flex h-16 shrink-0
            items-center gap-3
            border-b border-border
            bg-surface
            px-4
          "
        >
          <Link
            href="/myqredi/score"
            aria-label="Kembali"
            className="
              flex h-10 w-10
              items-center justify-center
              text-muted
              transition-colors duration-200
              hover:text-foreground
            "
          >
            <ArrowLeft size={20} weight="bold" />
          </Link>

          {/* Title */}
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Asisten Qredibot
            </h1>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

              <span className="text-xs font-medium text-green-600">Online</span>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 space-y-4 bg-background p-4">
          {messages.map((m, i) => (
            <ChatBubble key={i} variant={m.role} message={m.content} />
          ))}

          {loading && <ChatBubble variant="assistant" message="..." />}

          <div ref={bottomRef} />
        </main>

        {/* Input */}
        <div className="sticky bottom-0 z-30 bg-surface">
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>
      </div>
    </div>
  );
}
