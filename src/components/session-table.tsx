import Link from "next/link";

import { statusLabel } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n-server";
import { formatDateTime, formatDurationShort } from "@/lib/dates";
import type { StudySession } from "@/db/schema";

export async function SessionTable({
  sessions,
  showEdit = false,
}: {
  sessions: StudySession[];
  showEdit?: boolean;
}) {
  const locale = await getServerLocale();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Check in" : "Check in"}</th>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Check out" : "Check out"}</th>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Thời lượng" : "Duration"}</th>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Trạng thái" : "Status"}</th>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Ghi chú" : "Note"}</th>
              {showEdit ? <th className="px-4 py-3 font-medium">{locale === "vi" ? "Thao tác" : "Action"}</th> : null}
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t border-white/5 text-slate-200">
                <td className="px-4 py-3">{formatDateTime(session.checkinAt)}</td>
                <td className="px-4 py-3">{formatDateTime(session.checkoutAt)}</td>
                <td className="px-4 py-3">{formatDurationShort(session.durationSeconds)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                    {statusLabel(locale, session.status)}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-3 text-slate-400">
                  {session.note || "—"}
                </td>
                {showEdit ? (
                  <td className="px-4 py-3">
                    {session.status === "completed" ? (
                      <Link
                        className="text-cyan-300 transition hover:text-cyan-200"
                        href={`/sessions/${session.id}/edit`}
                      >
                        {locale === "vi" ? "Sửa" : "Edit"}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
