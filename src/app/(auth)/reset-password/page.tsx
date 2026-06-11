import { AuthShell } from "@/components/forms/auth-shell";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <AuthShell
      description={m.resetPasswordPageDescription}
      title={m.resetPasswordPageTitle}
    >
      <ResetPasswordForm token={params.token} />
    </AuthShell>
  );
}
