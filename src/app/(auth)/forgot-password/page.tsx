import { AuthShell } from "@/components/forms/auth-shell";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function ForgotPasswordPage() {
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <AuthShell
      description={m.forgotPasswordPageDescription}
      title={m.forgotPasswordPageTitle}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
