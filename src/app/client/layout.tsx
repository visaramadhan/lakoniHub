import Sidebar from "@/components/Sidebar";
import Brand from "@/components/Brand";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="CLIENT" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Brand href="/client" />
            <span className="text-sm font-semibold text-gray-700">Client Workspace</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">PT Maju Mundur</p>
              <p className="text-xs text-gray-500">Corporate Client</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold">
              MM
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
