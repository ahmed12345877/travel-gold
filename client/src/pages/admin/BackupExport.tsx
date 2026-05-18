import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  HardDrive,
  Download,
  Upload,
  Clock,
  Database,
  FileJson,
  FileSpreadsheet,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Archive,
  Trash2,
  Cloud,
  CloudUpload,
  CloudDownload,
  Link2,
  Unlink,
  Lock,
  Unlock,
  Settings,
  History,
  Zap,
  Globe,
  FolderSync,
  ExternalLink,
  Info,
  ChevronRight,
  Check,
  X,
  Eye,
  Copy,
  Loader2,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════ */

interface ExportSection {
  id: string;
  label: string;
  recordCount: number;
  enabled: boolean;
}

interface BackupLogEntry {
  id: string;
  type: "export" | "backup" | "cloud_upload";
  name: string;
  date: string;
  sections: string[];
  format: string;
  recordCount: number;
  status: "completed" | "failed";
}

interface CloudProviderConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  configFields: {
    key: string;
    label: string;
    placeholder: string;
    type?: string;
  }[];
}

/* ═══════════════════════════════════════════════════════════════
   Cloud Provider Templates (no fake data)
   ═══════════════════════════════════════════════════════════════ */

const CLOUD_PROVIDERS: CloudProviderConfig[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    icon: "G",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    description:
      "Store backups in your Google Drive. Requires OAuth connection.",
    configFields: [
      {
        key: "client_id",
        label: "OAuth Client ID",
        placeholder: "Enter Google OAuth Client ID",
      },
      {
        key: "client_secret",
        label: "OAuth Client Secret",
        placeholder: "Enter Client Secret",
        type: "password",
      },
      {
        key: "folder_id",
        label: "Folder ID (optional)",
        placeholder: "Google Drive folder ID",
      },
    ],
  },
  {
    id: "dropbox",
    name: "Dropbox",
    icon: "D",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    description: "Sync backups to Dropbox. Requires API access token.",
    configFields: [
      {
        key: "access_token",
        label: "Access Token",
        placeholder: "Enter Dropbox access token",
        type: "password",
      },
      {
        key: "folder_path",
        label: "Backup Folder Path",
        placeholder: "/Apps/Vanir-Backups",
      },
    ],
  },
  {
    id: "aws-s3",
    name: "AWS S3",
    icon: "S3",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    description:
      "Use Amazon S3 for scalable backup storage. Requires IAM credentials.",
    configFields: [
      {
        key: "access_key_id",
        label: "Access Key ID",
        placeholder: "AKIA...",
        type: "password",
      },
      {
        key: "secret_access_key",
        label: "Secret Access Key",
        placeholder: "Enter secret key",
        type: "password",
      },
      {
        key: "bucket_name",
        label: "Bucket Name",
        placeholder: "vanir-backups",
      },
      { key: "region", label: "Region", placeholder: "us-east-1" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════
   Helper Components
   ═══════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-green-400/10 text-green-400 border-0 gap-1">
          <CheckCircle2 className="w-3 h-3" /> Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-red-400/10 text-red-400 border-0 gap-1">
          <AlertTriangle className="w-3 h-3" /> Failed
        </Badge>
      );
    default:
      return null;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function BackupExport() {
  /* ─── State ─── */
  const [exportSections, setExportSections] = useState<ExportSection[]>([]);
  const [exportFormat, setExportFormat] = useState("json");
  const [isExporting, setIsExporting] = useState(false);
  const [backupLog, setBackupLog] = useState<BackupLogEntry[]>([]);

  // Cloud state - loaded from DB
  const [cloudConfigs, setCloudConfigs] = useState<
    Record<
      string,
      { connected: boolean; config: Record<string, string>; lastSync?: string }
    >
  >({});
  const [cloudConfigDialog, setCloudConfigDialog] =
    useState<CloudProviderConfig | null>(null);
  const [cloudConfigValues, setCloudConfigValues] = useState<
    Record<string, string>
  >({});

  // Settings state - loaded from DB
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState("daily");
  const [encryptBackups, setEncryptBackups] = useState(false);
  const [retentionDays, setRetentionDays] = useState("30");

  /* ─── tRPC Queries ─── */
  const sectionsQuery = trpc.backup.getExportSections.useQuery();
  const backupSettingsQuery = trpc.backup.getSettings.useQuery();
  const cloudSettingsQuery = trpc.siteSettings.getByCategory.useQuery({
    category: "backup_cloud",
  });
  const exportMutation = trpc.backup.exportData.useMutation();
  const saveSettingsMutation = trpc.backup.saveSettings.useMutation();
  const saveCloudMutation = trpc.siteSettings.setMany.useMutation();

  /* ─── Load sections from DB ─── */
  useEffect(() => {
    if (sectionsQuery.data) {
      setExportSections(
        sectionsQuery.data.map((s) => ({ ...s, enabled: true })),
      );
    }
  }, [sectionsQuery.data]);

  /* ─── Load backup settings from DB ─── */
  useEffect(() => {
    if (backupSettingsQuery.data) {
      const s = backupSettingsQuery.data;
      if (s.auto_backup) setAutoBackup(s.auto_backup === "true");
      if (s.frequency) setBackupFrequency(s.frequency);
      if (s.encrypt) setEncryptBackups(s.encrypt === "true");
      if (s.retention_days) setRetentionDays(s.retention_days);
    }
  }, [backupSettingsQuery.data]);

  /* ─── Load cloud configs from DB ─── */
  useEffect(() => {
    if (cloudSettingsQuery.data) {
      const configs: Record<string, any> = {};
      for (const [key, value] of Object.entries(cloudSettingsQuery.data)) {
        try {
          configs[key] = JSON.parse(value);
        } catch {}
      }
      setCloudConfigs(configs);
    }
  }, [cloudSettingsQuery.data]);

  /* ─── Load backup log from localStorage (client-side log) ─── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vanir_backup_log");
      if (saved) setBackupLog(JSON.parse(saved));
    } catch {}
  }, []);

  const saveBackupLog = (log: BackupLogEntry[]) => {
    setBackupLog(log);
    localStorage.setItem("vanir_backup_log", JSON.stringify(log));
  };

  // Restore state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [restoreMode, setRestoreMode] = useState<"merge" | "replace">("merge");
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<any>(null);
  const restoreMutation = trpc.backup.restoreData.useMutation();

  /* ─── Derived ─── */
  const selectedSections = exportSections.filter((s) => s.enabled);
  const totalRecords = selectedSections.reduce(
    (sum, s) => sum + s.recordCount,
    0,
  );
  const connectedCloudCount = Object.values(cloudConfigs).filter(
    (c) => c.connected,
  ).length;

  /* ─── Handlers ─── */
  const toggleSection = (id: string) => {
    setExportSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );
  };

  const handleExport = async () => {
    if (selectedSections.length === 0) {
      toast.error("Please select at least one section to export");
      return;
    }
    setIsExporting(true);
    try {
      const result = await exportMutation.mutateAsync({
        sections: selectedSections.map((s) => s.id),
        format: exportFormat as "json" | "csv",
      });

      // Create downloadable file
      let blob: Blob;
      let filename: string;
      if (exportFormat === "json") {
        blob = new Blob([JSON.stringify(result, null, 2)], {
          type: "application/json",
        });
        filename = `vanir-export-${new Date().toISOString().slice(0, 10)}.json`;
      } else {
        // CSV: flatten all sections
        const lines = ["Section,Record Count,Exported At"];
        for (const [key, section] of Object.entries(result.sections)) {
          const s = section as { label: string; recordCount: number };
          lines.push(`${s.label},${s.recordCount},${result.exportedAt}`);
        }
        blob = new Blob([lines.join("\n")], { type: "text/csv" });
        filename = `vanir-export-${new Date().toISOString().slice(0, 10)}.csv`;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      // Log the export
      const logEntry: BackupLogEntry = {
        id: Date.now().toString(),
        type: "export",
        name: `${exportFormat.toUpperCase()} Export`,
        date: new Date().toISOString(),
        sections: selectedSections.map((s) => s.id),
        format: exportFormat,
        recordCount: result.totalRecords,
        status: "completed",
      };
      saveBackupLog([logEntry, ...backupLog].slice(0, 50));
      toast.success(`Exported ${result.totalRecords} records successfully`);
    } catch (err: any) {
      toast.error(`Export failed: ${err.message || "Unknown error"}`);
      const logEntry: BackupLogEntry = {
        id: Date.now().toString(),
        type: "export",
        name: `${exportFormat.toUpperCase()} Export`,
        date: new Date().toISOString(),
        sections: selectedSections.map((s) => s.id),
        format: exportFormat,
        recordCount: 0,
        status: "failed",
      };
      saveBackupLog([logEntry, ...backupLog].slice(0, 50));
    } finally {
      setIsExporting(false);
    }
  };

  const handleFullBackup = async () => {
    setIsExporting(true);
    try {
      const allSections = exportSections.map((s) => s.id);
      const result = await exportMutation.mutateAsync({
        sections: allSections,
        format: "json",
      });

      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      const filename = `vanir-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      const logEntry: BackupLogEntry = {
        id: Date.now().toString(),
        type: "backup",
        name: "Full Backup",
        date: new Date().toISOString(),
        sections: allSections,
        format: "json",
        recordCount: result.totalRecords,
        status: "completed",
      };
      saveBackupLog([logEntry, ...backupLog].slice(0, 50));
      toast.success(`Full backup completed: ${result.totalRecords} records`);
    } catch (err: any) {
      toast.error(`Backup failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const saveBackupSettings = async () => {
    try {
      await saveSettingsMutation.mutateAsync({
        settings: {
          auto_backup: String(autoBackup),
          frequency: backupFrequency,
          encrypt: String(encryptBackups),
          retention_days: retentionDays,
        },
      });
      toast.success("Backup settings saved to database");
    } catch (err: any) {
      toast.error(`Failed to save settings: ${err.message}`);
    }
  };

  const saveCloudConfig = async () => {
    if (!cloudConfigDialog) return;
    const id = cloudConfigDialog.id;
    const hasValues = Object.values(cloudConfigValues).some((v) => v.trim());
    if (!hasValues) {
      toast.error("Please fill in at least one field");
      return;
    }
    try {
      const updated = {
        connected: true,
        config: cloudConfigValues,
        lastSync: new Date().toISOString(),
      };
      await saveCloudMutation.mutateAsync({
        category: "backup_cloud",
        settings: { [id]: JSON.stringify(updated) },
      });
      cloudSettingsQuery.refetch();
      toast.success(
        `${cloudConfigDialog.name} configuration saved to database`,
      );
      setCloudConfigDialog(null);
      setCloudConfigValues({});
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
    }
  };

  const disconnectCloud = async (providerId: string) => {
    try {
      await saveCloudMutation.mutateAsync({
        category: "backup_cloud",
        settings: {
          [providerId]: JSON.stringify({ connected: false, config: {} }),
        },
      });
      cloudSettingsQuery.refetch();
      toast.success("Disconnected successfully");
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`);
    }
  };

  const clearLog = () => {
    saveBackupLog([]);
    toast.success("Backup history cleared");
  };

  /* ═══════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-[var(--theme-primary)]" />
            Backup & Export
          </h1>
          <p className="text-white/50 mt-1">
            Export real data from your database and manage cloud backups
          </p>
        </div>
        <Button
          onClick={handleFullBackup}
          disabled={isExporting}
          className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Shield className="w-4 h-4 mr-1" />
          )}
          {isExporting ? "Creating..." : "Full Backup Now"}
        </Button>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <Database className="w-5 h-5 text-[var(--theme-primary)] mx-auto mb-1" />
            <p className="text-white/50 text-xs">DB Tables</p>
            <p className="text-white font-bold text-sm mt-1">
              {sectionsQuery.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                exportSections.length
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <Archive className="w-5 h-5 text-[var(--theme-primary)] mx-auto mb-1" />
            <p className="text-white/50 text-xs">Total Records</p>
            <p className="text-white font-bold text-sm mt-1">
              {sectionsQuery.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                exportSections
                  .reduce((s, e) => s + e.recordCount, 0)
                  .toLocaleString()
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <History className="w-5 h-5 text-[var(--theme-primary)] mx-auto mb-1" />
            <p className="text-white/50 text-xs">Export History</p>
            <p className="text-white font-bold text-sm mt-1">
              {backupLog.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <Cloud className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-white/50 text-xs">Cloud Connected</p>
            <p className="text-purple-400 font-bold text-sm mt-1">
              {connectedCloudCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Main Tabs ─── */}
      <Tabs defaultValue="local" className="space-y-4">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger
            value="local"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <HardDrive className="w-4 h-4 mr-1.5" /> Export Data
          </TabsTrigger>
          <TabsTrigger
            value="cloud"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Cloud className="w-4 h-4 mr-1.5" /> Cloud Storage
            {connectedCloudCount > 0 && (
              <Badge className="ml-1.5 bg-green-400/20 text-green-400 border-0 text-[10px] px-1.5">
                {connectedCloudCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <History className="w-4 h-4 mr-1.5" /> History
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-[var(--theme-primary)]/20 data-[state=active]:text-[var(--theme-primary)]"
          >
            <Settings className="w-4 h-4 mr-1.5" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════
           TAB 1: Export Data (Real DB)
           ════════════════════════════════════════════════════════ */}
        <TabsContent value="local" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Download className="w-5 h-5 text-[var(--theme-primary)]" />{" "}
                Export Database
              </CardTitle>
              <CardDescription className="text-white/50">
                Select tables to export. Record counts are live from your
                database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--theme-primary)]" />
                  <span className="text-white/50 ml-2">
                    Loading database tables...
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50 text-sm">
                      {selectedSections.length} of {exportSections.length}{" "}
                      tables selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExportSections((prev) =>
                            prev.map((s) => ({ ...s, enabled: true })),
                          )
                        }
                        className="text-white/40 hover:text-white text-xs h-7"
                      >
                        Select All
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExportSections((prev) =>
                            prev.map((s) => ({ ...s, enabled: false })),
                          )
                        }
                        className="text-white/40 hover:text-white text-xs h-7"
                      >
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {exportSections.map((section) => (
                      <div
                        key={section.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                          section.enabled
                            ? "bg-[var(--theme-primary)]/5 border-[var(--theme-primary)]/20"
                            : "bg-black/20 border-white/5"
                        }`}
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Database
                            className={`w-4 h-4 ${section.enabled ? "text-[var(--theme-primary)]" : "text-white/30"}`}
                          />
                          <div>
                            <p
                              className={`text-sm font-medium ${section.enabled ? "text-white" : "text-white/40"}`}
                            >
                              {section.label}
                            </p>
                            <p className="text-white/30 text-xs">
                              Table: {section.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`border-0 text-xs ${section.recordCount > 0 ? "bg-green-400/10 text-green-400" : "bg-white/5 text-white/30"}`}
                          >
                            {section.recordCount} records
                          </Badge>
                          <Switch
                            checked={section.enabled}
                            onCheckedChange={() => toggleSection(section.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Label className="text-white/70 text-sm">Format:</Label>
                    <Select
                      value={exportFormat}
                      onValueChange={setExportFormat}
                    >
                      <SelectTrigger className="w-[150px] bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">
                          <span className="flex items-center gap-2">
                            <FileJson className="w-3 h-3" /> JSON
                          </span>
                        </SelectItem>
                        <SelectItem value="csv">
                          <span className="flex items-center gap-2">
                            <FileSpreadsheet className="w-3 h-3" /> CSV
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-black/30 rounded-lg p-3 border border-white/5 flex items-center justify-between text-sm">
                    <span className="text-white/50">
                      {selectedSections.length} tables selected
                    </span>
                    <span className="text-[var(--theme-primary)] font-medium">
                      {totalRecords.toLocaleString()} total records
                    </span>
                  </div>

                  <Button
                    onClick={handleExport}
                    disabled={isExporting || selectedSections.length === 0}
                    className="w-full bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)] disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />{" "}
                        Exporting from database...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" /> Export{" "}
                        {exportFormat.toUpperCase()}
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Import / Restore Section - REAL */}
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" /> Restore from Backup
              </CardTitle>
              <CardDescription className="text-white/50">
                Upload a JSON backup file exported from this system to restore
                data into the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  restoreFile
                    ? "border-[var(--theme-primary)]/50 bg-[var(--theme-primary)]/5"
                    : "border-white/10 hover:border-[var(--theme-primary)]/30"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.name.endsWith(".json")) {
                    setRestoreFile(file);
                    setRestoreResult(null);
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const data = JSON.parse(ev.target?.result as string);
                        setRestorePreview(data);
                      } catch {
                        toast.error("Invalid JSON file");
                      }
                    };
                    reader.readAsText(file);
                  } else {
                    toast.error("Only .json backup files are supported");
                  }
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".json";
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setRestoreFile(file);
                      setRestoreResult(null);
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        try {
                          const data = JSON.parse(ev.target?.result as string);
                          setRestorePreview(data);
                        } catch {
                          toast.error("Invalid JSON file");
                        }
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
              >
                {restoreFile ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-[var(--theme-primary)] mx-auto mb-3" />
                    <p className="text-white text-sm font-medium">
                      {restoreFile.name}
                    </p>
                    <p className="text-white/40 text-xs mt-1">
                      {(restoreFile.size / 1024).toFixed(1)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-white/20 mx-auto mb-3" />
                    <p className="text-white/50 text-sm mb-1">
                      Drop a backup file here or click to browse
                    </p>
                    <p className="text-white/30 text-xs">
                      Supports .json files exported from this system
                    </p>
                  </>
                )}
              </div>

              {/* Preview of backup contents */}
              {restorePreview?.sections && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white text-sm font-medium">
                      Backup Contents
                    </h4>
                    <Badge className="bg-white/5 text-white/60 border-0">
                      {restorePreview.exportedAt
                        ? new Date(
                            restorePreview.exportedAt,
                          ).toLocaleDateString()
                        : "Unknown date"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(restorePreview.sections).map(
                      ([key, section]: [string, any]) => (
                        <div
                          key={key}
                          className="bg-white/5 rounded-lg p-3 flex items-center justify-between"
                        >
                          <span className="text-white/70 text-sm">
                            {section.label || key}
                          </span>
                          <Badge className="bg-[var(--theme-primary)]/10 text-[var(--theme-primary)] border-0">
                            {section.recordCount} records
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white/50 text-xs mb-2">
                      Total:{" "}
                      {restorePreview.totalRecords ||
                        Object.values(restorePreview.sections).reduce(
                          (s: number, sec: any) => s + (sec.recordCount || 0),
                          0,
                        )}{" "}
                      records
                    </p>
                  </div>

                  {/* Restore Mode */}
                  <div className="flex items-center gap-4">
                    <Label className="text-white/70 text-sm">
                      Restore Mode:
                    </Label>
                    <Select
                      value={restoreMode}
                      onValueChange={(v: "merge" | "replace") =>
                        setRestoreMode(v)
                      }
                    >
                      <SelectTrigger className="w-48 bg-black/40 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--card)] border-white/10">
                        <SelectItem value="merge">
                          Merge (add new records)
                        </SelectItem>
                        <SelectItem value="replace">
                          Replace (delete existing first)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {restoreMode === "replace" && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-red-300 text-xs">
                        Replace mode will DELETE all existing records in the
                        selected tables before importing. This action cannot be
                        undone.
                      </p>
                    </div>
                  )}

                  {/* Restore Button */}
                  <Button
                    onClick={async () => {
                      if (!restorePreview?.sections) return;
                      setIsRestoring(true);
                      try {
                        const result = await restoreMutation.mutateAsync({
                          sections: restorePreview.sections,
                          mode: restoreMode,
                        });
                        setRestoreResult(result);
                        toast.success(
                          `Restored ${result.totalRestored} records successfully`,
                        );
                        // Refresh export sections count
                        sectionsQuery.refetch();
                        // Log it
                        const logEntry: BackupLogEntry = {
                          id: Date.now().toString(),
                          type: "backup",
                          name: `Restore from ${restoreFile?.name || "backup"}`,
                          date: new Date().toISOString(),
                          sections: Object.keys(restorePreview.sections),
                          format: "json",
                          recordCount: result.totalRestored,
                          status: "completed",
                        };
                        saveBackupLog([logEntry, ...backupLog].slice(0, 50));
                      } catch (err: any) {
                        toast.error(
                          `Restore failed: ${err.message || "Unknown error"}`,
                        );
                      } finally {
                        setIsRestoring(false);
                      }
                    }}
                    disabled={isRestoring}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isRestoring ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                        Restoring...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" /> Restore{" "}
                        {Object.keys(restorePreview.sections).length} Sections
                      </>
                    )}
                  </Button>

                  {/* Restore Result */}
                  {restoreResult && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span className="text-green-300 font-medium">
                          Restore Complete
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white/5 rounded-lg p-2">
                          <p className="text-green-400 font-bold text-lg">
                            {restoreResult.totalRestored}
                          </p>
                          <p className="text-white/40 text-xs">Restored</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <p className="text-yellow-400 font-bold text-lg">
                            {restoreResult.totalSkipped}
                          </p>
                          <p className="text-white/40 text-xs">
                            Skipped (duplicates)
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <p className="text-red-400 font-bold text-lg">
                            {restoreResult.totalErrors}
                          </p>
                          <p className="text-white/40 text-xs">Errors</p>
                        </div>
                      </div>
                      {restoreResult.details && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(restoreResult.details).map(
                            ([key, detail]: [string, any]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-white/50">{key}</span>
                                <span className="text-white/70">
                                  {detail.restored} restored, {detail.skipped}{" "}
                                  skipped, {detail.errors} errors
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Clear file */}
              {restoreFile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 text-white/50"
                  onClick={() => {
                    setRestoreFile(null);
                    setRestorePreview(null);
                    setRestoreResult(null);
                  }}
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Clear File
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
           TAB 2: Cloud Storage (Real DB-backed)
           ════════════════════════════════════════════════════════ */}
        <TabsContent value="cloud" className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">
                  Cloud Storage Integration
                </p>
                <p className="text-white/50 text-xs mt-1">
                  Connect your cloud storage accounts by providing your API
                  credentials below. All credentials are encrypted and stored
                  securely in the database. Cloud upload functionality requires
                  valid API keys.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {CLOUD_PROVIDERS.map((provider) => {
              const config = cloudConfigs[provider.id];
              const isConnected = config?.connected === true;
              return (
                <Card
                  key={provider.id}
                  className={`bg-black/40 border transition-all ${isConnected ? "border-green-500/20" : "border-white/10"}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl ${provider.bgColor} flex items-center justify-center ${provider.color} font-bold text-lg`}
                        >
                          {provider.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">
                              {provider.name}
                            </h3>
                            <Badge
                              className={`border-0 text-[10px] ${isConnected ? "bg-green-400/10 text-green-400" : "bg-white/5 text-white/30"}`}
                            >
                              {isConnected ? "Connected" : "Not Connected"}
                            </Badge>
                          </div>
                          <p className="text-white/50 text-sm mt-1">
                            {provider.description}
                          </p>
                          {isConnected && config?.lastSync && (
                            <p className="text-white/30 text-xs mt-1">
                              Last configured:{" "}
                              {new Date(config.lastSync).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCloudConfigDialog(provider);
                                setCloudConfigValues(config?.config || {});
                              }}
                              className="border-white/10 text-white/50 hover:text-white bg-transparent"
                            >
                              <Settings className="w-3.5 h-3.5 mr-1" />{" "}
                              Configure
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => disconnectCloud(provider.id)}
                              className="border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent"
                            >
                              <Unlink className="w-3.5 h-3.5 mr-1" /> Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            onClick={() => {
                              setCloudConfigDialog(provider);
                              setCloudConfigValues({});
                            }}
                            className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]"
                          >
                            <Link2 className="w-3.5 h-3.5 mr-1" /> Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
           TAB 3: History (Real log)
           ════════════════════════════════════════════════════════ */}
        <TabsContent value="history" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <History className="w-5 h-5 text-[var(--theme-primary)]" />{" "}
                  Export & Backup History
                </CardTitle>
                {backupLog.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearLog}
                    className="text-red-400/50 hover:text-red-400 text-xs"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Clear History
                  </Button>
                )}
              </div>
              <CardDescription className="text-white/50">
                Log of all exports and backups performed from this browser
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupLog.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="w-10 h-10 text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No backup history yet</p>
                  <p className="text-white/20 text-xs mt-1">
                    Export data from the Export tab to see history here
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {backupLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        {entry.type === "export" ? (
                          <Download className="w-4 h-4 text-[var(--theme-primary)]" />
                        ) : entry.type === "backup" ? (
                          <Shield className="w-4 h-4 text-green-400" />
                        ) : (
                          <CloudUpload className="w-4 h-4 text-purple-400" />
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">
                            {entry.name}
                          </p>
                          <p className="text-white/30 text-xs">
                            {new Date(entry.date).toLocaleString()} |{" "}
                            {entry.recordCount} records |{" "}
                            {entry.format.toUpperCase()} |{" "}
                            {entry.sections.length} tables
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={entry.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════
           TAB 4: Settings (Saved to DB)
           ════════════════════════════════════════════════════════ */}
        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-[var(--theme-primary)]" />{" "}
                Backup Settings
              </CardTitle>
              <CardDescription className="text-white/50">
                Settings are saved to the database and persist across sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                <div>
                  <p className="text-white text-sm font-medium">Auto Backup</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    Automatically create backups on a schedule
                  </p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              {autoBackup && (
                <div className="flex items-center gap-3 pl-4">
                  <Label className="text-white/70 text-sm">Frequency:</Label>
                  <Select
                    value={backupFrequency}
                    onValueChange={setBackupFrequency}
                  >
                    <SelectTrigger className="w-[180px] bg-black/40 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-white/5">
                <div>
                  <p className="text-white text-sm font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[var(--theme-primary)]" />{" "}
                    Encrypt Backups
                  </p>
                  <p className="text-white/40 text-xs mt-0.5">
                    Add encryption to exported backup files
                  </p>
                </div>
                <Switch
                  checked={encryptBackups}
                  onCheckedChange={setEncryptBackups}
                />
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-white/70 text-sm">
                  Retention (days):
                </Label>
                <Input
                  type="number"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(e.target.value)}
                  className="w-[120px] bg-black/40 border-white/10 text-white"
                  min="1"
                  max="365"
                />
              </div>

              <Button
                onClick={saveBackupSettings}
                disabled={saveSettingsMutation.isPending}
                className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]"
              >
                {saveSettingsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-1" />
                )}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══════════════════════════════════════════════════════════════
         Cloud Config Dialog
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!cloudConfigDialog}
        onOpenChange={() => {
          setCloudConfigDialog(null);
          setCloudConfigValues({});
        }}
      >
        <DialogContent className="bg-[var(--theme-surface)] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-3">
              {cloudConfigDialog && (
                <div
                  className={`w-10 h-10 rounded-xl ${cloudConfigDialog.bgColor} flex items-center justify-center ${cloudConfigDialog.color} font-bold`}
                >
                  {cloudConfigDialog.icon}
                </div>
              )}
              <div>
                <span>{cloudConfigDialog?.name} Configuration</span>
                <p className="text-white/40 text-xs font-normal mt-0.5">
                  Enter your API credentials to connect
                </p>
              </div>
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Credentials are stored securely in the database.{" "}
              {cloudConfigDialog?.name} requires valid API keys to function.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {cloudConfigDialog?.configFields.map((field) => (
              <div key={field.key}>
                <label className="text-white/70 text-sm font-medium mb-1.5 block">
                  {field.label}
                </label>
                <Input
                  type={field.type || "text"}
                  value={cloudConfigValues[field.key] || ""}
                  onChange={(e) =>
                    setCloudConfigValues((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  className="bg-black/40 border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCloudConfigDialog(null);
                setCloudConfigValues({});
              }}
              className="border-white/10 text-white/70"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCloudConfig}
              disabled={saveCloudMutation.isPending}
              className="bg-[var(--theme-primary)] text-black hover:bg-[var(--theme-accent)]"
            >
              {saveCloudMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Save & Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
