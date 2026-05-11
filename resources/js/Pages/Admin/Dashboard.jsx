
import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
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
  const { dashboard, filters, request_statuses, item_statuses, date_ranges } = usePage().props;
  const [activeFilters, setActiveFilters] = useState({
    date_range: filters?.date_range ?? 7,
    request_status: filters?.request_status ?? "all",
    item_status: filters?.item_status ?? "all",
  });

  useEffect(() => {
    setActiveFilters({
      date_range: filters?.date_range ?? 7,
      request_status: filters?.request_status ?? "all",
      item_status: filters?.item_status ?? "all",
    });
  }, [filters?.date_range, filters?.request_status, filters?.item_status]);

  const dateRangeOptions = date_ranges || [7, 14, 30];
  const requestStatusOptions = request_statuses || ["all", "pending", "processed", "rejected"];
  const itemStatusOptions = item_statuses || ["all", "in_stock", "low_stock", "out_of_stock"];

  const handleFilterChange = (field, rawValue) => {
    const value = field === "date_range" ? Number(rawValue) : rawValue;
    const updatedFilters = { ...activeFilters, [field]: value };
    setActiveFilters(updatedFilters);

    router.get(
      route("admin.admin_dashboard"),
      updatedFilters,
      { preserveState: true, replace: true }
    );
  };

  const cards = [
    {
      title: "Total Items",
      value: dashboard.total_items,
      icon: Package,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Low Stock",
      value: dashboard.low_stock_items?.length ?? 0,
      icon: AlertTriangle,
      color: "from-rose-500 to-red-500",
    },
    {
      title: "Restock Priority",
      value: `${dashboard.restock_need ?? 0}%`,
      icon: ShieldAlert,
      color: "from-fuchsia-500 to-pink-500",
    },
    {
      title: "Total Requests",
      value: dashboard.total_requests ?? 0,
      icon: TrendingUp,
      color: "from-violet-500 to-purple-600",
    },
  ];

  const stockHealthData = [
    {
      name: "In Stock",
      value: dashboard.inventory_status_breakdown?.find((item) => item.status === "in_stock")?.total ?? 0,
      color: "#10b981",
    },
    {
      name: "Low Stock",
      value: dashboard.inventory_status_breakdown?.find((item) => item.status === "low_stock")?.total ?? 0,
      color: "#f59e0b",
    },
    {
      name: "Out of Stock",
      value: dashboard.inventory_status_breakdown?.find((item) => item.status === "out_of_stock")?.total ?? 0,
      color: "#ef4444",
    },
  ];

  const stockTotal = stockHealthData.reduce((sum, item) => sum + item.value, 0);
  const pieData = stockHealthData.map((item) => ({
    ...item,
    percentage: stockTotal > 0 ? Math.round((item.value / stockTotal) * 100) : 0,
  }));

  const COLORS = stockHealthData.map((item) => item.color);
  const requestStatusData = dashboard.request_status_breakdown || [];
  const inventorySummaryData = dashboard.inventory_summary || [];

  const formatStatusLabel = (status) =>
    status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

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

        {/* FILTERS */}
        <Card className="rounded-3xl border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle>Dashboard Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Date Range</p>
              <select
                value={activeFilters.date_range}
                onChange={(event) => handleFilterChange('date_range', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900"
              >
                {dateRangeOptions.map((range) => (
                  <option key={range} value={range}>
                    Last {range} days
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Request Status</p>
              <select
                value={activeFilters.request_status}
                onChange={(event) => handleFilterChange('request_status', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900"
              >
                {requestStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Requests' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Item Status</p>
              <select
                value={activeFilters.item_status}
                onChange={(event) => handleFilterChange('item_status', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 bg-slate-50 text-slate-900"
              >
                {itemStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all'
                      ? 'All Items'
                      : status
                          .split('_')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

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
                    <span>{item.percentage}%</span>
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
                  <span>Fulfillment Rate</span>
                  <span>{dashboard.fulfillment_rate ?? 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Issued quantity compared to requested quantity
                </p>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${dashboard.fulfillment_rate ?? 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Restock Priority</span>
                  <span>{dashboard.restock_need ?? 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Percentage of items below the low stock threshold
                </p>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${dashboard.restock_need ?? 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Top Item Demand Share</span>
                  <span>{dashboard.top_item_share ?? 0}%</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Share of quantity for the most requested item
                </p>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${dashboard.top_item_share ?? 0}%` }}
                  />
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