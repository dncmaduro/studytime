"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";

export function CreateGroupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "" });
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
          const response = await apiRequest<{ group: { id: string } }>("/api/groups", {
            method: "POST",
            body: JSON.stringify(form),
          });
          toast.success(t("groupCreated"));
          router.push(`/groups/${response.group.id}`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t("creationFailed"));
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div>
        <Label htmlFor="groupName">{t("groupName")}</Label>
        <Input
          id="groupName"
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
          value={form.name}
        />
      </div>
      <div>
        <Label htmlFor="groupDescription">{t("description")}</Label>
        <Textarea
          id="groupDescription"
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          value={form.description}
        />
      </div>
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? t("creating") : t("createGroup")}
      </Button>
    </form>
  );
}
