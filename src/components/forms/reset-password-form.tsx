"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";

export function ResetPasswordForm({ token }: { token?: string }) {
  const router = useRouter();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useI18n();

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        if (isSubmitting) {
          return;
        }

        setIsSubmitting(true);

        try {
          await apiRequest("/api/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ ...form, token }),
          });
          toast.success(t("passwordResetComplete"));
          router.push("/login");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t("resetFailed"));
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div>
        <Label htmlFor="password">{t("newPassword")}</Label>
        <Input
          id="password"
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          required
          type="password"
          value={form.password}
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          onChange={(event) =>
            setForm((current) => ({ ...current, confirmPassword: event.target.value }))
          }
          required
          type="password"
          value={form.confirmPassword}
        />
      </div>
      <Button className="w-full" disabled={isSubmitting || !token} size="lg" type="submit">
        {isSubmitting ? t("updating") : t("resetPassword")}
      </Button>
    </form>
  );
}
