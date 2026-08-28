import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm bg-raised px-2 py-0.5 text-xs font-medium text-muted",
        className,
      )}
      {...props}
    />
  );
}
