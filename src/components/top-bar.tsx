"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { apiRequest } from "@/lib/api-client";

export function TopBar({
  user,
}: {
  user: {
    displayName: string;
    username: string;
  };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useI18n();

  return (
    <div className="glass-panel flex items-center justify-between gap-4 rounded-3xl border border-white/10 p-4">
      <div>
        <h2 className="mt-2 text-lg font-semibold text-white">{user.displayName}</h2>
        <p className="text-sm text-slate-400">@{user.username}</p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        <LanguageSwitcher />
        <Button
          disabled={isSubmitting}
          onClick={async () => {
            if (isSubmitting) {
              return;
            }

            setIsSubmitting(true);

            try {
              await apiRequest("/api/auth/logout", { method: "POST" });
              router.push("/login");
            } catch (error) {
              toast.error(error instanceof Error ? error.message : t("requestFailed"));
            } finally {
              setIsSubmitting(false);
            }
          }}
          type="button"
          variant="secondary"
        >
          <LogOut className="mr-2 size-4" />
          {t("signOut")}
        </Button>
      </div>
    </div>
  );
}
