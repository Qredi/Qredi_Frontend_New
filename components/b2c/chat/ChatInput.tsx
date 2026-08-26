"use client";

import { PaperPlaneRight } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";

interface ChatInputProps {
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    onSend?.(trimmedMessage);
    setMessage("");
  }

  const isDisabled = disabled || !message.trim();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-border bg-surface p-3"
    >
      <input
        type="text"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Tanyakan sesuatu..."
        disabled={disabled}
        className="
          h-11 flex-1
          rounded-full
          bg-background
          px-4
          text-sm text-foreground
          outline-none
          placeholder:text-muted
    
          disabled:opacity-60
        "
      />

      <button
        type="submit"
        disabled={isDisabled}
        aria-label="Kirim pesan"
        className="
          flex h-11 w-11 shrink-0
          items-center justify-center
          rounded-full
          bg-teal-500
          text-white
          transition-colors duration-200
          hover:bg-primary-dark
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        <PaperPlaneRight size={20} weight="fill" className="-rotate-45" />
      </button>
    </form>
  );
}
