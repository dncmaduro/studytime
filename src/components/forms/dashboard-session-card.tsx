"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCheck, PlayCircle } from "lucide-react";
import { toast } from "sonner";

import { GlowCard } from "@/components/glow-card";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionTimer } from "@/components/session-timer";
import { formatDateTime } from "@/lib/dates";
import { apiRequest } from "@/lib/api-client";
import type { StudySession } from "@/db/schema";

export function DashboardSessionCard({
  activeSession,
}: {
  activeSession: StudySession | null;
}) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const { t } = useI18n();

  return (
    <GlowCard className="overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      {activeSession ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">{t("currentSession")}</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                <SessionTimer checkinAt={activeSession.checkinAt} />
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {t("startedAt")} {formatDateTime(activeSession.checkinAt)}
              </p>
            </div>
            <Button
              className="min-w-40"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await apiRequest("/api/study/checkout", { method: "POST" });
                    toast.success(t("checkedOut"));
                    router.refresh();
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : t("checkoutFailed"));
                  }
                })
              }
              size="lg"
              type="button"
              variant="danger"
            >
              <CheckCheck className="mr-2 size-4" />
              {isPending ? t("checkingOut") : t("checkOut")}
            </Button>
          </div>
          {activeSession.note ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {activeSession.note}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-slate-400">{t("readyToFocus")}</p>
            <h3 className="mt-2 text-3xl font-semibold text-white">{t("startNewStudySession")}</h3>
          </div>
          <Input
            onChange={(event) => setNote(event.target.value)}
            placeholder={t("optionalSessionNote")}
            value={note}
          />
          <Button
            className="min-w-40"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await apiRequest("/api/study/checkin", {
                    method: "POST",
                    body: JSON.stringify({ note }),
                  });
                  toast.success(t("checkedIn"));
                  setNote("");
                  router.refresh();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : t("checkinFailed"));
                }
              })
            }
            size="lg"
            type="button"
          >
            <PlayCircle className="mr-2 size-4" />
            {isPending ? t("checkingIn") : t("checkIn")}
          </Button>
        </div>
      )}
    </GlowCard>
  );
}
