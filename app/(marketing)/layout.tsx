import Navbar from "@/components/marketing/navigation/Navbar";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>{children}</main>
    </div>
  );
}
