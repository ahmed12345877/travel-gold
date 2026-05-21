import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface ChartData {
  name: string;
  value?: number;
  bookings?: number;
  reviews?: number;
  revenue?: number;
  pending?: number;
  confirmed?: number;
  cancelled?: number;
  [key: string]: any;
}

const COLORS = ["#D4A853", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

export function BookingsTrendChart({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6">
      <h3 className="text-white font-[var(--font-display)] font-bold text-lg mb-4">الحجوزات (14 يوم)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis stroke="rgba(255,255,255,0.3)" />
          <YAxis stroke="rgba(255,255,255,0.3)" />
          <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(212,168,83,0.3)" }} />
          <Legend />
          <Line type="monotone" dataKey="bookings" stroke="#D4A853" strokeWidth={2} dot={{ fill: "#D4A853", r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChart({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6">
      <h3 className="text-white font-[var(--font-display)] font-bold text-lg mb-4">الإيرادات والحجوزات</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis stroke="rgba(255,255,255,0.3)" />
          <YAxis stroke="rgba(255,255,255,0.3)" />
          <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(212,168,83,0.3)" }} />
          <Legend />
          <Bar dataKey="revenue" fill="#10B981" />
          <Bar dataKey="bookings" fill="#D4A853" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BookingStatusPieChart({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6">
      <h3 className="text-white font-[var(--font-display)] font-bold text-lg mb-4">حالة الحجوزات</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReviewsRatingChart({ data }: { data: ChartData[] }) {
  return (
    <div className="bg-[var(--theme-surface)] border border-white/8 rounded-lg p-6">
      <h3 className="text-white font-[var(--font-display)] font-bold text-lg mb-4">تقييمات المستخدمين</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="rgba(255,255,255,0.3)" />
          <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" width={60} />
          <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(212,168,83,0.3)" }} />
          <Bar dataKey="value" fill="#F59E0B" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
