import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-md bg-raised px-4 text-base text-fg shadow-[var(--shadow-border)] placeholder:text-subtle",
          "transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      />
    );
  },
);
