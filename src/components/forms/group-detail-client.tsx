"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { GlowCard } from "@/components/glow-card";

type Membership = {
  userId: string;
  role: "owner" | "admin" | "member";
};

type Member = {
  user_id: string;
  username: string;
  display_name: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
};

type Group = {
  id: string;
  name: string;
  description: string;
};

export function GroupDetailClient({
  group,
  members,
  membership,
  currentUserId,
}: {
  group: Group;
  members: Member[];
  membership: Membership;
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { t, roleText } = useI18n();
  const [renameForm, setRenameForm] = useState({
    name: group.name,
    description: group.description,
  });
  const [username, setUsername] = useState("");

  function refreshWithToast(message: string, task: () => Promise<void>) {
    startTransition(async () => {
      try {
        await task();
        toast.success(message);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("requestFailed"));
      }
    });
  }

  return (
    <div className="space-y-6">
      {membership.role === "owner" ? (
        <GlowCard>
          <h3 className="text-lg font-semibold text-white">{t("groupSettings")}</h3>
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              refreshWithToast(t("groupUpdated"), async () => {
                await apiRequest(`/api/groups/${group.id}`, {
                  method: "PATCH",
                  body: JSON.stringify(renameForm),
                });
              });
            }}
          >
            <div>
              <Label htmlFor="renameName">{t("groupName")}</Label>
              <Input
                id="renameName"
                onChange={(event) =>
                  setRenameForm((current) => ({ ...current, name: event.target.value }))
                }
                value={renameForm.name}
              />
            </div>
            <div>
              <Label htmlFor="renameDescription">{t("description")}</Label>
              <Textarea
                id="renameDescription"
                onChange={(event) =>
                  setRenameForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                value={renameForm.description}
              />
            </div>
            <Button disabled={isPending} type="submit" variant="secondary">
              {t("saveGroup")}
            </Button>
          </form>
        </GlowCard>
      ) : null}

      {membership.role !== "member" ? (
        <GlowCard>
          <h3 className="text-lg font-semibold text-white">{t("addMember")}</h3>
          <form
            className="mt-5 flex flex-col gap-4 md:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              refreshWithToast(t("memberAdded"), async () => {
                await apiRequest(`/api/groups/${group.id}/members`, {
                  method: "POST",
                  body: JSON.stringify({ username }),
                });
                setUsername("");
              });
            }}
          >
            <Input
              onChange={(event) => setUsername(event.target.value)}
              placeholder="username"
              value={username}
            />
            <Button disabled={isPending || !username} type="submit">
              {t("addByUsername")}
            </Button>
          </form>
        </GlowCard>
      ) : null}

      <GlowCard>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">{t("membersTitle")}</h3>
          <Button
            disabled={isPending}
            onClick={() =>
              refreshWithToast(t("groupUpdated"), async () => {
                await apiRequest(`/api/groups/${group.id}/members/${currentUserId}`, {
                  method: "DELETE",
                });
                router.push("/groups");
              })
            }
            type="button"
            variant="secondary"
          >
            {t("leaveGroup")}
          </Button>
        </div>
        <div className="mt-5 space-y-3">
          {members.map((member) => (
            <div
              key={member.user_id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-white">{member.display_name}</p>
                  <p className="text-sm text-slate-400">
                    @{member.username} · {roleText(member.role)}
                    {member.user_id === currentUserId ? ` · ${t("you")}` : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  {membership.role === "owner" && member.user_id !== currentUserId ? (
                    <Select
                      defaultValue={member.role}
                      disabled={isPending}
                      onChange={(event) =>
                        refreshWithToast(t("roleUpdated"), async () => {
                          await apiRequest(
                            `/api/groups/${group.id}/members/${member.user_id}`,
                            {
                              method: "PATCH",
                              body: JSON.stringify({ role: event.target.value }),
                            },
                          );
                        })
                      }
                    >
                      <option value="owner">{roleText("owner")}</option>
                      <option value="admin">{roleText("admin")}</option>
                      <option value="member">{roleText("member")}</option>
                    </Select>
                  ) : null}
                  {((membership.role === "owner" && member.user_id !== currentUserId) ||
                    (membership.role === "admin" &&
                      member.user_id !== currentUserId &&
                      member.role !== "owner")) && (
                    <Button
                      disabled={isPending}
                      onClick={() =>
                        refreshWithToast(t("memberRemoved"), async () => {
                          await apiRequest(
                            `/api/groups/${group.id}/members/${member.user_id}`,
                            {
                              method: "DELETE",
                            },
                          );
                        })
                      }
                      type="button"
                      variant="ghost"
                    >
                      {t("remove")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
