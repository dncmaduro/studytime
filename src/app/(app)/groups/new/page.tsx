import { CreateGroupForm } from "@/components/forms/create-group-form";
import { GlowCard } from "@/components/glow-card";
import { getMessages } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";

export default async function NewGroupPage() {
  const locale = await getServerLocale();
  const m = getMessages(locale);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">{m.createGroupTitle}</h1>
        <p className="mt-2 text-slate-400">{m.createGroupDescription}</p>
      </div>
      <GlowCard>
        <CreateGroupForm />
      </GlowCard>
    </div>
  );
}
