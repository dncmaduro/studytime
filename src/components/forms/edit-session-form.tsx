"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { formatDateTimeInput } from "@/lib/dates";
import type { SessionStatus, StudySession } from "@/db/schema";

export function EditSessionForm({ session }: { session: StudySession }) {
  const router = useRouter();
  const [form, setForm] = useState({
    checkinAt: formatDateTimeInput(session.checkinAt),
    checkoutAt: formatDateTimeInput(session.checkoutAt),
    status: session.status,
    note: session.note ?? "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t, statusText } = useI18n();

  const payload = useMemo(
    () => ({
      ...form,
      checkinAt: new Date(form.checkinAt).toISOString(),
      checkoutAt: form.checkoutAt ? new Date(form.checkoutAt).toISOString() : null,
    }),
    [form],
  );

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
          await apiRequest(`/api/study/sessions/${session.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
          toast.success(t("sessionUpdated"));
          router.push("/history");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t("updateFailed"));
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="checkinAt">{t("checkinTimeLabel")}</Label>
          <Input
            id="checkinAt"
            onChange={(event) =>
              setForm((current) => ({ ...current, checkinAt: event.target.value }))
            }
            required
            type="datetime-local"
            value={form.checkinAt}
          />
        </div>
        <div>
          <Label htmlFor="checkoutAt">{t("checkoutTimeLabel")}</Label>
          <Input
            id="checkoutAt"
            onChange={(event) =>
              setForm((current) => ({ ...current, checkoutAt: event.target.value }))
            }
            type="datetime-local"
            value={form.checkoutAt}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="status">{t("status")}</Label>
        <Select
          id="status"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              status: event.target.value as SessionStatus,
            }))
          }
          value={form.status}
        >
          <option value="active">{statusText("active")}</option>
          <option value="completed">{statusText("completed")}</option>
          <option value="auto_closed">{statusText("auto_closed")}</option>
          <option value="cancelled">{statusText("cancelled")}</option>
          <option value="needs_review">{statusText("needs_review")}</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="note">{t("note")}</Label>
        <Textarea
          id="note"
          onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          value={form.note}
        />
      </div>
      <div>
        <Label htmlFor="reason">{t("reasonForEdit")}</Label>
        <Textarea
          id="reason"
          onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))}
          required
          value={form.reason}
        />
      </div>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? t("saving") : t("saveChanges")}
      </Button>
    </form>
  );
}
