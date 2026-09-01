export type Decision = "grant" | "fail" | "review";

export type PersonRow = {
  seq: number;
  name: string;
  nid: string;
  mid: string;
  sector: string;
  dept: string;
  notes: string;
  model: string;
  status: string;
  discharge: string;
  theirName: string;
  theirNid: string;
  theirMid: string;
  amount: string;
  decision: Decision;
  reasons: string[];
  checks: Record<CheckId, CheckResult>;
};

export type CheckId =
  | "nameNid"
  | "nameMid"
  | "personStatus"
  | "discharge"
  | "hardCase"
  | "sector"
  | "department";

export type CheckResult = "pass" | "fail" | "review";

export const CHECK_LABELS: { id: CheckId; label: string; hint: string }[] = [
  {
    id: "nameNid",
    label: "الاسم بالرقم القومي",
    hint: "الاسم والرقم القومي يجب أن يطابقا شيت الصرف",
  },
  {
    id: "nameMid",
    label: "الاسم بالرقم العسكري",
    hint: "الاسم والرقم العسكري يجب أن يطابقا شيت الصرف",
  },
  {
    id: "personStatus",
    label: "حالة الفرد",
    hint: "موجود أو مجلس طبي = يستحق · خارج = لا يستحق",
  },
  {
    id: "discharge",
    label: "تاريخ التسريح",
    hint: "يوم 1 من شهر الصرف، أو خلال 3 أشهر من التسريح = لا يستحق",
  },
  {
    id: "hardCase",
    label: "حالات المراجعة",
    hint: "أي التباس يُترك لك ولا يُحذف من التقرير",
  },
  {
    id: "sector",
    label: "القطاع",
    hint: "يجب أن يطابق القطاع قيد المراجعة",
  },
  {
    id: "department",
    label: "الإدارة",
    hint: "يجب أن تكون إدارة حقيقية داخل القطاع",
  },
];

export type CompareInput = {
  yours: Record<string, string>[];
  theirs: Record<string, string>[];
  sectorName: string;
  paymentMonth: string;
};

function asText(v: unknown): string {
  if (v == null) return "";
  const s = String(v).trim();
  if (!s || s.toLowerCase() === "nan" || s.toLowerCase() === "none") return "";
  return s;
}

export function normalizeArabic(text: unknown): string {
  let t = asText(text);
  if (!t) return "";
  t = t.replace(/[\s\-_ـ]/g, "");
  t = t.replace(/[إأآا]/g, "ا");
  t = t.replace(/[يى]/g, "ى");
  t = t.replace(/[هة]/g, "ه");
  if (t.startsWith("ال") && t.length > 2) t = t.slice(2);
  return t;
}

export function normalizeId(val: unknown): string {
  const s = asText(val).replace(/\.0$/, "").replace(/\s/g, "");
  return s.replace(/\D/g, "");
}

export function namesEquivalent(a: unknown, b: unknown): boolean | null {
  const na = normalizeArabic(a);
  const nb = normalizeArabic(b);
  if (!na || !nb) return null;
  if (na === nb) return true;
  return false;
}

