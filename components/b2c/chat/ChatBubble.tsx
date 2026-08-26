interface ChatBubbleProps {
  message: string;
  variant: "assistant" | "user";
}

export default function ChatBubble({ message, variant }: ChatBubbleProps) {
  const isUser = variant === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[80%]
          px-4 py-3
          text-base
          leading-relaxed
          ${
            isUser
              ? "rounded-bl-2xl rounded-br-2xl rounded-tl-2xl bg-green-100 text-green-900"
              : "rounded-br-2xl rounded-bl-2xl rounded-tr-2xl bg-slate-100 text-gray-800"
          }
        `}
      >
        {message}
      </div>
    </div>
  );
}
