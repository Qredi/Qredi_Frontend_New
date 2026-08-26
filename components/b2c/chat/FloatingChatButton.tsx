"use client";

import Link from "next/link";
import { ChatCircleText } from "@phosphor-icons/react";

export default function FloatingChatButton() {
  return (
    <Link
      href="/myqredi/chat" // Arahkan ke rute halaman chatbot Anda
      aria-label="Tanya AI Assistant"
      className="fixed bottom-20 right-4 z-50 flex items-center justify-center w-13 h-13 bg-primary hover:bg-primary-foreground text-white rounded-full shadow-lg transition-all duration-200 active:scale-95 hover:scale-105"
    >
      {/* Icon Chatbot */}
      <ChatCircleText size={26} weight="fill" />
    </Link>
  );
}
