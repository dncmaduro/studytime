import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { GlowCard } from "@/components/glow-card";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function PasswordSettingsPage() {
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{m.passwordSettingsTitle}</h1>
        <p className="mt-2 text-slate-400">{m.passwordSettingsDescription}</p>
      </div>
      <GlowCard>
        <ChangePasswordForm />
      </GlowCard>
    </div>
  );
}
