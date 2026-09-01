import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Download,
  FileSpreadsheet,
  Shield,
  Upload,
  X,
  CircleAlert,
  ScanSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CHECK_LABELS,
  compareSheets,
  summarize,
  type CheckResult,
  type PersonRow,
} from "@/lib/compare";
import {
  buildExceptionsWorkbook,
  buildTemplateWorkbook,
  demoTables,
  downloadWorkbook,
  readExcelFile,
} from "@/lib/excel";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [sector, setSector] = useState("قطاع الشرق");
  const [month, setMonth] = useState("2026-09");
  const [yourFile, setYourFile] = useState<File | null>(null);
  const [theirFile, setTheirFile] = useState<File | null>(null);
  const [rows, setRows] = useState<PersonRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"fail" | "review" | "grant">("fail");

  const stats = useMemo(() => (rows ? summarize(rows) : null), [rows]);
  const visible = useMemo(() => {
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
      const [yours, theirs] = await Promise.all([
        readExcelFile(yourFile),
        readExcelFile(theirFile),
      ]);
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
        paymentMonth: month,
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
        paymentMonth: month || "2026-09",
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
    const buf = buildExceptionsWorkbook(rows);
    const safe = (sector || "قطاع").replace(/[\\/]/g, "-");
    downloadWorkbook(buf, `استثناءات الحافز ${safe} ${month || ""}.xlsx`);
  }

  function downloadTemplate() {
    downloadWorkbook(buildTemplateWorkbook(), "نموذج شيت الحافز.xlsx");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-amber">
            <Shield className="size-5" strokeWidth={1.75} />
          </span>
          <div>
            <p className="text-xs font-medium tracking-wide text-amber">
              جهاز مستقبل مصر للتنمية المستدامة
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
              مراجعة الحافز
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              صف مقابل صف، من غير بحث. الفرد في مكانه فقط لو الفحوصات السبعة على
              نفس الصف سليمة. أي فشل ينزل في ملف الإكسل مع السبب.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={downloadTemplate}>
            <FileSpreadsheet className="size-4" />
            نموذج الشيت
          </Button>
          <Button variant="outline" size="sm" onClick={runDemo} disabled={busy}>
            تشغيل مثال
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {CHECK_LABELS.map((c, i) => (
          <article
            key={c.id}
            className="rounded-md border border-border bg-surface px-3 py-3"
          >
            <p className="text-xs text-amber">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-1 text-sm font-semibold leading-snug text-fg">{c.label}</h2>
            <p className="mt-1 text-xs leading-snug text-muted">{c.hint}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-border bg-surface p-4 sm:p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">القطاع قيد المراجعة</span>
            <input
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="h-11 rounded-md border border-border bg-bg px-3 text-fg outline-none focus:ring-2 focus:ring-ring"
              placeholder="مثال: قطاع الشرق"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted">شهر الصرف</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-11 rounded-md border border-border bg-bg px-3 text-fg outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DropZone
            title="شيتك"
            hint="الاسم، القومي، العسكري، القطاع، الإدارة، حالة الفرد، التسريح"
            file={yourFile}
            onFile={setYourFile}
          />
          <DropZone
            title="شيت الصرف"
            hint="حتى لو العناوين من صف 5 والأعمدة مترتبة مختلف"
            file={theirFile}
            onFile={setTheirFile}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" size="lg" onClick={runFromFiles} disabled={busy}>
            <ScanSearch className="size-4" />
            {busy ? "جاري المطابقة…" : "ابدأ المقارنة"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={downloadReport}
            disabled={!rows}
            className="sm:min-w-52"
          >
            <Download className="size-4" />
            تحميل الاستثناءات
          </Button>
        </div>
      </section>

      {stats ? (
        <section className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="الإجمالي" value={stats.total} />
            <Stat label="مستحق" value={stats.grant} tone="ok" />
            <Stat label="غير مستحق" value={stats.fail} tone="danger" />
            <Stat label="يحتاج مراجعة" value={stats.review} tone="warn" />
          </div>

          <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
            {(
              [
                ["fail", "غير مستحق", stats.fail],
                ["review", "يحتاج مراجعة", stats.review],
                ["grant", "مستحق", stats.grant],
              ] as const
            ).map(([id, label, n]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "h-11 flex-1 rounded-sm text-sm font-medium transition-colors duration-150",
                  tab === id ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {label} ({n})
              </button>
            ))}
          </div>

          <ResultsTable rows={visible} />
        </section>
      ) : (
        <p className="pb-8 text-center text-sm text-muted">
          ارفع الشيتين أو شغّل المثال. المقارنة على نفس رقم الصف. التحميل فيه
          «غير مستحق» و«يحتاج مراجعة» مع عمود السبب.
        </p>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "danger" | "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface px-4 py-3",
        tone === "ok" && "bg-ok-bg",
        tone === "danger" && "bg-danger-bg",
        tone === "warn" && "bg-warn-bg",
      )}
    >
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function DropZone({
  title,
  hint,
  file,
  onFile,
}: {
  title: string;
  hint: string;
  file: File | null;
  onFile: (f: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function take(list: FileList | null) {
    const f = list?.[0];
    if (!f) return;
    if (!/\.xlsx?$/i.test(f.name)) {
      toast.error("الملف لازم يكون Excel");
      return;
    }
    onFile(f);
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files);
      }}
      className={cn(
        "flex min-h-36 flex-col items-start gap-2 rounded-md border border-dashed border-border bg-bg p-4 text-start transition-colors duration-150",
        over && "border-accent bg-surface-2",
        file && "border-solid border-amber/40",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(e) => take(e.target.files)}
      />
      <span className="flex size-9 items-center justify-center rounded-sm bg-surface-2 text-amber">
        <Upload className="size-4" />
      </span>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted">{file ? file.name : hint}</span>
    </button>
  );
}

function ResultsTable({ rows }: { rows: PersonRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-md border border-border bg-surface px-4 py-10 text-center text-sm text-muted">
        لا توجد أسماء في هذا التبويب
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[720px] text-right text-sm">
        <thead className="bg-surface-2 text-xs text-muted">
          <tr>
            <th className="px-3 py-3 font-medium">م</th>
            <th className="px-3 py-3 font-medium">الاسم</th>
            <th className="px-3 py-3 font-medium">السبع فحوصات</th>
            <th className="px-3 py-3 font-medium">السبب</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.seq} className="border-t border-border bg-surface">
              <td className="px-3 py-3 tabular-nums text-muted">{r.seq}</td>
              <td className="px-3 py-3">
                <div className="font-medium">{r.name || "—"}</div>
                <div className="mt-0.5 text-xs text-muted">
                  {r.nid || "بدون قومي"} · {r.mid || "بدون عسكري"}
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1">
                  {CHECK_LABELS.map((c) => (
                    <CheckChip key={c.id} label={c.label} result={r.checks[c.id]} />
                  ))}
                </div>
              </td>
              <td className="px-3 py-3 text-xs text-muted">
                {r.reasons.join(" · ") || "في مكانه — الفحوصات السبعة سليمة"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CheckChip({ label, result }: { label: string; result: CheckResult }) {
  return (
    <span
      title={label}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-1 text-[11px]",
        result === "pass" && "bg-ok-bg text-ok",
        result === "fail" && "bg-danger-bg text-danger",
        result === "review" && "bg-warn-bg text-warn",
      )}
    >
      {result === "pass" ? (
        <Check className="size-3" />
      ) : result === "fail" ? (
        <X className="size-3" />
      ) : (
        <CircleAlert className="size-3" />
      )}
      {label}
    </span>
  );
}
