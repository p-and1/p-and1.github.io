import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { loadCatalog, loadItemDetail } from "./api.server";
import type { GameMode } from "./types";

const modeSchema = z.object({
  mode: z.enum(["regular", "pve"]).default("regular"),
});

const itemSchema = z.object({
  mode: z.enum(["regular", "pve"]).default("regular"),
  id: z.string().min(1),
});

export const getCatalog = createServerFn({ method: "GET" })
  .validator(modeSchema)
  .handler(async ({ data }) => {
    const mode = data.mode as GameMode;
    const items = await loadCatalog(mode);
    return {
      items,
      fetchedAt: new Date().toISOString(),
      mode,
    };
  });

export const getItemDetail = createServerFn({ method: "GET" })
  .validator(itemSchema)
  .handler(async ({ data }) => {
    const detail = await loadItemDetail(data.mode as GameMode, data.id);
    if (!detail) {
      throw new Error("Item not found");
    }
    return detail;
  });
