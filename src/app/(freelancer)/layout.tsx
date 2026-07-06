import Sidebar from "@/components/Sidebar";
import FreelancerHeaderProfile from "@/components/FreelancerHeaderProfile";
import Brand from "@/components/Brand";

export default function FreelancerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role="FREELANCER" />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <Brand href="/dashboard" />
            <span className="text-sm font-semibold text-gray-700">Freelancer Workspace</span>
          </div>
          <FreelancerHeaderProfile />
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
