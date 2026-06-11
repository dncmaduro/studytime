"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    displayName: "",
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
          await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(form),
          });
          toast.success(t("accountCreated"));
          router.push("/dashboard");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t("registrationFailed"));
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="username">{t("username")}</Label>
          <Input
            id="username"
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            required
            value={form.username}
          />
        </div>
        <div>
          <Label htmlFor="displayName">{t("displayName")}</Label>
          <Input
            id="displayName"
            onChange={(event) =>
              setForm((current) => ({ ...current, displayName: event.target.value }))
            }
            required
            value={form.displayName}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          required
          type="email"
          value={form.email}
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="password">{t("password")}</Label>
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
      </div>
      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? t("creating") : t("register")}
      </Button>
      <p className="text-sm text-slate-400">
        {t("alreadyHaveAccount")}{" "}
        <Link className="text-cyan-300 hover:text-cyan-200" href="/login">
          {t("login")}
        </Link>
      </p>
    </form>
  );
}
