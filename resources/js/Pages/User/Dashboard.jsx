import UsersLayout from "@/Layouts/UsersLayout";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard({ dashboard, user }) {

  const recentRequestColumns = [
    { header: "Item", accessorKey: "item" },
    { header: "Quantity", accessorKey: "quantity" },
    { header: "Status", accessorKey: "status" },
    { header: "Date", accessorKey: "date" },
  ];

  return (
    <UsersLayout>
      <Head title="Dashboard" />
          <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-semibold text-gray-800">Welcome, {user.firstname} {user.lastname}</h1>
      </div>
      <div className="p-6 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-blue-500 text-white shadow-md rounded-xl p-4">
            <CardHeader><CardTitle>Total Requests</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{dashboard.total_requests}</CardContent>
          </Card>

          <Card className="bg-yellow-500 text-white shadow-md rounded-xl p-4">
            <CardHeader><CardTitle>Pending Requests</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{dashboard.pending_requests}</CardContent>
          </Card>

          <Card className="bg-green-500 text-white shadow-md rounded-xl p-4">
            <CardHeader><CardTitle>Approved Requests</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{dashboard.approved_requests}</CardContent>
          </Card>
        </div>

        {/* Requests Over Time Chart */}
        <Card className="shadow-md rounded-xl p-4">
          <CardTitle className="mb-2">Requests Over Last 7 Days</CardTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboard.requests_over_time}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="request_count" stroke="#82ca9d" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Requests Table */}
        <Card className="shadow-md rounded-xl">
          <CardHeader><CardTitle>Recent Requests</CardTitle></CardHeader>
          <CardContent>
            <DataTable columns={recentRequestColumns} data={dashboard.recent_requests} />
          </CardContent>
        </Card>
      </div>
    </UsersLayout>
  );
}