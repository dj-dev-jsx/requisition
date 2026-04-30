
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Package,
  AlertTriangle,
  Users,
  TrendingUp,
  ArrowUpRight,
  Clock3,
  Bell,
  ShieldAlert,
  Layers3,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const { dashboard } = usePage().props;

  const cards = [
    {
      title: "Total Items",
      value: dashboard.total_items,
      icon: Package,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Low Stock",
      value: dashboard.low_stock_items.length,
      icon: AlertTriangle,
      color: "from-rose-500 to-red-500",
    },
    {
      title: "Users",
      value: dashboard.total_users,
      icon: Users,
      color: "from-emerald-500 to-green-600",
    },
    {
      title: "Requests",
      value: dashboard.frequently_requested.length,
      icon: TrendingUp,
      color: "from-violet-500 to-purple-600",
    },
  ];

  const pieData = [
    { name: "Healthy", value: 72 },
    { name: "Low", value: 18 },
    { name: "Out", value: 10 },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  return (
    <AdminLayout>
      <Head title="Dashboard" />

      <div className="min-h-screen bg-slate-100 p-6 space-y-6">
        {/* HERO */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">Welcome, Admin!</h1>
              <p className="text-blue-100 mt-2">
                Requisition And Issuance
              </p>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((item, i) => {
            const Icon = item.icon;

            return (
              <Card
                key={i}
                className="rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-xl"
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">{item.title}</p>
                    <h2 className="text-4xl font-bold text-slate-800 mt-2">
                      {item.value}
                    </h2>

                    <div className="mt-3 flex items-center gap-1 text-green-600 text-sm font-medium">
                      <ArrowUpRight className="w-4 h-4" />
                      +8.4%
                    </div>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${item.color} text-white flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* MAIN GRID */}
        <div className="grid xl:grid-cols-4 gap-6">
          {/* REQUEST CHART */}
          <Card className="xl:col-span-3 rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Request Analytics</CardTitle>
            </CardHeader>

            <CardContent className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard.requests_over_time}>
                  <defs>
                    <linearGradient id="req" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <Tooltip />

                  <Area
                    type="monotone"
                    dataKey="request_count"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#req)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* DONUT */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Stock Health</CardTitle>
            </CardHeader>

            <CardContent className="h-[340px]">
              <ResponsiveContainer width="100%" height="75%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 mt-3">
                {pieData.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ background: COLORS[i] }}
                      />
                      {item.name}
                    </span>
                    <span>{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECOND GRID */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* TOP ITEMS */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Top Requested</CardTitle>
            </CardHeader>

            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboard.frequently_requested}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="description" />
                  <Tooltip />
                  <Bar
                    dataKey="request_count"
                    radius={[10, 10, 0, 0]}
                    fill="#8b5cf6"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* QUICK INSIGHTS */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Inventory Usage</span>
                  <span>82%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[82%] bg-indigo-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Restock Priority</span>
                  <span>68%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[68%] bg-rose-500 rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Fulfillment Rate</span>
                  <span>94%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[94%] bg-emerald-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ALERTS */}
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Bell className="text-orange-500 w-5 h-5 mt-1" />
                <div>
                  <p className="font-medium">Low stock detected</p>
                  <p className="text-sm text-slate-500">
                    {dashboard.low_stock_items.length} items need refill.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ShieldAlert className="text-red-500 w-5 h-5 mt-1" />
                <div>
                  <p className="font-medium">Critical item warning</p>
                  <p className="text-sm text-slate-500">
                    Some items below minimum threshold.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Layers3 className="text-blue-500 w-5 h-5 mt-1" />
                <div>
                  <p className="font-medium">Inventory synced</p>
                  <p className="text-sm text-slate-500">
                    Database updated successfully.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ACTIVITY FEED */}
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>

          <CardContent className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {dashboard.recent_requests.slice(0, 6).map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-50 border flex gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Clock3 className="w-5 h-5" />
                </div>

                <div>
                  <p className="font-medium text-slate-800">
                    {item.user}
                  </p>
                  <p className="text-sm text-slate-500">
                    requested {item.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{item.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}