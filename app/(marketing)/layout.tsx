import Navbar from "@/components/marketing/navigation/Navbar";
import Footer from "@/components/marketing/navigation/Footer";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
