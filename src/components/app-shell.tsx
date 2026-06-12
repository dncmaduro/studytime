import { GlobalStudyIsland } from "@/components/global-study-island";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import type { StudySession } from "@/db/schema";

export function AppShell({
  user,
  activeSession,
  children,
}: {
  user: {
    displayName: string;
    username: string;
  };
  activeSession: StudySession | null;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 lg:px-6 lg:py-6">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-6 pb-44 lg:pb-0">
        <TopBar user={user} />
        <main className="flex-1">{children}</main>
      </div>
      <GlobalStudyIsland activeSession={activeSession} />
      <MobileNav />
    </div>
  );
}
