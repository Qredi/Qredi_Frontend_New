import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Qredi Assistant",
};

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
