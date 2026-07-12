import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Upload, Database, FileSpreadsheet, FileJson, CheckCircle2, AlertTriangle,
  Loader2, X, ArrowRight, ArrowLeft, ListChecks, Table2, ChevronRight,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   CSV parser (handles quoted fields, escaped quotes, newlines)
   ═══════════════════════════════════════════════════════════════ */

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ",") { row.push(field); field = ""; }
      else if (char === "\r") { /* ignore */ }
      else if (char === "\n") { row.push(field); records.push(row); field = ""; row = []; }
      else { field += char; }
    }
  }
  // last field / row
  if (field.length > 0 || row.length > 0) { row.push(field); records.push(row); }

  // drop fully-empty trailing rows
  const cleaned = records.filter((r) => r.some((c) => c.trim() !== ""));
  if (cleaned.length === 0) return { headers: [], rows: [] };

  const headers = cleaned[0].map((h) => h.trim());
  const rows = cleaned.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
  return { headers, rows };
}

const IGNORE = "__ignore__";

/* Try to auto-match a source column to a target field by normalized name */
function autoMatch(sourceCols: string[], fieldKey: string, fieldLabel: string): string {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const targets = [norm(fieldKey), norm(fieldLabel)];
  const found = sourceCols.find((c) => targets.includes(norm(c)));
  return found ?? IGNORE;
}

type Step = 1 | 2 | 3 | 4;

interface ImportField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options: string[] | null;
  hint: string | null;
}

