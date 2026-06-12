import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/auth";
import { getActiveStudySession } from "@/lib/db/queries";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser();
  const activeSession = await getActiveStudySession(user.id);
  return (
    <AppShell
      activeSession={activeSession}
      user={{
        displayName: user.displayName,
        username: user.username,
      }}
    >
      {children}
    </AppShell>
  );
}
