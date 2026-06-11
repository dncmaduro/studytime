import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

export function AppShell({
  user,
  children,
}: {
  user: {
    displayName: string;
    username: string;
  };
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-6 pb-24 lg:pb-0">
        <TopBar user={user} />
        <main className="flex-1">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
