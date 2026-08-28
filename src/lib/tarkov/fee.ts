/**
 * BSG flea commission when listing at `listingPrice`.
 * Uses the public tarkov.dev / wiki closed form (Ti = Tr = 0.05).
 */
export function fleaFee(basePrice: number, listingPrice: number, count = 1): number {
  if (basePrice <= 0 || listingPrice <= 0) return 0;
  const vo = basePrice;
  const vr = listingPrice;
  const ti = 0.05;
  const tr = 0.05;
  const p0 = Math.log10(vo / vr);
  const pr = Math.log10(vr / vo);
  const fee =
    vo * ti * Math.pow(4, p0) * Math.pow(vr / vo, p0) * count +
    vr * tr * Math.pow(4, pr) * Math.pow(vr / vo, pr) * count;
  if (!Number.isFinite(fee) || fee < 0) return 0;
  return Math.round(fee);
}

export function netFlea(basePrice: number, listingPrice: number): number {
  return listingPrice - fleaFee(basePrice, listingPrice);
}
