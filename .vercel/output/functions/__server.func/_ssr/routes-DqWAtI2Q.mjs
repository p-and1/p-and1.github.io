import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as iconUrl, c as pricePerSlot, i as formatRubCompact, l as slotsOf, n as formatKg, r as formatRub, s as percentLabel, t as formatAgo } from "./format-LmpwlDNB.mjs";
import { a as string, i as object, t as _enum } from "../_libs/zod.mjs";
import { a as RefreshCw, c as Clock, d as Box, i as Search, l as ChevronRight, o as Pin, r as SlidersHorizontal, s as Copy, t as X, u as Check } from "../_libs/lucide-react.mjs";
import { n as Route } from "./router-DRqT8nEJ.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DqWAtI2Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var modeSchema = object({ mode: _enum(["regular", "pve"]).default("regular") });
var itemSchema = object({
	mode: _enum(["regular", "pve"]).default("regular"),
	id: string().min(1)
});
var getCatalog = createServerFn({ method: "GET" }).validator(modeSchema).handler(createSsrRpc("2680f8c3ecdd9057ba466554ea5aaae8231765a236eddb2029a0aa000e59070c"));
var getItemDetail = createServerFn({ method: "GET" }).validator(itemSchema).handler(createSsrRpc("ec207cf9dd6dbc229ee25d1da08b840d4fa81e4e4dd7084712d6251fa01e27a7"));
var ALIASES = {
	gpu: ["graphics card", "graphics"],
	ledx: ["ledx", "transilluminator"],
	btc: ["bitcoin", "physical bitcoin"],
	bitcoin: ["physical bitcoin", "0.2btc"],
	intel: ["intelligence folder", "intelligence"],
	docs: ["documents case", "docs"],
	defib: ["defibrillator"],
	cofdm: ["military cofdm", "wireless signal"],
	virtex: ["virtex"],
	tetriz: ["tetriz"],
	mule: ["m.u.l.e", "mule"],
	sj6: ["sj6"],
	labs: ["terragroup labs access", "labs access"],
	gpuu: ["graphics card"],
	flash: ["military flash drive"],
	ssd: ["ssd drive"],
	rr: ["red rebel"],
	rebel: ["red rebel"],
	moonshine: ["fierce hatchling", "moonshine"],
	lion: ["bronze lion"],
	gpu2: ["graphics card"]
};
function haystack(item) {
	return `${item.shortName} ${item.name}`.toLowerCase();
}
function scoreItem(item, q) {
	if (!q) return 0;
	const short = item.shortName.toLowerCase();
	const name = item.name.toLowerCase();
	if (short === q) return 120;
	if (name === q) return 110;
	if (short.startsWith(q)) return 100;
	if (name.startsWith(q)) return 90;
	if (short.includes(q)) return 80;
	if (name.includes(q)) return 70;
	const tokens = q.split(/\s+/).filter(Boolean);
	if (tokens.length > 1 && tokens.every((t) => haystack(item).includes(t))) return 65;
	if (ALIASES[q]?.some((alias) => haystack(item).includes(alias))) return 85;
	return 0;
}
function searchItems(items, query, sort, typeFilter, limit = 40) {
	const q = query.trim().toLowerCase();
	let pool = items;
	if (typeFilter && typeFilter !== "all") pool = pool.filter((item) => item.types.includes(typeFilter));
	let ranked;
	if (!q) ranked = pool.slice();
	else {
		const aliasNeedles = ALIASES[q] ?? [];
		ranked = pool.map((item) => ({
			item,
			score: scoreItem(item, q)
		})).filter((row) => {
			if (row.score > 0) return true;
			if (aliasNeedles.some((n) => haystack(row.item).includes(n))) return true;
			return false;
		}).sort((a, b) => b.score - a.score).map((row) => row.item);
	}
	if (sort === "cheapest") ranked.sort((a, b) => {
		return (a.lastLowPrice ?? Number.POSITIVE_INFINITY) - (b.lastLowPrice ?? Number.POSITIVE_INFINITY);
	});
	else if (sort === "perSlot") ranked.sort((a, b) => {
		const ap = pricePerSlot(a.lastLowPrice, a.width, a.height) ?? -1;
		return (pricePerSlot(b.lastLowPrice, b.width, b.height) ?? -1) - ap;
	});
	else if (!q) ranked.sort((a, b) => {
		const ap = pricePerSlot(a.lastLowPrice, a.width, a.height) ?? -1;
		return (pricePerSlot(b.lastLowPrice, b.width, b.height) ?? -1) - ap;
	});
	return ranked.slice(0, limit);
}
var TYPE_CHIPS = [
	{
		id: "all",
		label: "All"
	},
	{
		id: "keys",
		label: "Keys"
	},
	{
		id: "barter",
		label: "Barter"
	},
	{
		id: "meds",
		label: "Meds"
	},
	{
		id: "ammo",
		label: "Ammo"
	},
	{
		id: "gun",
		label: "Guns"
	},
	{
		id: "mods",
		label: "Mods"
	},
	{
		id: "provisions",
		label: "Food"
	}
];
var DEFAULT_PIN_IDS = [
	"5c0530ee86f774697952d952",
	"57347ca924597744596b4e71",
	"5c12613b86f7743bbe2c3f76",
	"5c052e6986f7746b207bc3c9",
	"5c05308086f7746b2101e90b",
	"5c12620d86f7743f8b198b72",
	"59faff1d86f7746c51718c9c",
	"5c94bbff86f7747ee735c08f"
];
var useFleaStore = create()(persist((set, get) => ({
	mode: "regular",
	pins: DEFAULT_PIN_IDS,
	recents: [],
	setMode: (mode) => set({ mode }),
	togglePin: (id) => {
		const pins = get().pins;
		set({ pins: pins.includes(id) ? pins.filter((p) => p !== id) : [id, ...pins].slice(0, 16) });
	},
	pushRecent: (id) => {
		set({ recents: [id, ...get().recents.filter((r) => r !== id)].slice(0, 12) });
	}
}), { name: "flea-scan" }));
/**
* BSG flea commission when listing at `listingPrice`.
* Uses the public tarkov.dev / wiki closed form (Ti = Tr = 0.05).
*/
function fleaFee(basePrice, listingPrice, count = 1) {
	if (basePrice <= 0 || listingPrice <= 0) return 0;
	const vo = basePrice;
	const vr = listingPrice;
	const ti = .05;
	const tr = .05;
	const p0 = Math.log10(vo / vr);
	const pr = Math.log10(vr / vo);
	const fee = vo * ti * Math.pow(4, p0) * Math.pow(vr / vo, p0) * count + vr * tr * Math.pow(4, pr) * Math.pow(vr / vo, pr) * count;
	if (!Number.isFinite(fee) || fee < 0) return 0;
	return Math.round(fee);
}
function netFlea(basePrice, listingPrice) {
	return listingPrice - fleaFee(basePrice, listingPrice);
}
function lootVerdict(item) {
	const flea = item.lastLowPrice;
	const trader = item.bestTraderRub;
	const net = flea != null ? netFlea(item.basePrice, flea) : null;
	const pps = pricePerSlot(net ?? flea, item.width, item.height);
	if (item.noFlea) {
		if (trader && trader >= 8e3) return {
			call: "trader",
			label: "Sell to trader",
			detail: "Blocked on flea — vendor is the cash-out."
		};
		return {
			call: "skip",
			label: "Low value",
			detail: "No flea listing and a weak trader offer."
		};
	}
	if (net != null && trader != null && trader > net * 1.05) return {
		call: "trader",
		label: "Trader pays more",
		detail: "After flea fee, the vendor offer wins."
	};
	if (pps != null && pps >= 25e3) return {
		call: "extract",
		label: "Extract this",
		detail: "High roubles per slot — protect it."
	};
	if (pps != null && pps >= 8e3) return {
		call: "take",
		label: "Take if space",
		detail: "Solid per-slot value if the rig has room."
	};
	if (net != null && net >= 15e3) return {
		call: "take",
		label: "Worth grabbing",
		detail: "Not dense, but the cash is real."
	};
	return {
		call: "skip",
		label: "Leave it",
		detail: "Too cheap for the slot unless you need it."
	};
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-medium transition-[opacity,transform,background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-smooth-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			ghost: "bg-transparent text-fg hover:bg-raised",
			outline: "bg-transparent text-fg shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
			subtle: "bg-raised text-fg hover:bg-surface"
		},
		size: {
			default: "h-11 px-4 text-sm",
			sm: "h-9 px-3 text-sm",
			lg: "h-12 px-5 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
var Input = (0, import_react.forwardRef)(function Input({ className, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		ref,
		className: cn("h-12 w-full rounded-md bg-raised px-4 text-base text-fg shadow-[var(--shadow-border)] placeholder:text-subtle", "transition-[box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)]", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
});
function Badge({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-sm bg-raised px-2 py-0.5 text-xs font-medium text-muted", className),
		...props
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-raised", className),
		...props
	});
}
function ItemIcon({ id, name, size = "md" }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-raised", size === "lg" ? "size-16" : size === "sm" ? "size-10" : "size-12"),
		children: [failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Box, { className: "size-5 text-subtle" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: iconUrl(id),
			alt: "",
			className: "item-icon size-full object-contain",
			onError: () => setFailed(true)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: name
		})]
	});
}
function Sparkline({ points }) {
	if (points.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 rounded-md bg-raised" });
	const values = points.map((p) => p.price || p.priceMin);
	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = Math.max(1, max - min);
	const w = 320;
	const h = 64;
	const pad = 4;
	const coords = values.map((value, i) => {
		return `${pad + i / (values.length - 1) * 312},${pad + (1 - (value - min) / span) * 56}`;
	});
	const last = coords[coords.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "h-16 w-full text-primary",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "2",
			strokeLinejoin: "round",
			strokeLinecap: "round",
			points: coords.join(" ")
		}), last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: last.split(",")[0],
			cy: last.split(",")[1],
			r: "3",
			fill: "currentColor"
		}) : null]
	});
}
function FleaApp({ search }) {
	const navigate = useNavigate({ from: "/" });
	const storeMode = useFleaStore((s) => s.mode);
	const setMode = useFleaStore((s) => s.setMode);
	const pins = useFleaStore((s) => s.pins);
	const recents = useFleaStore((s) => s.recents);
	const togglePin = useFleaStore((s) => s.togglePin);
	const pushRecent = useFleaStore((s) => s.pushRecent);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)(search.q ?? "");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)("relevance");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const mode = search.mode ?? (hydrated ? storeMode : "regular");
	const selectedId = search.item;
	(0, import_react.useEffect)(() => setHydrated(true), []);
	(0, import_react.useEffect)(() => {
		if (search.q != null) setQuery(search.q);
	}, [search.q]);
	const catalogQuery = useQuery({
		queryKey: ["catalog", mode],
		queryFn: () => getCatalog({ data: { mode } }),
		refetchInterval: 12e4
	});
	const items = catalogQuery.data?.items ?? [];
	const byId = (0, import_react.useMemo)(() => new Map(items.map((item) => [item.id, item])), [items]);
	const results = (0, import_react.useMemo)(() => searchItems(items, query, sort, typeFilter === "all" ? null : typeFilter), [
		items,
		query,
		sort,
		typeFilter
	]);
	const detailQuery = useQuery({
		queryKey: [
			"item",
			mode,
			selectedId
		],
		queryFn: () => getItemDetail({ data: {
			mode,
			id: selectedId
		} }),
		enabled: Boolean(selectedId),
		refetchInterval: 6e4
	});
	const selected = selectedId ? detailQuery.data ?? byId.get(selectedId) ?? null : null;
	function setSearch(next) {
		navigate({ search: {
			q: next.q || void 0,
			item: next.item || void 0,
			mode: next.mode && next.mode !== "regular" ? next.mode : void 0
		} });
	}
	function selectItem(id) {
		pushRecent(id);
		setSearch({
			q: query,
			item: id,
			mode
		});
	}
	function switchMode(next) {
		setMode(next);
		setSearch({
			q: query,
			item: selectedId,
			mode: next
		});
	}
	async function copyPrice(value) {
		if (value == null) return;
		try {
			await navigator.clipboard.writeText(String(Math.round(value)));
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1200);
		} catch {}
	}
	const pinItems = pins.map((id) => byId.get(id)).filter(Boolean);
	const recentItems = recents.map((id) => byId.get(id)).filter(Boolean);
	const showResults = query.trim().length > 0 || typeFilter !== "all";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pb-16 pt-4 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-xs font-semibold uppercase tracking-[0.18em] text-primary",
						children: "Raid tool"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl",
						children: "Flea Scan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-sm text-sm text-muted",
						children: "Live cheapest flea prices. Search while you loot."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeToggle, {
					mode,
					onChange: switchMode
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 z-20 -mx-4 mt-5 bg-bg/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "relative block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-subtle" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							ref: inputRef,
							value: query,
							onChange: (e) => {
								const value = e.target.value;
								setQuery(value);
								setSearch({
									q: value,
									item: selectedId,
									mode
								});
							},
							placeholder: "GPU, LEDX, factory key…",
							autoCapitalize: "off",
							autoCorrect: "off",
							autoComplete: "off",
							spellCheck: false,
							className: "h-14 pl-11 pr-12 text-lg",
							"aria-label": "Search Tarkov items"
						}),
						query ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-sm text-muted hover:text-fg",
							onClick: () => {
								setQuery("");
								setSearch({
									q: "",
									item: selectedId,
									mode
								});
								inputRef.current?.focus();
							},
							"aria-label": "Clear search",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex gap-2 overflow-x-auto pb-1",
					children: TYPE_CHIPS.map((chip) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTypeFilter(chip.id),
						className: cn("h-9 shrink-0 rounded-full px-3.5 text-sm font-medium transition-colors duration-[var(--motion-quick)]", typeFilter === chip.id ? "bg-primary text-primary-fg" : "bg-raised text-muted hover:text-fg"),
						children: chip.label
					}, chip.id))
				})]
			}),
			catalogQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg bg-surface p-5 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Could not reach flea data."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Check the connection and retry."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-4",
						onClick: () => void catalogQuery.refetch(),
						children: "Retry"
					})
				]
			}) : null,
			catalogQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingState, {}) : null,
			selectedId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemPanel, {
				item: selected,
				loading: detailQuery.isLoading && !selected,
				refreshing: detailQuery.isFetching,
				pinned: pins.includes(selectedId),
				copied,
				onCopy: () => void copyPrice(selected?.lastLowPrice ?? null),
				onPin: () => togglePin(selectedId),
				onClose: () => setSearch({
					q: query,
					item: void 0,
					mode
				}),
				onRefresh: () => void detailQuery.refetch()
			}) : null,
			showResults ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted",
						children: [results.length, " matches"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortToggle, {
						sort,
						onChange: setSort
					})]
				}), results.length === 0 && !catalogQuery.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-lg bg-surface px-4 py-8 text-center text-sm text-muted",
					children: "No items match that search."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: results.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemRow, {
						item,
						active: item.id === selectedId,
						onSelect: () => selectItem(item.id)
					}) }, item.id))
				})]
			}) : !catalogQuery.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-col gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemRail, {
						title: "Raid pins",
						items: pinItems,
						selectedId,
						onSelect: selectItem,
						empty: "Pin high-value loot for one-tap checks in raid."
					}),
					recentItems.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemRail, {
						title: "Recent",
						items: recentItems,
						selectedId,
						onSelect: selectItem
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HotLoot, {
						items,
						selectedId,
						onSelect: selectItem
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 text-center text-xs text-subtle",
				children: "Prices from tarkov.dev flea scans. Not individual listing IDs — the five cheapest observed lows from the latest market snapshots."
			})
		]
	});
}
function ModeToggle({ mode, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex rounded-md bg-raised p-1",
		children: [["regular", "PVP"], ["pve", "PVE"]].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(id),
			className: cn("h-9 min-w-12 rounded-sm px-3 text-sm font-semibold tracking-wide", mode === id ? "bg-primary text-primary-fg" : "text-muted"),
			children: label
		}, id))
	});
}
function SortToggle({ sort, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-1 text-xs text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "size-3.5" }), [
			{
				id: "relevance",
				label: "Match"
			},
			{
				id: "cheapest",
				label: "Cheap"
			},
			{
				id: "perSlot",
				label: "Slot"
			}
		].map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(opt.id),
			className: cn("h-8 rounded-sm px-2 font-medium", sort === opt.id ? "text-fg" : "text-subtle"),
			children: opt.label
		}, opt.id))]
	});
}
function ItemRow({ item, active, onSelect }) {
	const pps = pricePerSlot(item.lastLowPrice, item.width, item.height);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelect,
		className: cn("flex w-full items-center gap-3 rounded-lg bg-surface px-3 py-2.5 text-left shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-[var(--motion-quick)] ease-[var(--ease-smooth-out)]", "hover:shadow-[var(--shadow-border-hover)] active:scale-[0.99]", active && "shadow-[var(--shadow-border-hover)]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
				id: item.id,
				name: item.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-medium text-fg",
						children: item.shortName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-sm tabular-nums text-fg",
						children: formatRubCompact(item.lastLowPrice)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-0.5 flex items-center justify-between gap-2 text-xs text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate",
						children: item.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "shrink-0 tabular-nums",
						children: pps != null ? `${formatRubCompact(pps)}/slot` : `${item.width}×${item.height}`
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-subtle" })
		]
	});
}
function ItemRail({ title, items, selectedId, onSelect, empty }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mb-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted",
		children: title
	}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: empty
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-2 overflow-x-auto pb-1",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onSelect(item.id),
			className: cn("flex w-28 shrink-0 flex-col items-start gap-2 rounded-lg bg-surface p-2.5 text-left shadow-[var(--shadow-border)]", selectedId === item.id && "shadow-[var(--shadow-border-hover)]"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
					id: item.id,
					name: item.name,
					size: "sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-full truncate text-sm font-medium",
					children: item.shortName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs tabular-nums text-muted",
					children: formatRubCompact(item.lastLowPrice)
				})
			]
		}, item.id))
	})] });
}
function HotLoot({ items, selectedId, onSelect }) {
	const hot = (0, import_react.useMemo)(() => {
		return items.filter((item) => !item.noFlea && (item.lastLowPrice ?? 0) > 0 && item.types.includes("barter")).sort((a, b) => {
			const ap = pricePerSlot(a.lastLowPrice, a.width, a.height) ?? 0;
			return (pricePerSlot(b.lastLowPrice, b.width, b.height) ?? 0) - ap;
		}).slice(0, 8);
	}, [items]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mb-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted",
		children: "Dense loot"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col gap-2",
		children: hot.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemRow, {
			item,
			active: item.id === selectedId,
			onSelect: () => onSelect(item.id)
		}) }, item.id))
	})] });
}
function ItemPanel({ item, loading, refreshing, pinned, copied, onCopy, onPin, onClose, onRefresh }) {
	if (loading || !item) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-16" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-4 h-10 w-48" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-24 w-full" })
		]
	});
	const detail = "cheapest" in item ? item : null;
	const cheapest = detail?.cheapest ?? [];
	const pps = pricePerSlot(item.lastLowPrice, item.width, item.height);
	const fee = item.lastLowPrice ? fleaFee(item.basePrice, item.lastLowPrice) : 0;
	const net = item.lastLowPrice ? netFlea(item.basePrice, item.lastLowPrice) : null;
	const verdict = lootVerdict(item);
	const change = percentLabel(item.changeLast48hPercent);
	const listAt = item.lastLowPrice != null ? Math.max(1, item.lastLowPrice - 1) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "mt-2 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] sm:p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, {
					id: item.id,
					name: item.name,
					size: "lg"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl font-semibold leading-tight tracking-tight",
								children: item.shortName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm text-muted",
								children: item.name
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: onRefresh,
									"aria-label": "Refresh prices",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("size-4", refreshing && "animate-spin") })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: onPin,
									"aria-label": pinned ? "Unpin" : "Pin for raid",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: cn("size-4", pinned && "fill-primary text-primary") })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									onClick: onClose,
									"aria-label": "Close item",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [
								item.width,
								"×",
								item.height,
								" · ",
								slotsOf(item.width, item.height),
								" slot",
								slotsOf(item.width, item.height) === 1 ? "" : "s"
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: formatKg(item.weight) }),
							item.noFlea ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "text-drop",
								children: "No flea"
							}) : null,
							item.lastOfferCount != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [item.lastOfferCount, " offers"] }) : null,
							change ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: item.changeLast48hPercent && item.changeLast48hPercent < 0 ? "text-keep" : "text-drop",
								children: ["48h ", change]
							}) : null
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onCopy,
				className: "mt-5 w-full rounded-lg bg-raised px-4 py-4 text-left transition-colors duration-[var(--motion-quick)] hover:bg-bg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Current cheapest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 normal-case tracking-normal",
							children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-keep" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), copied ? "Copied" : "Tap to copy"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-display text-4xl font-semibold tabular-nums leading-none tracking-tight sm:text-5xl",
						children: formatRub(item.lastLowPrice)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-sm tabular-nums text-muted",
						children: [pps != null ? `${formatRub(pps)} per slot` : "No flea scan", item.lastScan ? ` · scanned ${formatAgo(item.lastScan)}` : ""]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("mt-3 rounded-md px-3 py-2 text-sm", verdict.call === "extract" && "bg-raised text-keep", verdict.call === "take" && "bg-raised text-fg", verdict.call === "trader" && "bg-raised text-warn", verdict.call === "skip" && "bg-raised text-muted"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: verdict.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted",
					children: verdict.detail
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-sm font-semibold uppercase tracking-[0.14em] text-muted",
					children: "Top 5 cheapest"
				}), cheapest.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: item.noFlea ? "This item cannot be listed on the flea." : "No recent flea snapshots yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-2 divide-y divide-border",
					children: cheapest.map((offer) => {
						const vsAvg = item.avg24hPrice && offer.price ? Math.round((offer.price - item.avg24hPrice) / item.avg24hPrice * 100) : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-3 py-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-6 font-display text-lg font-semibold tabular-nums text-subtle",
									children: offer.rank
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-base font-medium tabular-nums",
										children: formatRub(offer.price)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "flex items-center gap-2 text-xs text-muted",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-3" }),
											offer.live ? "Live scan" : formatAgo(offer.timestamp),
											offer.offerCount != null ? ` · ${offer.offerCount} offers` : ""
										]
									})]
								}),
								vsAvg != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("text-xs tabular-nums", vsAvg < 0 ? "text-keep" : "text-muted"),
									children: [
										vsAvg > 0 ? "+" : "",
										vsAvg,
										"% vs avg"
									]
								}) : null
							]
						}, `${offer.rank}-${offer.price}-${offer.timestamp}`);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-4 grid grid-cols-2 gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "24h low",
						value: formatRub(item.low24hPrice)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "24h avg",
						value: formatRub(item.avg24hPrice)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "24h high",
						value: formatRub(item.high24hPrice)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "List at",
						value: listAt != null ? formatRub(listAt) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Flea fee",
						value: item.lastLowPrice ? formatRub(fee) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Net flea",
						value: formatRub(net)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: item.bestTraderName ? `Sell ${item.bestTraderName}` : "Best trader",
						value: formatRub(item.bestTraderRub)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Base price",
						value: formatRub(item.basePrice)
					})
				]
			}),
			detail && detail.history.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1 text-xs font-medium uppercase tracking-[0.14em] text-muted",
					children: "48h average"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, { points: detail.history })]
			}) : null
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-raised px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-mono text-sm tabular-nums",
			children: value
		})]
	});
}
function LoadingState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-4 flex flex-col gap-2",
		children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full rounded-lg" }, i))
	});
}
function Home() {
	const search = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FleaApp, { search }) });
}
//#endregion
export { Home as component };
