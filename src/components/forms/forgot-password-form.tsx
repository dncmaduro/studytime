"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api-client";

type ForgotPasswordResponse = {
  message: string;
  developmentMessage?: string;
  resetUrl?: string;
};

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [result, setResult] = useState<ForgotPasswordResponse | null>(null);
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
          const response = await apiRequest<ForgotPasswordResponse>(
            "/api/auth/forgot-password",
            {
              method: "POST",
              body: JSON.stringify({ identifier }),
            },
          );
          setResult(response);
          toast.success(t("requestProcessed"));
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : t("prepareResetFailed"),
          );
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
          required
          value={identifier}
        />
      </div>
      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? t("preparing") : t("sendResetLink")}
      </Button>
      {result ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p>{result.message}</p>
          {result.developmentMessage ? (
            <div className="mt-3 space-y-2">
              <p className="text-cyan-300">{result.developmentMessage}</p>
              {result.resetUrl ? (
                <a className="break-all text-cyan-200 underline" href={result.resetUrl}>
                  {result.resetUrl}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
