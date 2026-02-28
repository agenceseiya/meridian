import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RefreshProvider } from "@/components/refresh/refresh-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RefreshProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-4 bg-[#0a0f1a]">
            {children}
          </main>
        </div>
      </div>
    </RefreshProvider>
  );
}
