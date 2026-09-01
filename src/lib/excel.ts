import * as XLSX from "xlsx";
import { type PersonRow, scoreHeaderRow, summarize } from "./compare";

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
  return String(v).replace(/\s+/g, " ").trim();
}

function sheetToMatrix(sheet: XLSX.WorkSheet): string[][] {
  const matrix = XLSX.utils.sheet_to_json<(unknown | undefined)[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
    blankrows: false,
  });
  return matrix.map((row) => (row ?? []).map((c) => cellToString(c)));
}

function uniquifyHeaders(headerRow: string[]): string[] {
  const seen = new Map<string, number>();
  return headerRow.map((h, i) => {
    let name = h || `عمود_${i + 1}`;
    const n = (seen.get(name) ?? 0) + 1;
    seen.set(name, n);
    if (n > 1) name = `${name}_${n}`;
    return name;
  });
}

function looksLikeRepeatedHeader(row: string[], headerScore: number): boolean {
  if (headerScore < 4) return false;
  const joined = row.join(" ");
  return !/\d{6,}/.test(joined);
}

export function parseSheet(sheet: XLSX.WorkSheet): Record<string, string>[] {
  const matrix = sheetToMatrix(sheet);
  if (!matrix.length) return [];

  const scan = Math.min(matrix.length, 80);
  let headerIdx = 0;
  let bestScore = -1;
  for (let i = 0; i < scan; i++) {
    const score = scoreHeaderRow(matrix[i] ?? []);
    if (score > bestScore) {
      bestScore = score;
      headerIdx = i;
    }
  }
  if (bestScore < 3) {
    // No labelled header — keep first non-empty as header anyway
    headerIdx = matrix.findIndex((r) => r.some(Boolean));
    if (headerIdx < 0) return [];
  }

  const headerWidth = Math.max(
    ...(matrix.map((r) => r.length)),
    (matrix[headerIdx] ?? []).length,
  );
  const rawHeader = [...(matrix[headerIdx] ?? [])];
  while (rawHeader.length < headerWidth) rawHeader.push("");
  const headers = uniquifyHeaders(rawHeader);

  const rows: Record<string, string>[] = [];
  for (let r = headerIdx + 1; r < matrix.length; r++) {
    const raw = matrix[r] ?? [];
    if (looksLikeRepeatedHeader(raw, scoreHeaderRow(raw))) continue;
    const obj: Record<string, string> = {};
    let any = false;
    headers.forEach((h, i) => {
      const v = raw[i] ?? "";
      obj[h] = v;
      if (v) any = true;
    });
    if (any) rows.push(obj);
  }
  return rows;
}

export async function readExcelFile(file: File): Promise<Record<string, string>[]> {
  const buf = await file.arrayBuffer();
  return parseWorkbook(buf);
}

export function parseWorkbook(buf: ArrayBuffer): Record<string, string>[] {
  const wb = XLSX.read(buf, { type: "array", cellDates: true, raw: true });
  let best: Record<string, string>[] = [];
  let bestScore = -1;
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const matrix = sheetToMatrix(sheet);
    let headerScore = 0;
    for (const row of matrix.slice(0, 80)) {
      headerScore = Math.max(headerScore, scoreHeaderRow(row));
    }
    const rows = parseSheet(sheet);
    const score = headerScore * 100 + rows.length;
    if (score > bestScore) {
      bestScore = score;
      best = rows;
    }
  }
  return best;
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
    r.reasons.join(" · ") || "في مكانه — الفحوصات السبعة سليمة",
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
    ["جهاز مستقبل مصر للتنمية المستدامة"],
    ["كشف أفراد القطاع"],
    [],
    [],
    ["م", "الرقم العسكري", "الاسم", "الرقم القومي", "القطاع", "الإدارة", "حالة الفرد", "تاريخ التسريح", "ملاحظة"],
    ["1", "1234567", "أحمد محمد علي", "29001011234567", "قطاع الشرق", "إدارة العمليات", "موجود", "", ""],
    ["2", "2234567", "محمود حسن إبراهيم", "29102021234567", "قطاع الشرق", "إدارة الإمداد", "خارج", "", ""],
    ["3", "3234567", "سعيد عبد الرحمن", "29203031234567", "قطاع الشرق", "إدارة العمليات", "مجلس طبي", "", ""],
    ["4", "4234567", "خالد يوسف فتحي", "29304041234567", "قطاع الشرق", "إدارة الأمن", "موجود", "2026-09-01", "تسريح أول الشهر"],
    ["5", "5234567", "عمر طارق نبيل", "29405051234567", "قطاع الشرق", "إدارة العمليات", "موجود", "2026-07-01", "خلال 3 أشهر"],
    ["6", "6234567", "ياسر كمال فؤاد", "29506061234567", "قطاع الغرب", "إدارة الحركة", "موجود", "", "قطاع غلط"],
    ["7", "7234567", "حسام عادل شوقي", "29607071234567", "قطاع الشرق", "", "موجود", "", "بدون إدارة"],
    ["8", "8234567", "مصطفى جمال وهبة", "29708081234567", "قطاع الشرق", "إدارة العمليات", "موجود", "", "اسم مختلف"],
    ["9", "9234567", "نادر صلاح عطية", "29809091234567", "قطاع الشرق", "إدارة العمليات", "موجود", "", "مش في مكانه"],
    ["10", "10234567", "إيهاب سامي درويش", "29910101234567", "قطاع الشرق", "إدارة العمليات", "إجازة", "", "حالة غريبة"],
  ];
  const theirs = [
    ["كشف صرف الحافز"],
    ["سري"],
    [],
    [],
    ["الرقم العسكري", "الاسم", "رقم قومي"],
    ["1234567", "أحمد محمد علي", "29001011234567"],
    ["2234567", "محمود حسن إبراهيم", "29102021234567"],
    ["3234567", "سعيد عبد الرحمن", "29203031234567"],
    ["4234567", "خالد يوسف فتحي", "29304041234567"],
    ["5234567", "عمر طارق نبيل", "29405051234567"],
    ["6234567", "ياسر كمال فؤاد", "29506061234567"],
    ["7234567", "حسام عادل شوقي", "29607071234567"],
    ["8234567", "مصطفى جمال وهبة خطأ", "29708081234567"],
    ["0000001", "شخص في الصف الغلط", "11111111111111"],
    ["10234567", "إيهاب سامي درويش", "29910101234567"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(yours), "شيتك");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(theirs), "شيت الصرف");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as Uint8Array;
}

export function demoTables(): { yours: Record<string, string>[]; theirs: Record<string, string>[] } {
  const buf = buildTemplateWorkbook();
  const wb = XLSX.read(buf, { type: "array", cellDates: true, raw: true });
  return {
    yours: parseSheet(wb.Sheets["شيتك"]),
    theirs: parseSheet(wb.Sheets["شيت الصرف"]),
  };
}
