import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-12 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-sm text-slate-100 outline-none focus:border-cyan-400/50",
      className,
    )}
    {...props}
  />
));

Select.displayName = "Select";
