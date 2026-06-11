import { getServerLocale } from "@/lib/i18n-server";
import { formatDurationShort, formatHours } from "@/lib/dates";

type MemberRow = {
  user_id: string;
  username: string;
  display_name: string;
  total_seconds: number;
  total_sessions: number;
  average_seconds: number;
  active_session: boolean;
};

export async function MemberStatsTable({ members }: { members: MemberRow[] }) {
  const locale = await getServerLocale();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Thành viên" : "Member"}</th>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Tổng" : "Total"}</th>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Phiên" : "Sessions"}</th>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Trung bình" : "Average"}</th>
              <th className="px-4 py-3 font-medium">{locale === "vi" ? "Trạng thái" : "Status"}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.user_id} className="border-t border-white/5">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{member.display_name}</div>
                  <div className="text-xs text-slate-500">@{member.username}</div>
                </td>
                <td className="px-4 py-3 text-slate-200">{formatHours(member.total_seconds)}</td>
                <td className="px-4 py-3 text-slate-200">{member.total_sessions}</td>
                <td className="px-4 py-3 text-slate-200">
                  {formatDurationShort(member.average_seconds)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      member.active_session
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-white/5 text-slate-400"
                    }`}
                  >
                    {member.active_session
                      ? locale === "vi"
                        ? "Đang học"
                        : "Studying now"
                      : locale === "vi"
                        ? "Ngoại tuyến"
                        : "Offline"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
