"use client";

import { useEffect, useState } from "react";

import { formatDurationShort } from "@/lib/dates";

export function SessionTimer({ checkinAt }: { checkinAt: string | Date }) {
  const startedAt = new Date(checkinAt).getTime();
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 1000);

    return () => window.clearInterval(id);
  }, [startedAt]);

  return <span>{formatDurationShort(elapsed)}</span>;
}
