"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CheckCheck, Clock3, PlayCircle } from "lucide-react";
import { toast } from "sonner";

import { SessionTimer } from "@/components/session-timer";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { apiRequest } from "@/lib/api-client";
import { formatDateTime } from "@/lib/dates";
import type { StudySession } from "@/db/schema";

export function GlobalStudyIsland({
  activeSession,
}: {
  activeSession: StudySession | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t } = useI18n();

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-50 lg:inset-x-auto lg:bottom-6 lg:right-6">
      <div
        className={`pointer-events-auto w-full max-w-sm rounded-[1.75rem] border p-4 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl transition ${
          activeSession
            ? "border-emerald-400/20 bg-slate-950/80"
            : "border-cyan-400/15 bg-slate-950/78"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-1 rounded-2xl p-3 ${
              activeSession
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-cyan-500/10 text-cyan-300"
            }`}
          >
            {activeSession ? <Clock3 className="size-5" /> : <PlayCircle className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  activeSession ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
              <p className="text-sm font-medium text-white">
                {activeSession ? t("studyIslandActiveTitle") : t("studyIslandIdleTitle")}
              </p>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {activeSession
                ? `${t("startedAt")} ${formatDateTime(activeSession.checkinAt)}`
                : t("studyIslandIdleHint")}
            </p>
            {activeSession ? (
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">{t("duration")}</p>
                  <p className="text-2xl font-semibold text-white">
                    <SessionTimer checkinAt={activeSession.checkinAt} />
                  </p>
                </div>
                <Button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await apiRequest("/api/study/checkout", { method: "POST" });
                        toast.success(t("checkedOut"));
                        router.refresh();
                      } catch (error) {
                        toast.error(
                          error instanceof Error ? error.message : t("checkoutFailed"),
                        );
                      }
                    })
                  }
                  type="button"
                  variant="danger"
                >
                  <CheckCheck className="mr-2 size-4" />
                  {isPending ? t("checkingOut") : t("checkOut")}
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{t("studyIslandIdleSubtle")}</p>
                <Button
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        await apiRequest("/api/study/checkin", {
                          method: "POST",
                          body: JSON.stringify({ note: "" }),
                        });
                        toast.success(t("checkedIn"));
                        router.refresh();
                      } catch (error) {
                        toast.error(
                          error instanceof Error ? error.message : t("checkinFailed"),
                        );
                      }
                    })
                  }
                  type="button"
                >
                  <PlayCircle className="mr-2 size-4" />
                  {isPending ? t("checkingIn") : t("checkIn")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
