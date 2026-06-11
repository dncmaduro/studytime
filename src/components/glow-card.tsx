import { cn } from "@/lib/utils";

export function GlowCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("glass-panel glow-border p-6", className)}>{children}</div>;
}
