import * as XLSX from "xlsx";
import { type PersonRow, summarize } from "./compare";

function cellToString(v: unknown): string {
  if (v == null || v === "") return "";
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, "0");
    const d = String(v.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof v === "number") {
    if (v > 20000 && v < 90000) {
      try {
        const parsed = XLSX.SSF.parse_date_code(v);
        if (parsed && parsed.y > 1950) {
          const m = String(parsed.m).padStart(2, "0");
          const d = String(parsed.d).padStart(2, "0");
          return `${parsed.y}-${m}-${d}`;
        }
      } catch {
        /* ignore */
      }
    }
    if (Number.isInteger(v)) return String(v);
    return String(v);
  }
  return String(v).trim();
}

function isArabic(s: string): boolean {
  return /[\u0600-\u06FF]/.test(s);
}

export async function readExcelFile(file: File): Promise<Record<string, string>[]> {
  const buf = await file.arrayBuffer();
  return parseWorkbook(buf);
}

export function parseWorkbook(buf: ArrayBuffer): Record<string, string>[] {
  const wb = XLSX.read(buf, { type: "array", cellDates: true, raw: true });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const sheet = wb.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(unknown | undefined)[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
    blankrows: false,
  });

  let headerIdx = 0;
  const limit = Math.min(matrix.length, 25);
  for (let i = 0; i < limit; i++) {
    const row = (matrix[i] ?? []).map((c) => cellToString(c));
    const arabic = row.filter((c) => isArabic(c)).length;
    if (arabic >= 2) {
      headerIdx = i;
      break;
    }
  }

  const headerRow = (matrix[headerIdx] ?? []).map((c) => cellToString(c));
  const headers: string[] = [];
  const seen = new Map<string, number>();
  headerRow.forEach((h, i) => {
    let name = h || `عمود_${i + 1}`;
    const n = (seen.get(name) ?? 0) + 1;
    seen.set(name, n);
    if (n > 1) name = `${name}_${n}`;
    headers.push(name);
  });

  const rows: Record<string, string>[] = [];
  for (let r = headerIdx + 1; r < matrix.length; r++) {
    const raw = matrix[r] ?? [];
    const obj: Record<string, string> = {};
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

function sheetFromRows(rows: PersonRow[]) {
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
    "السبب",
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
    r.reasons.join(" · ") || "",
  ]);
  return XLSX.utils.aoa_to_sheet([header, ...data]);
}

export function buildExceptionsWorkbook(rows: PersonRow[]): Uint8Array {
  const wb = XLSX.utils.book_new();
  const fails = rows.filter((r) => r.decision === "fail");
  const reviews = rows.filter((r) => r.decision === "review");
  const grants = rows.filter((r) => r.decision === "grant");
  const stats = summarize(rows);

  const summary = XLSX.utils.aoa_to_sheet([
    ["تقرير استثناءات الحافز"],
    ["الإجمالي", stats.total],
    ["مستحق", stats.grant],
    ["غير مستحق", stats.fail],
    ["يحتاج مراجعة", stats.review],
  ]);
  XLSX.utils.book_append_sheet(wb, summary, "ملخص");
  XLSX.utils.book_append_sheet(wb, sheetFromRows(fails), "غير مستحق");
  XLSX.utils.book_append_sheet(wb, sheetFromRows(reviews), "يحتاج مراجعة");
  XLSX.utils.book_append_sheet(wb, sheetFromRows(grants), "مستحق");

  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
}

export function downloadWorkbook(buf: ArrayBuffer | Uint8Array, filename: string) {
  const blob = new Blob([buf as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function buildTemplateWorkbook(): Uint8Array {
  const wb = XLSX.utils.book_new();
  const yours = [
    ["الاسم", "الرقم القومي", "الرقم العسكري", "القطاع", "الإدارة", "حالة الفرد", "تاريخ التسريح", "ملاحظة"],
    ["أحمد محمد علي", "29001011234567", "1234567", "قطاع الشرق", "إدارة العمليات", "موجود", "", ""],
    ["محمود حسن إبراهيم", "29102021234567", "2234567", "قطاع الشرق", "إدارة الإمداد", "خارج", "", ""],
    ["سعيد عبد الرحمن", "29203031234567", "3234567", "قطاع الشرق", "إدارة العمليات", "مجلس طبي", "", ""],
    ["خالد يوسف فتحي", "29304041234567", "4234567", "قطاع الشرق", "إدارة الأمن", "موجود", "2026-09-01", "تسريح أول الشهر"],
    ["عمر طارق نبيل", "29405051234567", "5234567", "قطاع الشرق", "إدارة العمليات", "موجود", "2026-07-01", "خلال 3 أشهر"],
    ["ياسر كمال فؤاد", "29506061234567", "6234567", "قطاع الغرب", "إدارة الحركة", "موجود", "", "قطاع غلط"],
    ["حسام عادل شوقي", "29607071234567", "7234567", "قطاع الشرق", "", "موجود", "", "بدون إدارة"],
    ["مصطفى جمال وهبة", "29708081234567", "8234567", "قطاع الشرق", "إدارة العمليات", "موجود", "", "اسم مختلف"],
    ["نادر صلاح عطية", "29809091234567", "9234567", "قطاع الشرق", "إدارة العمليات", "موجود", "", "مش في شيت الصرف"],
    ["إيهاب سامي درويش", "29910101234567", "10234567", "قطاع الشرق", "إدارة العمليات", "إجازة", "", "حالة غريبة"],
  ];
  const theirs = [
    ["الاسم", "الرقم القومي", "الرقم العسكري", "المبلغ"],
    ["أحمد محمد علي", "29001011234567", "1234567", "2500"],
    ["محمود حسن إبراهيم", "29102021234567", "2234567", "2500"],
    ["سعيد عبد الرحمن", "29203031234567", "3234567", "2500"],
    ["خالد يوسف فتحي", "29304041234567", "4234567", "2500"],
    ["عمر طارق نبيل", "29405051234567", "5234567", "2500"],
    ["ياسر كمال فؤاد", "29506061234567", "6234567", "2500"],
    ["حسام عادل شوقي", "29607071234567", "7234567", "2500"],
    ["مصطفى جمال وهبة خطأ", "29708081234567", "8234567", "2500"],
    ["إيهاب سامي درويش", "29910101234567", "10234567", "2500"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(yours), "شيتك");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(theirs), "شيت الصرف");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
}

export function demoTables(): { yours: Record<string, string>[]; theirs: Record<string, string>[] } {
  const buf = buildTemplateWorkbook();
  const wb = XLSX.read(buf, { type: "array" });
  const yoursSheet = wb.Sheets["شيتك"];
  const theirsSheet = wb.Sheets["شيت الصرف"];
  const yours = XLSX.utils.sheet_to_json<Record<string, string>>(yoursSheet, {
    defval: "",
    raw: false,
  });
  const theirs = XLSX.utils.sheet_to_json<Record<string, string>>(theirsSheet, {
    defval: "",
    raw: false,
  });
  return { yours, theirs };
}
