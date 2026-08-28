//#region node_modules/.nitro/vite/services/ssr/assets/format-LmpwlDNB.js
var RUB = new Intl.NumberFormat("ru-RU");
function formatRub(value) {
	if (value == null || !Number.isFinite(value)) return "—";
	return `${RUB.format(Math.round(value))} ₽`;
}
function formatRubCompact(value) {
	if (value == null || !Number.isFinite(value)) return "—";
	const abs = Math.abs(value);
	if (abs >= 1e6) return `${(value / 1e6).toFixed(abs >= 1e7 ? 1 : 2)}M ₽`;
	if (abs >= 1e4) return `${Math.round(value / 1e3)}k ₽`;
	if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}k ₽`;
	return `${RUB.format(Math.round(value))} ₽`;
}
function slotsOf(width, height) {
	return Math.max(1, (width || 1) * (height || 1));
}
function pricePerSlot(price, width, height) {
	if (price == null) return null;
	return Math.round(price / slotsOf(width, height));
}
function formatKg(weight) {
	if (!Number.isFinite(weight)) return "—";
	return `${weight.toFixed(weight >= 10 ? 1 : 2)} kg`;
}
function formatAgo(isoOrMs) {
	if (isoOrMs == null) return "unknown";
	const ms = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
	if (!Number.isFinite(ms)) return "unknown";
	const delta = Date.now() - ms;
	if (delta < 45e3) return "just now";
	const mins = Math.round(delta / 6e4);
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.round(mins / 60);
	if (hours < 36) return `${hours}h ago`;
	return `${Math.round(hours / 24)}d ago`;
}
function iconUrl(id) {
	return `https://assets.tarkov.dev/${id}-icon.webp`;
}
function percentLabel(value) {
	if (value == null || !Number.isFinite(value)) return null;
	const rounded = Math.round(value * 10) / 10;
	return `${rounded > 0 ? "+" : ""}${rounded}%`;
}
function titleFromNormalized(normalized) {
	return normalized.split("-").filter(Boolean).map((part) => {
		if (/^\d/.test(part) || part.length <= 2) return part.toUpperCase();
		return part.charAt(0).toUpperCase() + part.slice(1);
	}).join(" ");
}
function nameFromWiki(wikiLink) {
	if (!wikiLink) return null;
	const idx = wikiLink.indexOf("/wiki/");
	if (idx === -1) return null;
	try {
		return decodeURIComponent(wikiLink.slice(idx + 6).replace(/_/g, " "));
	} catch {
		return wikiLink.slice(idx + 6).replace(/_/g, " ");
	}
}
//#endregion
export { iconUrl as a, pricePerSlot as c, formatRubCompact as i, slotsOf as l, formatKg as n, nameFromWiki as o, formatRub as r, percentLabel as s, formatAgo as t, titleFromNormalized as u };
