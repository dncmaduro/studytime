import { AppShell } from "@/components/app-shell";
import { requirePageUser } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser();
  return (
    <AppShell
      user={{
        displayName: user.displayName,
        username: user.username,
      }}
    >
      {children}
    </AppShell>
  );
}
