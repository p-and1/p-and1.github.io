import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { o as nameFromWiki, u as titleFromNormalized } from "./format-LmpwlDNB.mjs";
import { a as string, i as object, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/functions-QTn21H8e.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var TRADER_NAMES = {
	"54cb50c76803fa8b248b4571": "Prapor",
	"54cb57776803fa99248b456e": "Therapist",
	"579dc571d53a0658a154fbec": "Fence",
	"58330581ace78e27b8b10cee": "Skier",
	"5935c25fb3acc3127c3d8cd9": "Peacekeeper",
	"5a7c2eca46aef81a7ca2145d": "Mechanic",
	"5ac3b934156ae10c4430e83c": "Ragman",
	"5c0647fdd443bc2504c2d371": "Jaeger",
	"638f541a29ffd1183d187f57": "Lightkeeper",
	"6617beeaa9cfa777ca915b7c": "Ref"
};
function traderName(id) {
	return TRADER_NAMES[id] ?? "Trader";
}
var JSON_API = "https://json.tarkov.dev";
var NAMES_URL = "https://raw.githubusercontent.com/TarkovTracker/tarkovdata/master/items.en.json";
var CATALOG_TTL_MS = 12e4;
var NAMES_TTL_MS = 432e5;
var catalogCache = /* @__PURE__ */ new Map();
var namesCache = null;
async function fetchJson(url) {
	const res = await fetch(url, { headers: { accept: "application/json" } });
	if (!res.ok) throw new Error(`Tarkov data failed (${res.status})`);
	return await res.json();
}
async function loadNames() {
	const now = Date.now();
	if (namesCache && namesCache.expires > now) return namesCache.value;
	try {
		const raw = await fetchJson(NAMES_URL);
		const map = /* @__PURE__ */ new Map();
		for (const [id, entry] of Object.entries(raw)) map.set(id, entry);
		namesCache = {
			value: map,
			expires: now + NAMES_TTL_MS
		};
		return map;
	} catch {
		return namesCache?.value ?? /* @__PURE__ */ new Map();
	}
}
function resolveName(raw, names) {
	const named = names.get(raw.id);
	const wiki = nameFromWiki(raw.wikiLink);
	const fromNorm = raw.normalizedName ? titleFromNormalized(raw.normalizedName) : null;
	const placeholder = !raw.name || raw.name.endsWith(" Name") || raw.name === raw.id;
	const name = (named?.name || (!placeholder ? raw.name : null) || wiki || fromNorm || raw.id).trim();
	const shortPlaceholder = !raw.shortName || raw.shortName.endsWith(" ShortName") || raw.shortName === raw.id;
	return {
		name,
		shortName: (named?.shortName || (!shortPlaceholder ? raw.shortName : null) || name).trim()
	};
}
function slimItem(raw, names) {
	const { name, shortName } = resolveName(raw, names);
	const types = Array.isArray(raw.types) ? raw.types : [];
	let bestTraderRub = null;
	let bestTraderName = null;
	for (const offer of raw.sellToTrader ?? []) {
		const rub = offer.priceRUB ?? offer.price ?? 0;
		if (rub > (bestTraderRub ?? 0)) {
			bestTraderRub = rub;
			bestTraderName = traderName(offer.trader);
		}
	}
	return {
		id: raw.id,
		name,
		shortName,
		lastLowPrice: raw.lastLowPrice ?? null,
		avg24hPrice: raw.avg24hPrice ?? null,
		low24hPrice: raw.low24hPrice ?? null,
		high24hPrice: raw.high24hPrice ?? null,
		changeLast48hPercent: raw.changeLast48hPercent ?? null,
		lastOfferCount: raw.lastOfferCount ?? null,
		lastScan: raw.lastScan ?? null,
		width: raw.width || 1,
		height: raw.height || 1,
		weight: raw.weight || 0,
		basePrice: raw.basePrice || 0,
		types,
		noFlea: types.includes("noFlea"),
		bestTraderRub,
		bestTraderName
	};
}
async function loadCatalog(mode) {
	const now = Date.now();
	const hit = catalogCache.get(mode);
	if (hit && hit.expires > now) return hit.value;
	const [payload, names] = await Promise.all([fetchJson(`${JSON_API}/${mode}/items`), loadNames()]);
	const items = Object.values(payload.data.items).map((raw) => slimItem(raw, names));
	catalogCache.set(mode, {
		value: items,
		expires: now + CATALOG_TTL_MS
	});
	return items;
}
function cheapestFromHistory(history, livePrice, liveScan, liveOffers) {
	const cutoff = Date.now() - 1296e5;
	const recent = history.filter((h) => h.timestamp >= cutoff && h.priceMin > 0);
	const pool = recent.length ? recent : history.filter((h) => h.priceMin > 0).slice(-24);
	const byPrice = /* @__PURE__ */ new Map();
	for (const point of pool) {
		const existing = byPrice.get(point.priceMin);
		if (!existing || point.timestamp > existing.timestamp) byPrice.set(point.priceMin, point);
	}
	const ranked = [...byPrice.values()].sort((a, b) => a.priceMin - b.priceMin).slice(0, 5);
	const liveTs = liveScan ? Date.parse(liveScan) : Date.now();
	if (livePrice && livePrice > 0) {
		if (!ranked.some((p) => p.priceMin === livePrice)) {
			ranked.unshift({
				priceMin: livePrice,
				price: livePrice,
				offerCount: liveOffers,
				timestamp: Number.isFinite(liveTs) ? liveTs : Date.now()
			});
			ranked.sort((a, b) => a.priceMin - b.priceMin);
			ranked.splice(5);
		}
	}
	return ranked.slice(0, 5).map((point, index) => ({
		rank: index + 1,
		price: point.priceMin,
		timestamp: point.timestamp,
		offerCount: point.offerCount,
		live: livePrice != null && point.priceMin === livePrice
	}));
}
async function loadItemDetail(mode, id) {
	const item = (await loadCatalog(mode)).find((row) => row.id === id);
	if (!item) return null;
	let history = [];
	try {
		const payload = await fetchJson(`${JSON_API}/${mode}/prices/${id}`);
		history = (Array.isArray(payload.data) ? payload.data : []).map((point) => ({
			priceMin: point.priceMin,
			price: point.price,
			offerCount: point.offerCount ?? null,
			timestamp: point.timestamp
		}));
	} catch {
		history = [];
	}
	const windowStart = Date.now() - 1728e5;
	const spark = history.filter((h) => h.timestamp >= windowStart);
	const cheapest = cheapestFromHistory(history, item.lastLowPrice, item.lastScan, item.lastOfferCount);
	return {
		...item,
		cheapest,
		history: spark.length ? spark : history.slice(-24)
	};
}
var modeSchema = object({ mode: _enum(["regular", "pve"]).default("regular") });
var itemSchema = object({
	mode: _enum(["regular", "pve"]).default("regular"),
	id: string().min(1)
});
var getCatalog_createServerFn_handler = createServerRpc({
	id: "2680f8c3ecdd9057ba466554ea5aaae8231765a236eddb2029a0aa000e59070c",
	name: "getCatalog",
	filename: "src/lib/tarkov/functions.ts"
}, (opts) => getCatalog.__executeServer(opts));
var getCatalog = createServerFn({ method: "GET" }).validator(modeSchema).handler(getCatalog_createServerFn_handler, async ({ data }) => {
	const mode = data.mode;
	return {
		items: await loadCatalog(mode),
		fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
		mode
	};
});
var getItemDetail_createServerFn_handler = createServerRpc({
	id: "ec207cf9dd6dbc229ee25d1da08b840d4fa81e4e4dd7084712d6251fa01e27a7",
	name: "getItemDetail",
	filename: "src/lib/tarkov/functions.ts"
}, (opts) => getItemDetail.__executeServer(opts));
var getItemDetail = createServerFn({ method: "GET" }).validator(itemSchema).handler(getItemDetail_createServerFn_handler, async ({ data }) => {
	const detail = await loadItemDetail(data.mode, data.id);
	if (!detail) throw new Error("Item not found");
	return detail;
});
//#endregion
export { getCatalog_createServerFn_handler, getItemDetail_createServerFn_handler };
