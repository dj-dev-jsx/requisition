import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Box, Star, Clock, User, User2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const { dashboard } = usePage().props;

  // Columns for DataTables
  const lowStockColumns = [
    { header: "Item", accessorKey: "description" },
    { header: "Stock", accessorKey: "stock_quantity" },
    { header: "Unit", accessorKey: "unit" },
  ];

  console.log("Dashboard Data:", dashboard.recent_requests); // Debugging line

  const recentRequestColumns = [
    { header: "Item", accessorKey: "description"   },
    { header: "Quantity", accessorKey: "issued_quantity" },
    { header: "Requested By", accessorKey: "user" },
    { header: "Date", accessorKey: "date" },
  ];

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#9B5DE5"];

  return (
    <AdminLayout>
      <Head title="Dashboard" />

      <div className="p-6 space-y-8">
        {/* --- Summary Cards --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-md rounded-xl transform hover:scale-105 transition duration-300 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Total Items</CardTitle>
              <Box className="w-6 h-6" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{dashboard.total_items}</CardContent>
          </Card>

          <Card className="shadow-md rounded-xl transform hover:scale-105 transition duration-300 bg-gradient-to-r from-red-400 to-red-600 text-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Low Stock</CardTitle>
              <AlertTriangle className="w-6 h-6" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{dashboard.low_stock_items.length}</CardContent>
          </Card>

          <Card className="shadow-md rounded-xl transform hover:scale-105 transition duration-300 bg-gradient-to-r from-green-400 to-green-600 text-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Users</CardTitle>
              <User2 className="w-6 h-6" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{dashboard.total_users}</CardContent>
          </Card>

          <Card className="shadow-md rounded-xl transform hover:scale-105 transition duration-300 bg-gradient-to-r from-purple-400 to-purple-600 text-white">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Top Requests</CardTitle>
              <Clock className="w-6 h-6" />
            </CardHeader>
            <CardContent className="text-3xl font-bold">{dashboard.frequently_requested.length}</CardContent>
          </Card>
        </div>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Frequently Requested Items - Bar Chart */}
          <Card className="shadow-md rounded-xl p-4">
            <CardTitle className="mb-2">Top Requested Items</CardTitle>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboard.frequently_requested}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis dataKey="description" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="request_count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="shadow-md rounded-xl p-4">
  <CardTitle className="mb-2">Requests Over Time (Last 7 Days)</CardTitle>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={dashboard.requests_over_time}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="request_count"
        stroke="#82ca9d"
        strokeWidth={3}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
</Card>
        </div>

        {/* --- Low Stock Table --- */}
        <Card className="shadow-md rounded-xl">
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={lowStockColumns} data={dashboard.low_stock_items} />
          </CardContent>
        </Card>

        {/* --- Recent Requests Table --- */}
        <Card className="shadow-md rounded-xl">
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              key={dashboard.recent_requests.length} // ensures table rerenders when data changes
              columns={recentRequestColumns}
              data={dashboard.recent_requests}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}