import type { CatalogItem } from "./types";
import { netFlea } from "./fee";
import { pricePerSlot } from "./format";

export type LootCall = "extract" | "take" | "trader" | "skip";

export type Verdict = {
  call: LootCall;
  label: string;
  detail: string;
};

export function lootVerdict(item: CatalogItem): Verdict {
  const flea = item.lastLowPrice;
  const trader = item.bestTraderRub;
  const net = flea != null ? netFlea(item.basePrice, flea) : null;
  const pps = pricePerSlot(net ?? flea, item.width, item.height);

  if (item.noFlea) {
    if (trader && trader >= 8000) {
      return {
        call: "trader",
        label: "Sell to trader",
        detail: "Blocked on flea — vendor is the cash-out.",
      };
    }
    return {
      call: "skip",
      label: "Low value",
      detail: "No flea listing and a weak trader offer.",
    };
  }

  if (net != null && trader != null && trader > net * 1.05) {
    return {
      call: "trader",
      label: "Trader pays more",
      detail: "After flea fee, the vendor offer wins.",
    };
  }

  if (pps != null && pps >= 25000) {
    return {
      call: "extract",
      label: "Extract this",
      detail: "High roubles per slot — protect it.",
    };
  }

  if (pps != null && pps >= 8000) {
    return {
      call: "take",
      label: "Take if space",
      detail: "Solid per-slot value if the rig has room.",
    };
  }

  if (net != null && net >= 15000) {
    return {
      call: "take",
      label: "Worth grabbing",
      detail: "Not dense, but the cash is real.",
    };
  }

  return {
    call: "skip",
    label: "Leave it",
    detail: "Too cheap for the slot unless you need it.",
  };
}