export function findCol(
  headers: string[],
  candidates: string[],
): string | null {
  const normed = headers.map((h) => ({ orig: h, n: normalizeArabic(h) }));
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

const NID = ["رقم قومي", "الرقم القومي", "رقم القومي", "قومي", "رقم قومى", "الرقم القومى"];
const MID = ["رقم عسكري", "الرقم العسكري", "رقم العسكري", "عسكري", "رقم عسكرى", "الرقم العسكرى"];
const NAME = ["اسم", "الاسم", "الاسم الكامل", "الأسماء", "أسماء", "اسم الفرد"];
const MODEL = ["حالة النموذج", "نموذج", "حالة نموذج", "حاله النموذج"];
const STATUS = ["حالة الفرد", "حالة فرد", "الفرد", "حاله الفرد"];
const DISC = ["تاريخ التسريح", "التسريح", "تسريح", "تاريخ تسريح"];
const NOTES = ["ملاحظة", "ملاحظات", "ملاحظه"];
const SECTOR = ["القطاع", "قطاع", "اسم القطاع"];
const DEPT = ["الإدارة", "ادارة", "اسم الإدارة", "الادارة", "إدارة"];
const AMOUNT = ["المبلغ", "قيمة الحافز", "الحافز", "مبلغ الحافز", "المبلغ المستحق", "حوافز", "حافز"];

function pick(row: Record<string, string>, col: string | null): string {
  if (!col) return "";
  return asText(row[col]);
}

function parseDate(val: unknown): Date | null {
  const raw = asText(val).split(/[\sT]/)[0];
  if (!raw) return null;
  const tryFmt = (y: number, m: number, d: number) => {
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

function addMonths(d: Date, months: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const last = new Date(x.getFullYear(), x.getMonth() + 1, 0).getDate();
  x.setDate(Math.min(d.getDate(), last));
  return x;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function classifyStatus(raw: string): "allow" | "deny" | "hard" {
  const t = normalizeArabic(raw);
  if (!t) return "hard";
  if (t.includes("مجلسطب") || t.includes("مجلسطىب") || t === "مجلس") return "allow";
  if (t.includes("موجود")) return "allow";
  if (t.includes("خارج")) return "deny";
  return "hard";
}

function paymentRef(paymentMonth: string): Date {
  const s = asText(paymentMonth);
  const m = s.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const y = +m[1];
    const mo = +m[2];
    if (mo >= 1 && mo <= 12) return new Date(y, mo - 1, 1);
  }
  return startOfMonth(new Date());
}

function dischargeCheck(
  discharge: string,
  paymentMonth: string,
): { result: CheckResult; reason: string } {
  if (!asText(discharge)) return { result: "pass", reason: "" };
  const d = parseDate(discharge);
  if (!d) return { result: "review", reason: "تاريخ التسريح غير مقروء" };
  const ref = paymentRef(paymentMonth);
  const windowEnd = addMonths(d, 3);
  const day1 = d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === 1;
  const inWindow = d.getTime() <= ref.getTime() && ref.getTime() <= windowEnd.getTime();
  if (day1) return { result: "fail", reason: "تسريح يوم 1 من شهر الصرف" };
  if (inWindow) return { result: "fail", reason: "تسريح خلال 3 أشهر من شهر الصرف" };
  return { result: "pass", reason: "" };
}

function mapById(rows: Record<string, string>[], col: string | null) {
  const map = new Map<string, Record<string, string>>();
  if (!col) return map;
  for (const row of rows) {
    const key = normalizeId(row[col]);
    if (key && !map.has(key)) map.set(key, row);
  }
  return map;
}

export function compareSheets(input: CompareInput): PersonRow[] {
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
  if (yourSector) {
    for (const r of yours) {
      const v = pick(r, yourSector);
      if (v) {
        autoSector = autoSector || v;
        break;
      }
    }
  }
  const reviewedSector = asText(input.sectorName) || autoSector;

  const out: PersonRow[] = [];
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

    const empty =
      !name && !normalizeId(nid) && !normalizeId(mid) && !sector && !dept && !status;
    if (empty) continue;

    const nidKey = normalizeId(nid);
    const midKey = normalizeId(mid);
    let their = midKey ? byMid.get(midKey) : undefined;
    if (!their && nidKey) their = byNid.get(nidKey);

    const tName = their ? pick(their, theirName) : "";
    const tNid = their ? pick(their, theirNid) : "";
    const tMid = their ? pick(their, theirMid) : "";
    const amount = their ? pick(their, theirAmount) : "";

    const nidMatch = Boolean(nidKey) && nidKey === normalizeId(tNid);
    const midMatch = Boolean(midKey) && midKey === normalizeId(tMid);
    const nameEq = their ? namesEquivalent(name, tName) : false;

    const checks: Record<CheckId, CheckResult> = {
      nameNid: "pass",
      nameMid: "pass",
      personStatus: "pass",
      discharge: "pass",
      hardCase: "pass",
      sector: "pass",
      department: "pass",
    };
    const reasons: string[] = [];
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
    const placeholder = !deptN || ["لاشيء", "بدون", "غيرمحدد", "-"].includes(deptN);
    if (placeholder) {
      checks.department = "fail";
      reasons.push("الإدارة غير محددة");
    } else if (reviewedSector && namesEquivalent(dept, reviewedSector) === true) {
      checks.department = "review";
      markReview();
      reasons.push("الإدارة ليست إدارة حقيقية داخل القطاع");
    }

    const values = Object.values(checks);
    let decision: Decision = "grant";
    if (values.includes("fail")) decision = "fail";
    else if (values.includes("review")) decision = "review";

    if (decision === "grant") {
      for (const k of Object.keys(checks) as CheckId[]) checks[k] = "pass";
    }

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
      checks,
    });
  }

  return out;
}

export function summarize(rows: PersonRow[]) {
  return {
    total: rows.length,
    grant: rows.filter((r) => r.decision === "grant").length,
    fail: rows.filter((r) => r.decision === "fail").length,
    review: rows.filter((r) => r.decision === "review").length,
  };
}
