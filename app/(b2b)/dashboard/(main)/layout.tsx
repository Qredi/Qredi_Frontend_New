import Sidebar from "@/components/b2b/navigation/Sidebar";
import Topbar from "@/components/b2b/navigation/Topbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Topbar */}
      <Topbar />

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 pt-16">{children}</main>
    </div>
  );
}
