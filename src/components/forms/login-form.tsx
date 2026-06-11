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

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPath = redirectTo?.startsWith("/") ? redirectTo : "/dashboard";
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
          await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ identifier, password }),
          });
          toast.success(t("welcomeBack"));
          router.push(nextPath);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t("loginFailed"));
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div>
        <Label htmlFor="identifier">{t("usernameOrEmail")}</Label>
        <Input
          id="identifier"
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="you@example.com"
          required
          value={identifier}
        />
      </div>
      <div>
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>
      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? t("loggingIn") : t("login")}
      </Button>
      <div className="flex items-center justify-between text-sm text-slate-400">
        <Link className="hover:text-white" href="/register">
          {t("createAccount")}
        </Link>
        <Link className="hover:text-white" href="/forgot-password">
          {t("forgotPassword")}
        </Link>
      </div>
    </form>
  );
}
