import RequireAuth from "@/components/providers/RequireAuth";
import Topbar from "@/components/b2c/navigation/Topbar";
import BottomNav from "@/components/b2c/navigation/BottomNav";
import FloatingChatButton from "@/components/b2c/chat/FloatingChatButton";

export default function MyQrediLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth loginPath="/myqredi/login" allow={["umkm"]}>
      <div className="min-h-screen bg-gray-100 text-foreground flex justify-center">
        {/* Container utama dibatasi ukurannya ala mobile screen (max-w-md) */}
        <div className="relative flex w-full max-w-md flex-col min-h-screen bg-surface">
          {/* Topbar Navigation */}
          <Topbar />

          {/* Main Content Area */}
          <main className="flex-1 pb-20 p-4">{children}</main>

          <FloatingChatButton />
          {/* Bottom Navigation */}
          <BottomNav />
        </div>
      </div>
    </RequireAuth>
  );
}
