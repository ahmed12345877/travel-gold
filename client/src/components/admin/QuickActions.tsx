import { Plus, FileText, Send, Settings, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6">
      <h3 className="text-white font-[var(--font-display)] font-bold text-lg mb-4">إجراءات سريعة</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          const bgColor = {
            primary: "bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] text-black",
            secondary: "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30",
            danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30",
          };

          return (
            <button
              key={idx}
              onClick={action.onClick}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all duration-200 ${bgColor[action.variant || "secondary"]}`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium text-center">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
