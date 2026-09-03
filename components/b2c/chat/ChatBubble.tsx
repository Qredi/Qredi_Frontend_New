import ReactMarkdown from "react-markdown";

interface ChatBubbleProps {
  message: string;
  variant: "assistant" | "user";
}

const MARKDOWN_CLASSES =
  "[&_p]:my-1.5 [&_ul]:my-2 [&_ul]:pl-4 [&_ol]:my-2 [&_ol]:pl-4 [&_li]:my-1 [&_strong]:font-semibold [&_em]:italic [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2.5 [&_h3]:mb-1 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-black/5 [&_pre]:p-3 [&_pre]:text-sm [&_hr]:my-3 [&_hr]:border-border [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted";

export default function ChatBubble({ message, variant }: ChatBubbleProps) {
  const isUser = variant === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-3 text-base leading-relaxed ${
          isUser
            ? "rounded-bl-2xl rounded-br-2xl rounded-tl-2xl bg-green-100 text-green-900"
            : "rounded-br-2xl rounded-bl-2xl rounded-tr-2xl bg-slate-100 text-gray-800"
        }`}
      >
        <div className={MARKDOWN_CLASSES}>
          <ReactMarkdown>{message}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
