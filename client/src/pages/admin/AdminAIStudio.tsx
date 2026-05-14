import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Users, Zap, TrendingUp, DollarSign } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function AdminAIStudio() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [creditsToAdd, setCreditsToAdd] = useState<number>(0);

  // Check if user is admin
  if (user?.role !== "admin") {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-400">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  // Mock data for admin dashboard
  const subscriptionStats = [
    { plan: "Free", users: 245, revenue: 0 },
    { plan: "Pro", users: 89, revenue: 2581 },
    { plan: "Enterprise", users: 12, revenue: 1188 },
  ];

  const usageStats = [
    { date: "Apr 1", images: 1240, videos: 120, edits: 89 },
    { date: "Apr 2", images: 1398, videos: 221, edits: 129 },
    { date: "Apr 3", images: 980, videos: 229, edits: 200 },
    { date: "Apr 4", images: 1908, videos: 200, edits: 221 },
    { date: "Apr 5", images: 2800, videos: 229, edits: 200 },
    { date: "Apr 6", images: 2390, videos: 200, edits: 221 },
    { date: "Apr 7", images: 2490, videos: 221, edits: 200 },
  ];

  const revenueStats = [
    { date: "Apr 1", revenue: 400 },
    { date: "Apr 2", revenue: 300 },
    { date: "Apr 3", revenue: 200 },
    { date: "Apr 4", revenue: 278 },
    { date: "Apr 5", revenue: 189 },
    { date: "Apr 6", revenue: 239 },
    { date: "Apr 7", revenue: 349 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Studio Management</h1>
        <p className="text-gray-400">
          Monitor and manage AI Studio usage and subscriptions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-[var(--theme-primary)]" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--theme-primary)]">
              346
            </div>
            <p className="text-gray-400 text-sm mt-2">+12 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-[var(--theme-primary)]" />
              Credits Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--theme-primary)]">
              12.5K
            </div>
            <p className="text-gray-400 text-sm mt-2">This month</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-[var(--theme-primary)]" />
              Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--theme-primary)]">
              8.2K
            </div>
            <p className="text-gray-400 text-sm mt-2">Images & Videos</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-[var(--theme-primary)]" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--theme-primary)]">
              $3,769
            </div>
            <p className="text-gray-400 text-sm mt-2">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Usage Chart */}
        <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
          <CardHeader>
            <CardTitle>Daily Usage</CardTitle>
            <CardDescription>AI generation activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4A853/20" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #D4A853",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="images"
                  stroke="#D4A853"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="videos"
                  stroke="#8B7355"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
            <CardDescription>Subscription revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4A853/20" />
                <XAxis dataKey="date" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #D4A853",
                  }}
                />
                <Bar dataKey="revenue" fill="#D4A853" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans Overview */}
      <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
        <CardHeader>
          <CardTitle>Subscription Plans Overview</CardTitle>
          <CardDescription>User distribution across plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--theme-primary)]/20">
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">
                    Users
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">
                    Revenue
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-300">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptionStats.map((stat, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[var(--theme-primary)]/10 hover:bg-[var(--theme-background)]/50 transition"
                  >
                    <td className="py-3 px-4 font-semibold text-[var(--theme-primary)]">
                      {stat.plan}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{stat.users}</td>
                    <td className="py-3 px-4 text-gray-300">${stat.revenue}</td>
                    <td className="py-3 px-4 text-gray-300">
                      {((stat.users / 346) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card className="bg-[#1a1a1a] border-[var(--theme-primary)]/20">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Add credits to user accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="User ID"
              type="number"
              className="bg-[var(--theme-background)] border-[var(--theme-primary)]/20 text-white"
              onChange={(e) => setSelectedUser(parseInt(e.target.value))}
            />
            <Input
              placeholder="Credits to add"
              type="number"
              className="bg-[var(--theme-background)] border-[var(--theme-primary)]/20 text-white"
              onChange={(e) => setCreditsToAdd(parseInt(e.target.value))}
            />
            <Button
              className="bg-[var(--theme-primary)] text-black hover:bg-[#E5B86B]"
              onClick={() => {
                if (selectedUser && creditsToAdd > 0) {
                  alert(
                    `Added ${creditsToAdd} credits to user ${selectedUser}`,
                  );
                  setCreditsToAdd(0);
                }
              }}
            >
              Add Credits
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Enter the user ID and number of credits to add. This will be logged
            as a bonus credit transaction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
