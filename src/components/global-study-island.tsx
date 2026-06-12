"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { SessionTimer } from "@/components/session-timer";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { apiRequest } from "@/lib/api-client";
import { APP_TIME_ZONE, formatDurationShort } from "@/lib/dates";
import type { StudySession } from "@/db/schema";

const REMINDER_INTERVAL_MS = 30 * 60 * 1000;

let reminderAudioContext: AudioContext | null = null;

function getReminderStorageKey(sessionId: string) {
  return `study-reminder:${sessionId}`;
}

function primeReminderAudio() {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") {
    return null;
  }

  reminderAudioContext ??= new window.AudioContext();

  if (reminderAudioContext.state === "suspended") {
    void reminderAudioContext.resume().catch(() => undefined);
  }

  return reminderAudioContext;
}

function playReminderTone() {
  const audioContext = primeReminderAudio();

  if (!audioContext) {
    return;
  }

  const notes = [
    { delay: 0, frequency: 880, duration: 0.18 },
    { delay: 0.16, frequency: 1174, duration: 0.22 },
    { delay: 0.38, frequency: 1567, duration: 0.28 },
  ];

  const startTime = audioContext.currentTime + 0.02;

  for (const note of notes) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const noteStart = startTime + note.delay;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(note.frequency, noteStart);

    gainNode.gain.setValueAtTime(0.0001, noteStart);
    gainNode.gain.exponentialRampToValueAtTime(0.14, noteStart + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + note.duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(noteStart);
    oscillator.stop(noteStart + note.duration + 0.02);
  }
}

function CurrentTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  return (
    <span>
      {new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: APP_TIME_ZONE,
      }).format(now)}
    </span>
  );
}

export function GlobalStudyIsland({
  activeSession,
}: {
  activeSession: StudySession | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t } = useI18n();

  useEffect(() => {
    if (!activeSession || typeof window === "undefined") {
      return;
    }

    const startedAt = new Date(activeSession.checkinAt).getTime();
    const storageKey = getReminderStorageKey(activeSession.id);
    let timeoutId: number | undefined;

    const getLastNotifiedBlock = () => {
      const rawValue = window.sessionStorage.getItem(storageKey);
      const parsed = rawValue ? Number(rawValue) : 0;
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const notifyReminder = (block: number) => {
      if (block <= 0) {
        return;
      }

      const lastNotifiedBlock = getLastNotifiedBlock();

      if (block <= lastNotifiedBlock) {
        return;
      }

      window.sessionStorage.setItem(storageKey, String(block));
      playReminderTone();
      toast(t("studyReminderTitle"), {
        description: `${t("studyReminderDescription")} ${formatDurationShort(
          block * (REMINDER_INTERVAL_MS / 1000),
        )}.`,
      });
    };

    const scheduleNextReminder = () => {
      const elapsedMs = Date.now() - startedAt;
      const completedBlocks = Math.floor(elapsedMs / REMINDER_INTERVAL_MS);

      notifyReminder(completedBlocks);

      const nextBlock = completedBlocks + 1;
      const nextReminderAt = startedAt + nextBlock * REMINDER_INTERVAL_MS;
      const delay = Math.max(0, nextReminderAt - Date.now());

      timeoutId = window.setTimeout(() => {
        notifyReminder(nextBlock);
        scheduleNextReminder();
      }, delay);
    };

    scheduleNextReminder();

    return () => {
      if (typeof timeoutId !== "undefined") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [activeSession, t]);

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-24 z-50 lg:inset-x-auto lg:bottom-6 lg:right-6">
      <div
        className={`pointer-events-auto w-full max-w-xs rounded-[1.5rem] border p-4 shadow-[0_24px_80px_rgba(2,6,23,0.55)] backdrop-blur-2xl transition ${
          activeSession
            ? "border-emerald-400/20 bg-slate-950/85"
            : "border-white/10 bg-slate-950/82"
        }`}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-center">
            <p className="text-3xl font-semibold tabular-nums text-white">
              {activeSession ? <SessionTimer checkinAt={activeSession.checkinAt} /> : <CurrentTime />}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              disabled={Boolean(activeSession) || isPending}
              onPointerDown={primeReminderAudio}
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
                    toast.error(error instanceof Error ? error.message : t("checkinFailed"));
                  }
                })
              }
              type="button"
              variant={activeSession ? "secondary" : "primary"}
            >
              {isPending && !activeSession ? t("checkingIn") : t("checkIn")}
            </Button>
            <Button
              disabled={!activeSession || isPending}
              onPointerDown={primeReminderAudio}
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
              type="button"
              variant={activeSession ? "danger" : "secondary"}
            >
              {isPending && activeSession ? t("checkingOut") : t("checkOut")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
