import {
  endOfDay,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

export const APP_TIME_ZONE = "Asia/Bangkok";

export type RangePreset = "today" | "7d" | "month" | "custom";

export type ResolvedDateRange = {
  from: Date;
  to: Date;
  preset: RangePreset;
  fromInput: string;
  toInput: string;
};

function parseInputDate(value: string | null | undefined, fallback: Date) {
  if (!value) {
    return fallback;
  }

  return new Date(`${value}T00:00:00+07:00`);
}

export function resolveDateRange(input: {
  preset?: string | null;
  from?: string | null;
  to?: string | null;
}): ResolvedDateRange {
  const now = new Date();
  const preset = (input.preset as RangePreset | undefined) ?? "today";

  if (preset === "7d") {
    const from = startOfDay(subDays(now, 6));
    const to = endOfDay(now);
    return {
      from,
      to,
      preset,
      fromInput: format(from, "yyyy-MM-dd"),
      toInput: format(to, "yyyy-MM-dd"),
    };
  }

  if (preset === "month") {
    const from = startOfMonth(now);
    const to = endOfMonth(now);
    return {
      from,
      to,
      preset,
      fromInput: format(from, "yyyy-MM-dd"),
      toInput: format(to, "yyyy-MM-dd"),
    };
  }

  if (preset === "custom") {
    const from = startOfDay(parseInputDate(input.from, now));
    const to = endOfDay(
      input.to ? new Date(`${input.to}T23:59:59+07:00`) : now,
    );

    return {
      from,
      to,
      preset,
      fromInput: format(from, "yyyy-MM-dd"),
      toInput: format(to, "yyyy-MM-dd"),
    };
  }

  const from = startOfDay(now);
  const to = endOfDay(now);
  return {
    from,
    to,
    preset: "today",
    fromInput: format(from, "yyyy-MM-dd"),
    toInput: format(to, "yyyy-MM-dd"),
  };
}

export function currentWeekRange() {
  const now = new Date();
  return {
    from: startOfWeek(now, { weekStartsOn: 1 }),
    to: endOfDay(now),
  };
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "—";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatDateInput(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "yyyy-MM-dd");
}

export function formatDateTimeInput(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function formatDurationShort(totalSeconds: number | null | undefined) {
  if (!totalSeconds || totalSeconds <= 0) {
    return "0m";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

export function formatHours(totalSeconds: number | null | undefined) {
  const hours = (totalSeconds ?? 0) / 3600;
  return `${hours.toFixed(hours >= 10 ? 1 : 2)}h`;
}
