"use client";

import { useState } from "react";
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconUrl } from "@/lib/tarkov/format";

export function ItemIcon({
  id,
  name,
  size = "md",
}: {
  id: string;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const dim = size === "lg" ? "size-16" : size === "sm" ? "size-10" : "size-12";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-raised",
        dim,
      )}
      aria-hidden
    >
      {failed ? (
        <Box className="size-5 text-subtle" />
      ) : (
        <img
          src={iconUrl(id)}
          alt={name}
          referrerPolicy="no-referrer"
          className="item-icon size-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
