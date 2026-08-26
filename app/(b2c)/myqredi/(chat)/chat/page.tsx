"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import ChatBubble from "@/components/b2c/chat/ChatBubble";
import ChatInput from "@/components/b2c/chat/ChatInput";

interface Message {
  role: "assistant" | "user";
  content: string;
}

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Halo! Saya Qredibot. Saya siap membantu Anda memahami skor dan profil kredit usaha Anda.",
  },
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function handleSend(message: string) {
    const userMessage: Message = {
      role: "user",
      content: message,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setLoading(true);

    // Mock response sementara.
    // Nantinya bisa diganti dengan API /api/chat.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Berdasarkan informasi yang tersedia, konsistensi transaksi dan stabilitas aktivitas usaha merupakan faktor penting dalam profil kredit Anda.",
        },
      ]);

      setLoading(false);
    }, 800);
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
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              variant={message.role}
              message={message.content}
            />
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
