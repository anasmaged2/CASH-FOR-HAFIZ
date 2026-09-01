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
    hint: "نفس الصف: الاسم والرقم القومي في شيتك = شيت الصرف",
  },
  {
    id: "nameMid",
    label: "الاسم بالرقم العسكري",
    hint: "نفس الصف: الاسم والرقم العسكري في شيتك = شيت الصرف",
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
    hint: "أي التباس يُترك لك. الفرد في مكانه فقط إذا الفحوصات السبعة سليمة",
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
  const normed = headers.map((h) => ({
    orig: h,
    n: normalizeArabic(h.replace(/\n/g, " ")),
  }));
  for (const cand of candidates) {
    const nc = normalizeArabic(cand);
    for (const h of normed) if (h.n === nc) return h.orig;
  }
  for (const cand of candidates) {
    const nc = normalizeArabic(cand);
    if (nc.length < 4) continue;
    for (const h of normed) if (h.n.includes(nc) || nc.includes(h.n) && h.n.length >= 4) {
      return h.orig;
    }
  }
  return null;
}

export const NID = [
  "رقم قومي",
  "الرقم القومي",
  "رقم القومي",
  "قومي",
  "رقم قومى",
  "الرقم القومى",
  "NID",
  "national id",
  "الرقم المدنى",
];
export const MID = [
  "رقم عسكري",
  "الرقم العسكري",
  "رقم العسكري",
  "عسكري",
  "رقم عسكرى",
  "الرقم العسكرى",
  "MID",
  "military id",
];
export const NAME = [
  "اسم",
  "الاسم",
  "الاسم الكامل",
  "الاسم الرباعي",
  "الأسماء",
  "أسماء",
  "اسم الفرد",
  "اسم الجندي",
  "name",
];
export const MODEL = ["حالة النموذج", "نموذج", "حالة نموذج", "حاله النموذج"];
export const STATUS = ["حالة الفرد", "حالة فرد", "حاله الفرد", "وضع الفرد"];
export const DISC = ["تاريخ التسريح", "التسريح", "تسريح", "تاريخ تسريح", "موعد التسريح"];
export const NOTES = ["ملاحظة", "ملاحظات", "ملاحظه"];
export const SECTOR = ["القطاع", "قطاع", "اسم القطاع"];
export const DEPT = ["الإدارة", "ادارة", "اسم الإدارة", "الادارة", "إدارة"];
export const AMOUNT = ["المبلغ", "قيمة الحافز", "الحافز", "مبلغ الحافز", "المبلغ المستحق", "حوافز", "حافز"];

export const HEADER_GROUPS = [NID, MID, NAME, STATUS, DISC, SECTOR, DEPT, AMOUNT, MODEL, NOTES];

export function scoreHeaderRow(cells: string[]): number {
  const headers = cells.map((c) => asText(c).replace(/\n/g, " ")).filter(Boolean);
  if (!headers.length) return 0;
  let score = 0;
  if (findCol(headers, NAME)) score += 3;
  if (findCol(headers, NID)) score += 3;
  if (findCol(headers, MID)) score += 3;
  if (findCol(headers, STATUS)) score += 2;
  if (findCol(headers, DISC)) score += 2;
  if (findCol(headers, SECTOR)) score += 1;
  if (findCol(headers, DEPT)) score += 1;
  if (findCol(headers, AMOUNT)) score += 1;
  return score;
}

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

function emptyRow(row: Record<string, string> | undefined): boolean {
  if (!row) return true;
  return Object.values(row).every((v) => !asText(v));
}

function looksLikePerson(
  row: Record<string, string>,
  nidCol: string | null,
  midCol: string | null,
): boolean {
  if (normalizeId(pick(row, nidCol)).length >= 6) return true;
  if (normalizeId(pick(row, midCol)).length >= 4) return true;
  return Object.values(row).some((v) => /\d{5,}/.test(asText(v)));
}

function dropNonPeople(
  rows: Record<string, string>[],
  nidCol: string | null,
  midCol: string | null,
): Record<string, string>[] {
  return rows.filter((r) => !emptyRow(r) && looksLikePerson(r, nidCol, midCol));
}

function identityHit(
  aNid: string,
  aMid: string,
  bNid: string,
  bMid: string,
): boolean {
  if (aNid && bNid && aNid === bNid) return true;
  if (aMid && bMid && aMid === bMid) return true;
  return false;
}

