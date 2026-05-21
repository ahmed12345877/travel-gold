import { TrendingUp, TrendingDown } from "lucide-react";

interface StatItem {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change?: number;
  changeType?: "increase" | "decrease";
  color: "primary" | "success" | "warning" | "danger" | "info";
}

const colorMap = {
  primary: "border-[var(--theme-primary)]/30 text-[var(--theme-primary)] bg-[var(--theme-primary)]/5",
  success: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  warning: "border-amber-500/30 text-amber-400 bg-amber-500/5",
  danger: "border-red-500/30 text-red-400 bg-red-500/5",
  info: "border-blue-500/30 text-blue-400 bg-blue-500/5",
};

interface StatsOverviewProps {
  stats: StatItem[];
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const TrendIcon = stat.changeType === "increase" ? TrendingUp : TrendingDown;
        
        return (
          <div
            key={idx}
            className={`bg-[var(--theme-surface)] border rounded-lg p-5 hover:border-[var(--theme-primary)]/30 transition-all duration-300 ${colorMap[stat.color]}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorMap[stat.color].split(" ")[0]}`}>
                <Icon size={20} />
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.changeType === "increase" ? "text-emerald-400" : "text-red-400"}`}>
                  <TrendIcon size={16} />
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">
              {stat.title}
            </p>
            <p className="text-white text-2xl font-bold">
              {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
