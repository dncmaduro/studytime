import { AuthShell } from "@/components/forms/auth-shell";
import { LoginForm } from "@/components/forms/login-form";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const params = await searchParams;
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <AuthShell
      description={m.loginPageDescription}
      title={m.loginPageTitle}
    >
      <LoginForm redirectTo={params.redirectTo} />
    </AuthShell>
  );
}