/** Shift lists so the same people line up when one file started a few rows later. */
function alignLists(
  yours: Record<string, string>[],
  theirs: Record<string, string>[],
  yNid: string | null,
  yMid: string | null,
  tNid: string | null,
  tMid: string | null,
): { yours: Record<string, string>[]; theirs: Record<string, string>[] } {
  const yKeys = yours.map((r) => ({
    nid: normalizeId(pick(r, yNid)),
    mid: normalizeId(pick(r, yMid)),
  }));
  const tKeys = theirs.map((r) => ({
    nid: normalizeId(pick(r, tNid)),
    mid: normalizeId(pick(r, tMid)),
  }));
  const maxOff = 12;
  let best = { hits: -1, yOff: 0, tOff: 0, len: 0 };
  for (let yOff = 0; yOff <= Math.min(maxOff, yours.length); yOff++) {
    for (let tOff = 0; tOff <= Math.min(maxOff, theirs.length); tOff++) {
      const len = Math.min(yours.length - yOff, theirs.length - tOff);
      if (len <= 0) continue;
      let hits = 0;
      for (let i = 0; i < len; i++) {
        if (identityHit(yKeys[yOff + i].nid, yKeys[yOff + i].mid, tKeys[tOff + i].nid, tKeys[tOff + i].mid)) {
          hits++;
        }
      }
      if (hits > best.hits || (hits === best.hits && len > best.len)) {
        best = { hits, yOff, tOff, len };
      }
    }
  }
  if (best.hits <= 0) return { yours, theirs };
  return { yours: yours.slice(best.yOff), theirs: theirs.slice(best.tOff) };
}

function allKeys(rows: Record<string, string>[]): string[] {
  const set = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) set.add(k);
  return [...set];
}

export function compareSheets(input: CompareInput): PersonRow[] {
  let yours = Array.isArray(input.yours) ? input.yours : [];
  let theirs = Array.isArray(input.theirs) ? input.theirs : [];

  const yHeaders = allKeys(yours);
  const tHeaders = allKeys(theirs);

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

  yours = dropNonPeople(yours, yourNid, yourMid);
  theirs = dropNonPeople(theirs, theirNid, theirMid);
  ({ yours, theirs } = alignLists(yours, theirs, yourNid, yourMid, theirNid, theirMid));

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
  const n = Math.max(yours.length, theirs.length);
  let seq = 1;

  for (let i = 0; i < n; i++) {
    const yrow = yours[i];
    const trow = theirs[i];
    if (emptyRow(yrow) && emptyRow(trow)) continue;

    const name = pick(yrow ?? {}, yourName);
    const nid = pick(yrow ?? {}, yourNid);
    const mid = pick(yrow ?? {}, yourMid);
    const sector = pick(yrow ?? {}, yourSector);
    const dept = pick(yrow ?? {}, yourDept);
    const notes = pick(yrow ?? {}, yourNotes);
    const model = pick(yrow ?? {}, yourModel);
    const status = pick(yrow ?? {}, yourStatus);
    const discharge = pick(yrow ?? {}, yourDisc);

    const hasTheir = !emptyRow(trow);
    const tName = hasTheir ? pick(trow ?? {}, theirName) : "";
    const tNid = hasTheir ? pick(trow ?? {}, theirNid) : "";
    const tMid = hasTheir ? pick(trow ?? {}, theirMid) : "";
    const amount = hasTheir ? pick(trow ?? {}, theirAmount) : "";

    const nidKey = normalizeId(nid);
    const midKey = normalizeId(mid);
    const nidMatch = Boolean(nidKey) && nidKey === normalizeId(tNid);
    const midMatch = Boolean(midKey) && midKey === normalizeId(tMid);
    const nameEq = hasTheir ? namesEquivalent(name, tName) : false;

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

    // Same-row identity — no VLOOKUP. Wrong name/IDs on this row = not in the right spot.
    if (!yrow || emptyRow(yrow)) {
      checks.nameNid = "fail";
      checks.nameMid = "fail";
      reasons.push("صف زائد في شيت الصرف بدون مقابل في شيتك — ليس في مكانه");
    } else if (!hasTheir) {
      checks.nameNid = "fail";
      checks.nameMid = "fail";
      reasons.push("لا يوجد صف مقابل في شيت الصرف — ليس في مكانه");
    } else {
      if (!nidMatch || nameEq === false) {
        checks.nameNid = nameEq === null && nidMatch ? "review" : "fail";
        reasons.push("الاسم بالرقم القومي في هذا الصف لا يطابق شيت الصرف — ليس في مكانه");
      } else if (nameEq === null) {
        checks.nameNid = "review";
        markReview();
        reasons.push("الاسم ناقص للمقارنة في صف الرقم القومي");
      }
      if (!midMatch || nameEq === false) {
        checks.nameMid = nameEq === null && midMatch ? "review" : "fail";
        if (!reasons.some((r) => r.includes("الرقم العسكري") || r.includes("الرقم القومي"))) {
          reasons.push("الاسم بالرقم العسكري في هذا الصف لا يطابق شيت الصرف — ليس في مكانه");
        } else if (!midMatch) {
          reasons.push("الرقم العسكري في هذا الصف لا يطابق شيت الصرف — ليس في مكانه");
        }
      } else if (nameEq === null) {
        checks.nameMid = "review";
        markReview();
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
      name: name || tName,
      nid: nid || tNid,
      mid: mid || tMid,
      sector,
      dept,
      notes,
      model,
      status,
      discharge,
      theirName: hasTheir ? tName : "لا يوجد صف مقابل",
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
