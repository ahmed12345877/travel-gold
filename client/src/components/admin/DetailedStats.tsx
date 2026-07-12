import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";

interface StatDetail {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ElementType;
  color?: "primary" | "success" | "warning" | "danger";
}

interface DetailedStatsProps {
  title: string;
  stats: StatDetail[];
}

const colorMap = {
  primary: "text-[var(--theme-primary)]",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
};

export function DetailedStats({ title, stats }: DetailedStatsProps) {
  return (
    <Card className="bg-[var(--theme-surface)] border-white/8 p-6">
      <h3 className="text-white font-[var(--font-display)] font-bold text-lg mb-4">{title}</h3>
      <div className="space-y-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors">
              <div className="flex items-center gap-3">
                {Icon && <Icon size={18} className={colorMap[stat.color || "primary"]} />}
                <div>
                  <p className="text-white/50 text-sm">{stat.label}</p>
                  {stat.sublabel && <p className="text-white/30 text-xs">{stat.sublabel}</p>}
                </div>
              </div>
              <p className={`text-lg font-bold ${colorMap[stat.color || "primary"]}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
