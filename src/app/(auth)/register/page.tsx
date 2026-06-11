import { AuthShell } from "@/components/forms/auth-shell";
import { RegisterForm } from "@/components/forms/register-form";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function RegisterPage() {
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <AuthShell
      description={m.registerPageDescription}
      title={m.registerPageTitle}
    >
      <RegisterForm />
    </AuthShell>
  );
}