export default function ImportData() {
  const [step, setStep] = useState<Step>(1);
  const [tableId, setTableId] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [sourceCols, setSourceCols] = useState<string[]>([]);
  const [sourceRows, setSourceRows] = useState<Record<string, string>[]>([]);
  /** map of target field key -> source column name (or IGNORE) */
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);

  const tablesQuery = trpc.dataImport.getImportableTables.useQuery();
  const validateMutation = trpc.dataImport.validateImport.useMutation();
  const importMutation = trpc.dataImport.importRecords.useMutation();

  const tables = tablesQuery.data ?? [];
  const selectedTable = tables.find((t) => t.id === tableId);
  const fields: ImportField[] = (selectedTable?.fields ?? []) as ImportField[];

  /* ─── Build mapped rows from current mapping ─── */
  const mappedRows = useMemo(() => {
    return sourceRows.map((row) => {
      const out: Record<string, string> = {};
      for (const field of fields) {
        const col = mapping[field.key];
        if (col && col !== IGNORE) out[field.key] = row[col] ?? "";
      }
      return out;
    });
  }, [sourceRows, mapping, fields]);

  const requiredUnmapped = fields.filter(
    (f) => f.required && (!mapping[f.key] || mapping[f.key] === IGNORE)
  );

  /* ─── File handling ─── */
  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        if (file.name.toLowerCase().endsWith(".json")) {
          const parsed = JSON.parse(text);
          const arr = Array.isArray(parsed) ? parsed : parsed.data || parsed.rows || [];
          if (!Array.isArray(arr) || arr.length === 0) {
            toast.error("JSON must be a non-empty array of objects");
            return;
          }
          const cols = Array.from(new Set(arr.flatMap((o: any) => Object.keys(o ?? {}))));
          const rows = arr.map((o: any) => {
            const r: Record<string, string> = {};
            cols.forEach((c) => { r[c] = o?.[c] == null ? "" : String(o[c]); });
            return r;
          });
          setSourceCols(cols);
          setSourceRows(rows);
        } else {
          const { headers, rows } = parseCSV(text);
          if (headers.length === 0) { toast.error("Could not read any columns from the file"); return; }
          setSourceCols(headers);
          setSourceRows(rows);
        }
        setFileName(file.name);
        setImportResult(null);
        setValidation(null);
      } catch {
        toast.error("Failed to parse file. Use a valid CSV or JSON file.");
      }
    };
    reader.readAsText(file);
  }, []);

  const openFilePicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.json,.txt";
    input.onchange = (e: any) => { const f = e.target.files?.[0]; if (f) handleFile(f); };
    input.click();
  };

  /* ─── Step transitions ─── */
  const goToMapping = () => {
    if (sourceRows.length === 0) { toast.error("Upload a file with at least one row"); return; }
    // auto-match columns
    const initial: Record<string, string> = {};
    for (const f of fields) initial[f.key] = autoMatch(sourceCols, f.key, f.label);
    setMapping(initial);
    setStep(3);
  };

  const runValidation = async () => {
    try {
      const res = await validateMutation.mutateAsync({ tableId, rows: mappedRows });
      setValidation(res);
      if (res.invalidRows > 0) {
        toast.warning(`${res.invalidRows} of ${res.totalRows} rows have issues`);
      } else {
        toast.success(`All ${res.totalRows} rows are valid`);
      }
    } catch (err: any) {
      toast.error(`Validation failed: ${err.message}`);
    }
  };

  const runImport = async () => {
    try {
      const res = await importMutation.mutateAsync({ tableId, rows: mappedRows, skipInvalid: true });
      setImportResult(res);
      setStep(4);
      if (res.imported > 0) toast.success(`Imported ${res.imported} records into ${selectedTable?.label}`);
      else toast.error("No records were imported");
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
    }
  };

  const reset = () => {
    setStep(1); setTableId(""); setFileName(""); setSourceCols([]);
    setSourceRows([]); setMapping({}); setImportResult(null); setValidation(null);
  };

  /* ═══════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════ */

  const steps = [
    { n: 1, label: "Select Data" },
    { n: 2, label: "Upload File" },
    { n: 3, label: "Map Columns" },
    { n: 4, label: "Results" },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Upload className="w-6 h-6 text-[var(--theme-primary)]" />
            Import Your Data
          </h1>
          <p className="text-white/50 mt-1">Bring data in from spreadsheets, other CMSs, or legacy tools via CSV or JSON</p>
        </div>
        {step > 1 && (
          <Button variant="outline" onClick={reset} className="border-white/10 text-white/60 hover:text-white bg-transparent">
            <X className="w-4 h-4 mr-1" /> Start Over
          </Button>
        )}
      </div>

      {/* ─── Stepper ─── */}
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
              step === s.n
                ? "bg-[var(--theme-primary)]/15 border-[var(--theme-primary)]/30 text-[var(--theme-primary)]"
                : step > s.n
                  ? "bg-green-400/10 border-green-400/20 text-green-400"
                  : "bg-black/20 border-white/5 text-white/30"
            }`}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-current/10">
                {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-white/20" />}
          </div>
        ))}
      </div>

      {/* ════════════ STEP 1: Select Table ════════════ */}
      {step === 1 && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--theme-primary)]" /> What are you importing?
            </CardTitle>
            <CardDescription className="text-white/50">
              Choose the type of records you want to add to your database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tablesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--theme-primary)]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTableId(t.id)}
                    className={`text-left p-4 rounded-lg border transition-colors ${
                      tableId === t.id
                        ? "bg-[var(--theme-primary)]/5 border-[var(--theme-primary)]/30"
                        : "bg-black/20 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tableId === t.id ? "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]" : "bg-white/5 text-white/40"
                        }`}>
                          <Table2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{t.label}</p>
                          <p className="text-white/40 text-xs">{t.description}</p>
                        </div>
                      </div>
                      {tableId === t.id && <CheckCircle2 className="w-5 h-5 text-[var(--theme-primary)]" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-5">
              <Button
                onClick={() => setStep(2)}
                disabled={!tableId}
                className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)] disabled:opacity-50"
              >
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ════════════ STEP 2: Upload File ════════════ */}
      {step === 2 && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[var(--theme-primary)]" /> Upload your file
            </CardTitle>
            <CardDescription className="text-white/50">
              Importing into <span className="text-[var(--theme-primary)] font-medium">{selectedTable?.label}</span>.
              Supports <strong>.csv</strong> (first row = column headers) and <strong>.json</strong> (array of objects).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                fileName ? "border-[var(--theme-primary)]/50 bg-[var(--theme-primary)]/5" : "border-white/10 hover:border-[var(--theme-primary)]/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              onClick={openFilePicker}
            >
              {fileName ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-[var(--theme-primary)] mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">{fileName}</p>
                  <p className="text-white/40 text-xs mt-1">{sourceRows.length} rows · {sourceCols.length} columns detected</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50 text-sm mb-1">Drop a CSV or JSON file here, or click to browse</p>
                  <p className="text-white/30 text-xs flex items-center justify-center gap-3 mt-2">
                    <span className="flex items-center gap-1"><FileSpreadsheet className="w-3 h-3" /> .csv</span>
                    <span className="flex items-center gap-1"><FileJson className="w-3 h-3" /> .json</span>
                  </p>
                </>
              )}
            </div>

            {sourceCols.length > 0 && (
              <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                <p className="text-white/50 text-xs mb-2">Detected columns:</p>
                <div className="flex flex-wrap gap-1.5">
                  {sourceCols.map((c) => (
                    <Badge key={c} className="bg-white/5 text-white/60 border-0 text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 text-white/60 hover:text-white bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={goToMapping} disabled={sourceRows.length === 0}
                className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)] disabled:opacity-50">
                Map Columns <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ════════════ STEP 3: Map Columns ════════════ */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[var(--theme-primary)]" /> Map your columns
              </CardTitle>
              <CardDescription className="text-white/50">
                Match each field in <span className="text-[var(--theme-primary)] font-medium">{selectedTable?.label}</span> to a column from your file.
                We auto-matched columns by name — adjust as needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {fields.map((field) => {
                const value = mapping[field.key] ?? IGNORE;
                const isUnmappedRequired = field.required && value === IGNORE;
                return (
                  <div key={field.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isUnmappedRequired ? "border-red-500/30 bg-red-500/5" : "border-white/5 bg-black/20"
                    }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">{field.label}</span>
                        {field.required && <Badge className="bg-red-400/10 text-red-400 border-0 text-[10px] px-1.5">Required</Badge>}
                        <Badge className="bg-white/5 text-white/40 border-0 text-[10px] px-1.5">{field.type}</Badge>
                      </div>
                      {(field.hint || field.options) && (
                        <p className="text-white/30 text-xs mt-0.5">
                          {field.options ? `Options: ${field.options.join(", ")}` : field.hint}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 shrink-0" />
                    <Select value={value} onValueChange={(v) => setMapping((prev) => ({ ...prev, [field.key]: v }))}>
                      <SelectTrigger className="w-[200px] bg-black/40 border-white/10 text-white shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--card)] border-white/10 max-h-72">
                        <SelectItem value={IGNORE}><span className="text-white/40">— Skip this field —</span></SelectItem>
                        {sourceCols.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}

              {requiredUnmapped.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 mt-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300 text-xs">
                    Map all required fields before importing: {requiredUnmapped.map((f) => f.label).join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Table2 className="w-4 h-4 text-[var(--theme-primary)]" /> Preview
                <Badge className="bg-white/5 text-white/50 border-0">{sourceRows.length} rows</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/5">
                      {fields.filter((f) => mapping[f.key] && mapping[f.key] !== IGNORE).map((f) => (
                        <th key={f.key} className="text-left px-3 py-2 text-white/60 font-medium whitespace-nowrap">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mappedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-t border-white/5">
                        {fields.filter((f) => mapping[f.key] && mapping[f.key] !== IGNORE).map((f) => (
                          <td key={f.key} className="px-3 py-2 text-white/70 max-w-[200px] truncate">{row[f.key] || <span className="text-white/20">—</span>}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {mappedRows.length > 5 && <p className="text-white/30 text-xs mt-2">Showing 5 of {mappedRows.length} rows</p>}
            </CardContent>
          </Card>

          {/* Validation result */}
          {validation && (
            <Card className="bg-black/40 border-white/10">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-white font-bold text-lg">{validation.totalRows}</p>
                    <p className="text-white/40 text-xs">Total rows</p>
                  </div>
                  <div className="bg-green-400/5 rounded-lg p-2">
                    <p className="text-green-400 font-bold text-lg">{validation.validRows}</p>
                    <p className="text-white/40 text-xs">Valid</p>
                  </div>
                  <div className="bg-red-400/5 rounded-lg p-2">
                    <p className="text-red-400 font-bold text-lg">{validation.invalidRows}</p>
                    <p className="text-white/40 text-xs">With issues</p>
                  </div>
                </div>
                {validation.rowErrors?.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {validation.rowErrors.map((re: any) => (
                      <div key={re.row} className="text-xs flex gap-2">
                        <span className="text-red-400/70 shrink-0">Row {re.row}:</span>
                        <span className="text-white/50">{re.errors.join("; ")}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-white/40 text-xs">Rows with issues will be skipped during import.</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="border-white/10 text-white/60 hover:text-white bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={runValidation} disabled={validateMutation.isPending || requiredUnmapped.length > 0}
                className="border-white/10 text-white/70 hover:text-white bg-transparent disabled:opacity-50">
                {validateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ListChecks className="w-4 h-4 mr-1" />}
                Validate
              </Button>
              <Button onClick={runImport} disabled={importMutation.isPending || requiredUnmapped.length > 0}
                className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)] disabled:opacity-50">
                {importMutation.isPending ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Importing...</> : <><Upload className="w-4 h-4 mr-1" /> Import {mappedRows.length} Rows</>}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ STEP 4: Results ════════════ */}
      {step === 4 && importResult && (
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              {importResult.imported > 0
                ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                : <AlertTriangle className="w-5 h-5 text-red-400" />}
              Import {importResult.imported > 0 ? "Complete" : "Finished"}
            </CardTitle>
            <CardDescription className="text-white/50">
              Imported into {selectedTable?.label} · {new Date(importResult.importedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white font-bold text-xl">{importResult.totalRows}</p>
                <p className="text-white/40 text-xs">Total rows</p>
              </div>
              <div className="bg-green-400/5 rounded-lg p-3">
                <p className="text-green-400 font-bold text-xl">{importResult.imported}</p>
                <p className="text-white/40 text-xs">Imported</p>
              </div>
              <div className="bg-yellow-400/5 rounded-lg p-3">
                <p className="text-yellow-400 font-bold text-xl">{importResult.skipped}</p>
                <p className="text-white/40 text-xs">Skipped</p>
              </div>
              <div className="bg-red-400/5 rounded-lg p-3">
                <p className="text-red-400 font-bold text-xl">{importResult.failed}</p>
                <p className="text-white/40 text-xs">Failed</p>
              </div>
            </div>

            {importResult.errors?.length > 0 && (
              <div>
                <p className="text-white/60 text-sm mb-2">Skipped / failed rows:</p>
                <div className="max-h-48 overflow-y-auto space-y-1 bg-black/20 rounded-lg p-3 border border-white/5">
                  {importResult.errors.map((e: any) => (
                    <div key={e.row} className="text-xs flex gap-2">
                      <span className="text-red-400/70 shrink-0">Row {e.row}:</span>
                      <span className="text-white/50">{e.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={reset} className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]">
                <Upload className="w-4 h-4 mr-1" /> Import More Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
