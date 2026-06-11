"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";

export function ChangePasswordForm() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
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
          await apiRequest("/api/auth/change-password", {
            method: "POST",
            body: JSON.stringify(form),
          });
          toast.success(t("passwordChanged"));
          setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t("updateFailed"));
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div>
        <Label htmlFor="oldPassword">{t("oldPassword")}</Label>
        <Input
          id="oldPassword"
          onChange={(event) =>
            setForm((current) => ({ ...current, oldPassword: event.target.value }))
          }
          required
          type="password"
          value={form.oldPassword}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="newPassword">{t("newPassword")}</Label>
          <Input
            id="newPassword"
            onChange={(event) =>
              setForm((current) => ({ ...current, newPassword: event.target.value }))
            }
            required
            type="password"
            value={form.newPassword}
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
      </div>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? t("saving") : t("updatePassword")}
      </Button>
    </form>
  );
}
