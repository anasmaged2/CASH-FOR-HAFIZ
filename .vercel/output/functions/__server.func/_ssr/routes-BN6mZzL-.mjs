import { i as __toESM } from "../_runtime.mjs";
import { R as require_react, y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ScanSearch, c as CircleAlert, i as Shield, l as Check, n as Upload, o as FileSpreadsheet, s as Download, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as writeSync, n as readSync, r as utils, t as SSF } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BN6mZzL-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			primary: "bg-accent text-accent-fg hover:opacity-90",
			ghost: "bg-transparent text-fg border border-border hover:bg-surface-2",
			outline: "bg-surface text-fg border border-border hover:border-accent"
		},
		size: {
			md: "h-11 px-5 text-sm rounded-md",
			lg: "h-12 px-6 text-base rounded-md",
			sm: "h-9 px-3 text-sm rounded-sm"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	className: cn(buttonVariants({
		variant,
		size
	}), className),
	...props
}));
Button.displayName = "Button";
var CHECK_LABELS = [
	{
		id: "nameNid",
		label: "الاسم بالرقم القومي",
		hint: "الاسم والرقم القومي يجب أن يطابقا شيت الصرف"
	},
	{
		id: "nameMid",
		label: "الاسم بالرقم العسكري",
		hint: "الاسم والرقم العسكري يجب أن يطابقا شيت الصرف"
	},
	{
		id: "personStatus",
		label: "حالة الفرد",
		hint: "موجود أو مجلس طبي = يستحق · خارج = لا يستحق"
	},
	{
		id: "discharge",
		label: "تاريخ التسريح",
		hint: "يوم 1 من شهر الصرف، أو خلال 3 أشهر من التسريح = لا يستحق"
	},
	{
		id: "hardCase",
		label: "حالات المراجعة",
		hint: "أي التباس يُترك لك ولا يُحذف من التقرير"
	},
	{
		id: "sector",
		label: "القطاع",
		hint: "يجب أن يطابق القطاع قيد المراجعة"
	},
	{
		id: "department",
		label: "الإدارة",
		hint: "يجب أن تكون إدارة حقيقية داخل القطاع"
	}
];
function asText(v) {
	if (v == null) return "";
	const s = String(v).trim();
	if (!s || s.toLowerCase() === "nan" || s.toLowerCase() === "none") return "";
	return s;
}
function normalizeArabic(text) {
	let t = asText(text);
	if (!t) return "";
	t = t.replace(/[\s\-_ـ]/g, "");
	t = t.replace(/[إأآا]/g, "ا");
	t = t.replace(/[يى]/g, "ى");
	t = t.replace(/[هة]/g, "ه");
	if (t.startsWith("ال") && t.length > 2) t = t.slice(2);
	return t;
}
function normalizeId(val) {
	return asText(val).replace(/\.0$/, "").replace(/\s/g, "").replace(/\D/g, "");
}
function namesEquivalent(a, b) {
	const na = normalizeArabic(a);
	const nb = normalizeArabic(b);
	if (!na || !nb) return null;
	if (na === nb) return true;
	return false;
}
function findCol(headers, candidates) {
	const normed = headers.map((h) => ({
		orig: h,
		n: normalizeArabic(h)
	}));
	for (const cand of candidates) {
		const nc = normalizeArabic(cand);
		for (const h of normed) if (h.n === nc) return h.orig;
	}
	for (const cand of candidates) {
		const nc = normalizeArabic(cand);
		if (!nc) continue;
		for (const h of normed) if (h.n.includes(nc)) return h.orig;
	}
	return null;
}
var NID = [
	"رقم قومي",
	"الرقم القومي",
	"رقم القومي",
	"قومي",
	"رقم قومى",
	"الرقم القومى"
];
var MID = [
	"رقم عسكري",
	"الرقم العسكري",
	"رقم العسكري",
	"عسكري",
	"رقم عسكرى",
	"الرقم العسكرى"
];
var NAME = [
	"اسم",
	"الاسم",
	"الاسم الكامل",
	"الأسماء",
	"أسماء",
	"اسم الفرد"
];
var MODEL = [
	"حالة النموذج",
	"نموذج",
	"حالة نموذج",
	"حاله النموذج"
];
var STATUS = [
	"حالة الفرد",
	"حالة فرد",
	"الفرد",
	"حاله الفرد"
];
var DISC = [
	"تاريخ التسريح",
	"التسريح",
	"تسريح",
	"تاريخ تسريح"
];
var NOTES = [
	"ملاحظة",
	"ملاحظات",
	"ملاحظه"
];
var SECTOR = [
	"القطاع",
	"قطاع",
	"اسم القطاع"
];
var DEPT = [
	"الإدارة",
	"ادارة",
	"اسم الإدارة",
	"الادارة",
	"إدارة"
];
var AMOUNT = [
	"المبلغ",
	"قيمة الحافز",
	"الحافز",
	"مبلغ الحافز",
	"المبلغ المستحق",
	"حوافز",
	"حافز"
];
function pick(row, col) {
	if (!col) return "";
	return asText(row[col]);
}
function parseDate(val) {
	const raw = asText(val).split(/[\sT]/)[0];
	if (!raw) return null;
	const tryFmt = (y, m, d) => {
		if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1950 || y > 2100) return null;
		const dt = new Date(y, m - 1, d);
		if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
		return dt;
	};
	let m = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	if (m) return tryFmt(+m[1], +m[2], +m[3]);
	m = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
	if (m) return tryFmt(+m[1], +m[2], +m[3]);
	m = raw.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/);
	if (m) return tryFmt(+m[3], +m[2], +m[1]);
	m = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
	if (m) return tryFmt(+m[3], +m[2], +m[1]);
	return null;
}
function addMonths(d, months) {
	const x = new Date(d.getFullYear(), d.getMonth() + months, 1);
	const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
	x.setDate(Math.min(d.getDate(), last));
	return x;
}
function startOfMonth(d) {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}
function classifyStatus(raw) {
	const t = normalizeArabic(raw);
	if (!t) return "hard";
	if (t.includes("مجلسطب") || t.includes("مجلسطىب") || t === "مجلس") return "allow";
	if (t.includes("موجود")) return "allow";
	if (t.includes("خارج")) return "deny";
	return "hard";
}
function paymentRef(paymentMonth) {
	const m = asText(paymentMonth).match(/^(\d{4})-(\d{2})$/);
	if (m) {
		const y = +m[1];
		const mo = +m[2];
		if (mo >= 1 && mo <= 12) return new Date(y, mo - 1, 1);
	}
	return startOfMonth(/* @__PURE__ */ new Date());
}
function dischargeCheck(discharge, paymentMonth) {
	if (!asText(discharge)) return {
		result: "pass",
		reason: ""
	};
	const d = parseDate(discharge);
	if (!d) return {
		result: "review",
		reason: "تاريخ التسريح غير مقروء"
	};
	const ref = paymentRef(paymentMonth);
	const windowEnd = addMonths(d, 3);
	const day1 = d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === 1;
	const inWindow = d.getTime() <= ref.getTime() && ref.getTime() <= windowEnd.getTime();
	if (day1) return {
		result: "fail",
		reason: "تسريح يوم 1 من شهر الصرف"
	};
	if (inWindow) return {
		result: "fail",
		reason: "تسريح خلال 3 أشهر من شهر الصرف"
	};
	return {
		result: "pass",
		reason: ""
	};
}
function mapById(rows, col) {
	const map = /* @__PURE__ */ new Map();
	if (!col) return map;
	for (const row of rows) {
		const key = normalizeId(row[col]);
		if (key && !map.has(key)) map.set(key, row);
	}
	return map;
}
function compareSheets(input) {
	const yours = Array.isArray(input.yours) ? input.yours : [];
	const theirs = Array.isArray(input.theirs) ? input.theirs : [];
	const yHeaders = yours[0] ? Object.keys(yours[0]) : [];
	const tHeaders = theirs[0] ? Object.keys(theirs[0]) : [];
	const yourNid = findCol(yHeaders, NID);
	const yourMid = findCol(yHeaders, MID);
	const yourName = findCol(yHeaders, NAME);
	const yourModel = findCol(yHeaders, MODEL);
	const yourStatus = findCol(yHeaders, STATUS);
	const yourDisc = findCol(yHeaders, DISC);
	const yourNotes = findCol(yHeaders, NOTES);
	const yourSector = findCol(yHeaders, SECTOR);
	const yourDept = findCol(yHeaders, DEPT);
	const theirNid = findCol(tHeaders, NID);
	const theirMid = findCol(tHeaders, MID);
	const theirName = findCol(tHeaders, NAME);
	const theirAmount = findCol(tHeaders, AMOUNT);
	const byMid = mapById(theirs, theirMid);
	const byNid = mapById(theirs, theirNid);
	let autoSector = asText(input.sectorName);
	if (yourSector) for (const r of yours) {
		const v = pick(r, yourSector);
		if (v) {
			autoSector = autoSector || v;
			break;
		}
	}
	const reviewedSector = asText(input.sectorName) || autoSector;
	const out = [];
	let seq = 1;
	for (const yrow of yours) {
		const name = pick(yrow, yourName);
		const nid = pick(yrow, yourNid);
		const mid = pick(yrow, yourMid);
		const sector = pick(yrow, yourSector);
		const dept = pick(yrow, yourDept);
		const notes = pick(yrow, yourNotes);
		const model = pick(yrow, yourModel);
		const status = pick(yrow, yourStatus);
		const discharge = pick(yrow, yourDisc);
		if (!name && !normalizeId(nid) && !normalizeId(mid) && !sector && !dept && !status) continue;
		const nidKey = normalizeId(nid);
		const midKey = normalizeId(mid);
		let their = midKey ? byMid.get(midKey) : void 0;
		if (!their && nidKey) their = byNid.get(nidKey);
		const tName = their ? pick(their, theirName) : "";
		const tNid = their ? pick(their, theirNid) : "";
		const tMid = their ? pick(their, theirMid) : "";
		const amount = their ? pick(their, theirAmount) : "";
		const nidMatch = Boolean(nidKey) && nidKey === normalizeId(tNid);
		const midMatch = Boolean(midKey) && midKey === normalizeId(tMid);
		const nameEq = their ? namesEquivalent(name, tName) : false;
		const checks = {
			nameNid: "pass",
			nameMid: "pass",
			personStatus: "pass",
			discharge: "pass",
			hardCase: "pass",
			sector: "pass",
			department: "pass"
		};
		const reasons = [];
		const markReview = () => {
			checks.hardCase = "review";
		};
		if (!their) {
			checks.nameNid = "fail";
			checks.nameMid = "fail";
			reasons.push("غير موجود في شيت الصرف");
		} else {
			if (!nidMatch) {
				checks.nameNid = "fail";
				reasons.push("اختلاف الرقم القومي");
			}
			if (!midMatch) {
				checks.nameMid = "fail";
				reasons.push("اختلاف الرقم العسكري");
			}
			if (nameEq === null) {
				if (nidMatch) checks.nameNid = "review";
				if (midMatch) checks.nameMid = "review";
				markReview();
				reasons.push("الاسم ناقص للمقارنة");
			} else if (nameEq === false) {
				if (nidMatch) checks.nameNid = "review";
				else checks.nameNid = checks.nameNid === "fail" ? "fail" : "review";
				if (midMatch) checks.nameMid = "review";
				else checks.nameMid = checks.nameMid === "fail" ? "fail" : "review";
				markReview();
				reasons.push("الاسم غير مطابق مع الرقم");
			}
		}
		const st = classifyStatus(status);
		if (st === "deny") {
			checks.personStatus = "fail";
			reasons.push("حالة الفرد: خارج");
		} else if (st === "hard") {
			checks.personStatus = "review";
			markReview();
			reasons.push("حالة الفرد تحتاج مراجعة");
		}
		const disc = dischargeCheck(discharge, input.paymentMonth);
		checks.discharge = disc.result;
		if (disc.reason) reasons.push(disc.reason);
		if (disc.result === "review") markReview();
		if (!sector) {
			checks.sector = "review";
			markReview();
			reasons.push("القطاع غير مذكور");
		} else if (reviewedSector) {
			const eq = namesEquivalent(sector, reviewedSector);
			if (eq === false) {
				checks.sector = "fail";
				reasons.push("القطاع لا يطابق القطاع قيد المراجعة");
			} else if (eq === null) {
				checks.sector = "review";
				markReview();
				reasons.push("القطاع غير مذكور");
			}
		}
		const deptN = normalizeArabic(dept);
		if (!deptN || [
			"لاشيء",
			"بدون",
			"غيرمحدد",
			"-"
		].includes(deptN)) {
			checks.department = "fail";
			reasons.push("الإدارة غير محددة");
		} else if (reviewedSector && namesEquivalent(dept, reviewedSector) === true) {
			checks.department = "review";
			markReview();
			reasons.push("الإدارة ليست إدارة حقيقية داخل القطاع");
		}
		const values = Object.values(checks);
		let decision = "grant";
		if (values.includes("fail")) decision = "fail";
		else if (values.includes("review")) decision = "review";
		if (decision === "grant") for (const k of Object.keys(checks)) checks[k] = "pass";
		out.push({
			seq: seq++,
			name,
			nid,
			mid,
			sector,
			dept,
			notes,
			model,
			status,
			discharge,
			theirName: their ? tName : "غير موجود",
			theirNid: tNid,
			theirMid: tMid,
			amount,
			decision,
			reasons: decision === "grant" ? [] : reasons,
			checks
		});
	}
	return out;
}
function summarize(rows) {
	return {
		total: rows.length,
		grant: rows.filter((r) => r.decision === "grant").length,
		fail: rows.filter((r) => r.decision === "fail").length,
		review: rows.filter((r) => r.decision === "review").length
	};
}
function cellToString(v) {
	if (v == null || v === "") return "";
	if (v instanceof Date && !Number.isNaN(v.getTime())) return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
	if (typeof v === "number") {
		if (v > 2e4 && v < 9e4) try {
			const parsed = SSF.parse_date_code(v);
			if (parsed && parsed.y > 1950) {
				const m = String(parsed.m).padStart(2, "0");
				const d = String(parsed.d).padStart(2, "0");
				return `${parsed.y}-${m}-${d}`;
			}
		} catch {}
		if (Number.isInteger(v)) return String(v);
		return String(v);
	}
	return String(v).trim();
}
function isArabic(s) {
	return /[\u0600-\u06FF]/.test(s);
}
async function readExcelFile(file) {
	return parseWorkbook(await file.arrayBuffer());
}
function parseWorkbook(buf) {
	const wb = readSync(buf, {
		type: "array",
		cellDates: true,
		raw: true
	});
	const sheetName = wb.SheetNames[0];
	if (!sheetName) return [];
	const sheet = wb.Sheets[sheetName];
	const matrix = utils.sheet_to_json(sheet, {
		header: 1,
		defval: "",
		raw: true,
		blankrows: false
	});
	let headerIdx = 0;
	const limit = Math.min(matrix.length, 25);
	for (let i = 0; i < limit; i++) if ((matrix[i] ?? []).map((c) => cellToString(c)).filter((c) => isArabic(c)).length >= 2) {
		headerIdx = i;
		break;
	}
	const headerRow = (matrix[headerIdx] ?? []).map((c) => cellToString(c));
	const headers = [];
	const seen = /* @__PURE__ */ new Map();
	headerRow.forEach((h, i) => {
		let name = h || `عمود_${i + 1}`;
		const n = (seen.get(name) ?? 0) + 1;
		seen.set(name, n);
		if (n > 1) name = `${name}_${n}`;
		headers.push(name);
	});
	const rows = [];
	for (let r = headerIdx + 1; r < matrix.length; r++) {
		const raw = matrix[r] ?? [];
		const obj = {};
		let any = false;
		headers.forEach((h, i) => {
			const v = cellToString(raw[i]);
			obj[h] = v;
			if (v) any = true;
		});
		if (any) rows.push(obj);
	}
	return rows;
}
function sheetFromRows(rows) {
	const header = [
		"م",
		"الاسم",
		"الرقم القومي",
		"الرقم العسكري",
		"القطاع",
		"الإدارة",
		"حالة الفرد",
		"تاريخ التسريح",
		"الاسم في شيت الصرف",
		"المبلغ",
		"السبب"
	];
	const data = rows.map((r) => [
		r.seq,
		r.name,
		r.nid,
		r.mid,
		r.sector,
		r.dept,
		r.status,
		r.discharge,
		r.theirName,
		r.amount,
		r.reasons.join(" · ") || ""
	]);
	return utils.aoa_to_sheet([header, ...data]);
}
function buildExceptionsWorkbook(rows) {
	const wb = utils.book_new();
	const fails = rows.filter((r) => r.decision === "fail");
	const reviews = rows.filter((r) => r.decision === "review");
	const grants = rows.filter((r) => r.decision === "grant");
	const stats = summarize(rows);
	const summary = utils.aoa_to_sheet([
		["تقرير استثناءات الحافز"],
		["الإجمالي", stats.total],
		["مستحق", stats.grant],
		["غير مستحق", stats.fail],
		["يحتاج مراجعة", stats.review]
	]);
	utils.book_append_sheet(wb, summary, "ملخص");
	utils.book_append_sheet(wb, sheetFromRows(fails), "غير مستحق");
	utils.book_append_sheet(wb, sheetFromRows(reviews), "يحتاج مراجعة");
	utils.book_append_sheet(wb, sheetFromRows(grants), "مستحق");
	return writeSync(wb, {
		type: "array",
		bookType: "xlsx"
	});
}
function downloadWorkbook(buf, filename) {
	const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function buildTemplateWorkbook() {
	const wb = utils.book_new();
	const yours = [
		[
			"الاسم",
			"الرقم القومي",
			"الرقم العسكري",
			"القطاع",
			"الإدارة",
			"حالة الفرد",
			"تاريخ التسريح",
			"ملاحظة"
		],
		[
			"أحمد محمد علي",
			"29001011234567",
			"1234567",
			"قطاع الشرق",
			"إدارة العمليات",
			"موجود",
			"",
			""
		],
		[
			"محمود حسن إبراهيم",
			"29102021234567",
			"2234567",
			"قطاع الشرق",
			"إدارة الإمداد",
			"خارج",
			"",
			""
		],
		[
			"سعيد عبد الرحمن",
			"29203031234567",
			"3234567",
			"قطاع الشرق",
			"إدارة العمليات",
			"مجلس طبي",
			"",
			""
		],
		[
			"خالد يوسف فتحي",
			"29304041234567",
			"4234567",
			"قطاع الشرق",
			"إدارة الأمن",
			"موجود",
			"2026-09-01",
			"تسريح أول الشهر"
		],
		[
			"عمر طارق نبيل",
			"29405051234567",
			"5234567",
			"قطاع الشرق",
			"إدارة العمليات",
			"موجود",
			"2026-07-01",
			"خلال 3 أشهر"
		],
		[
			"ياسر كمال فؤاد",
			"29506061234567",
			"6234567",
			"قطاع الغرب",
			"إدارة الحركة",
			"موجود",
			"",
			"قطاع غلط"
		],
		[
			"حسام عادل شوقي",
			"29607071234567",
			"7234567",
			"قطاع الشرق",
			"",
			"موجود",
			"",
			"بدون إدارة"
		],
		[
			"مصطفى جمال وهبة",
			"29708081234567",
			"8234567",
			"قطاع الشرق",
			"إدارة العمليات",
			"موجود",
			"",
			"اسم مختلف"
		],
		[
			"نادر صلاح عطية",
			"29809091234567",
			"9234567",
			"قطاع الشرق",
			"إدارة العمليات",
			"موجود",
			"",
			"مش في شيت الصرف"
		],
		[
			"إيهاب سامي درويش",
			"29910101234567",
			"10234567",
			"قطاع الشرق",
			"إدارة العمليات",
			"إجازة",
			"",
			"حالة غريبة"
		]
	];
	const theirs = [
		[
			"الاسم",
			"الرقم القومي",
			"الرقم العسكري",
			"المبلغ"
		],
		[
			"أحمد محمد علي",
			"29001011234567",
			"1234567",
			"2500"
		],
		[
			"محمود حسن إبراهيم",
			"29102021234567",
			"2234567",
			"2500"
		],
		[
			"سعيد عبد الرحمن",
			"29203031234567",
			"3234567",
			"2500"
		],
		[
			"خالد يوسف فتحي",
			"29304041234567",
			"4234567",
			"2500"
		],
		[
			"عمر طارق نبيل",
			"29405051234567",
			"5234567",
			"2500"
		],
		[
			"ياسر كمال فؤاد",
			"29506061234567",
			"6234567",
			"2500"
		],
		[
			"حسام عادل شوقي",
			"29607071234567",
			"7234567",
			"2500"
		],
		[
			"مصطفى جمال وهبة خطأ",
			"29708081234567",
			"8234567",
			"2500"
		],
		[
			"إيهاب سامي درويش",
			"29910101234567",
			"10234567",
			"2500"
		]
	];
	utils.book_append_sheet(wb, utils.aoa_to_sheet(yours), "شيتك");
	utils.book_append_sheet(wb, utils.aoa_to_sheet(theirs), "شيت الصرف");
	return writeSync(wb, {
		type: "array",
		bookType: "xlsx"
	});
}
function demoTables() {
	const buf = buildTemplateWorkbook();
	const wb = readSync(buf, { type: "array" });
	const yoursSheet = wb.Sheets["شيتك"];
	const theirsSheet = wb.Sheets["شيت الصرف"];
	return {
		yours: utils.sheet_to_json(yoursSheet, {
			defval: "",
			raw: false
		}),
		theirs: utils.sheet_to_json(theirsSheet, {
			defval: "",
			raw: false
		})
	};
}
function Home() {
	const [sector, setSector] = (0, import_react.useState)("قطاع الشرق");
	const [month, setMonth] = (0, import_react.useState)("2026-09");
	const [yourFile, setYourFile] = (0, import_react.useState)(null);
	const [theirFile, setTheirFile] = (0, import_react.useState)(null);
	const [rows, setRows] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [tab, setTab] = (0, import_react.useState)("fail");
	const stats = (0, import_react.useMemo)(() => rows ? summarize(rows) : null, [rows]);
	const visible = (0, import_react.useMemo)(() => {
		if (!rows) return [];
		return rows.filter((r) => r.decision === tab);
	}, [rows, tab]);
	async function runFromFiles() {
		if (!yourFile || !theirFile) {
			toast.error("ارفع الشيتين أولاً، أو شغّل المثال التجريبي");
			return;
		}
		setBusy(true);
		try {
			const [yours, theirs] = await Promise.all([readExcelFile(yourFile), readExcelFile(theirFile)]);
			if (!yours.length) {
				toast.error("شيتك فاضي أو الأعمدة غير مقروءة");
				return;
			}
			if (!theirs.length) {
				toast.error("شيت الصرف فاضي أو الأعمدة غير مقروءة");
				return;
			}
			const result = compareSheets({
				yours,
				theirs,
				sectorName: sector,
				paymentMonth: month
			});
			setRows(result);
			setTab("fail");
			const s = summarize(result);
			toast.success(`تمت المطابقة · ${s.fail} غير مستحق · ${s.review} للمراجعة`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "تعذر قراءة الملفات");
		} finally {
			setBusy(false);
		}
	}
	function runDemo() {
		setBusy(true);
		try {
			const { yours, theirs } = demoTables();
			const result = compareSheets({
				yours,
				theirs,
				sectorName: sector || "قطاع الشرق",
				paymentMonth: month || "2026-09"
			});
			setYourFile(null);
			setTheirFile(null);
			setRows(result);
			setTab("fail");
			toast.success("تم تشغيل المثال التجريبي");
		} catch {
			toast.error("تعذر تشغيل المثال");
		} finally {
			setBusy(false);
		}
	}
	function downloadReport() {
		if (!rows) return;
		downloadWorkbook(buildExceptionsWorkbook(rows), `استثناءات الحافز ${(sector || "قطاع").replace(/[\\/]/g, "-")} ${month || ""}.xlsx`);
	}
	function downloadTemplate() {
		downloadWorkbook(buildTemplateWorkbook(), "نموذج شيت الحافز.xlsx");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-amber",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
							className: "size-5",
							strokeWidth: 1.75
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium tracking-wide text-amber",
							children: "جهاز مستقبل مصر للتنمية المستدامة"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl",
							children: "مراجعة الحافز"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-xl text-sm text-muted",
							children: "سبع مقارنات فقط. المستحق يمر. أي فشل يُكتب في ملف إكسل مع السبب."
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: downloadTemplate,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-4" }), "نموذج الشيت"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: runDemo,
						disabled: busy,
						children: "تشغيل مثال"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7",
				children: CHECK_LABELS.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "rounded-md border border-border bg-surface px-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-amber",
							children: String(i + 1).padStart(2, "0")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-sm font-semibold leading-snug text-fg",
							children: c.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-snug text-muted",
							children: c.hint
						})
					]
				}, c.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-lg border border-border bg-surface p-4 sm:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "القطاع قيد المراجعة"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: sector,
								onChange: (e) => setSector(e.target.value),
								className: "h-11 rounded-md border border-border bg-bg px-3 text-fg outline-none focus:ring-2 focus:ring-ring",
								placeholder: "مثال: قطاع الشرق"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted",
								children: "شهر الصرف"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "month",
								value: month,
								onChange: (e) => setMonth(e.target.value),
								className: "h-11 rounded-md border border-border bg-bg px-3 text-fg outline-none focus:ring-2 focus:ring-ring"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropZone, {
							title: "شيتك",
							hint: "الاسم، القومي، العسكري، القطاع، الإدارة، حالة الفرد، التسريح",
							file: yourFile,
							onFile: setYourFile
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropZone, {
							title: "شيت الصرف",
							hint: "الاسم، القومي، العسكري، المبلغ",
							file: theirFile,
							onFile: setTheirFile
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-2 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "flex-1",
							size: "lg",
							onClick: runFromFiles,
							disabled: busy,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScanSearch, { className: "size-4" }), busy ? "جاري المطابقة…" : "ابدأ المقارنة"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "lg",
							onClick: downloadReport,
							disabled: !rows,
							className: "sm:min-w-52",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "تحميل الاستثناءات"]
						})]
					})
				]
			}),
			stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "الإجمالي",
								value: stats.total
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "مستحق",
								value: stats.grant,
								tone: "ok"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "غير مستحق",
								value: stats.fail,
								tone: "danger"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "يحتاج مراجعة",
								value: stats.review,
								tone: "warn"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1 rounded-md border border-border bg-surface p-1",
						children: [
							[
								"fail",
								"غير مستحق",
								stats.fail
							],
							[
								"review",
								"يحتاج مراجعة",
								stats.review
							],
							[
								"grant",
								"مستحق",
								stats.grant
							]
						].map(([id, label, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setTab(id),
							className: cn("h-11 flex-1 rounded-sm text-sm font-medium transition-colors duration-150", tab === id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg"),
							children: [
								label,
								" (",
								n,
								")"
							]
						}, id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsTable, { rows: visible })
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pb-8 text-center text-sm text-muted",
				children: "ارفع الشيتين أو شغّل المثال لتشوف النتيجة هنا. ملف التحميل فيه شيت «غير مستحق» و«يحتاج مراجعة» مع عمود السبب."
			})
		]
	});
}
function Stat({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-md border border-border bg-surface px-4 py-3", tone === "ok" && "bg-ok-bg", tone === "danger" && "bg-danger-bg", tone === "warn" && "bg-warn-bg"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display mt-1 text-2xl font-semibold tabular-nums",
			children: value
		})]
	});
}
function DropZone({ title, hint, file, onFile }) {
	const inputRef = (0, import_react.useRef)(null);
	const [over, setOver] = (0, import_react.useState)(false);
	function take(list) {
		const f = list?.[0];
		if (!f) return;
		if (!/\.xlsx?$/i.test(f.name)) {
			toast.error("الملف لازم يكون Excel");
			return;
		}
		onFile(f);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => inputRef.current?.click(),
		onDragOver: (e) => {
			e.preventDefault();
			setOver(true);
		},
		onDragLeave: () => setOver(false),
		onDrop: (e) => {
			e.preventDefault();
			setOver(false);
			take(e.dataTransfer.files);
		},
		className: cn("flex min-h-36 flex-col items-start gap-2 rounded-md border border-dashed border-border bg-bg p-4 text-start transition-colors duration-150", over && "border-accent bg-surface-2", file && "border-solid border-amber/40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept: ".xlsx,.xls",
				className: "hidden",
				onChange: (e) => take(e.target.files)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex size-9 items-center justify-center rounded-sm bg-surface-2 text-amber",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: file ? file.name : hint
			})
		]
	});
}
function ResultsTable({ rows }) {
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-md border border-border bg-surface px-4 py-10 text-center text-sm text-muted",
		children: "لا توجد أسماء في هذا التبويب"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "overflow-x-auto rounded-md border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "w-full min-w-[720px] text-right text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
				className: "bg-surface-2 text-xs text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-3 font-medium",
						children: "م"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-3 font-medium",
						children: "الاسم"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-3 font-medium",
						children: "السبع فحوصات"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "px-3 py-3 font-medium",
						children: "السبب"
					})
				] })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
				className: "border-t border-border bg-surface",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-3 tabular-nums text-muted",
						children: r.seq
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
						className: "px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: r.name || "—"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-0.5 text-xs text-muted",
							children: [
								r.nid || "بدون قومي",
								" · ",
								r.mid || "بدون عسكري"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: CHECK_LABELS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckChip, {
								label: c.label,
								result: r.checks[c.id]
							}, c.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "px-3 py-3 text-xs text-muted",
						children: r.reasons.join(" · ") || "مطابق ومستحق"
					})
				]
			}, r.seq)) })]
		})
	});
}
function CheckChip({ label, result }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		title: label,
		className: cn("inline-flex items-center gap-1 rounded-sm px-1.5 py-1 text-[11px]", result === "pass" && "bg-ok-bg text-ok", result === "fail" && "bg-danger-bg text-danger", result === "review" && "bg-warn-bg text-warn"),
		children: [result === "pass" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3" }) : result === "fail" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3" }), label]
	});
}
//#endregion
export { Home as component };
