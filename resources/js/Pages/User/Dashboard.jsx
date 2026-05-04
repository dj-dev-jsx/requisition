import UsersLayout from "@/Layouts/UsersLayout";
import { Head } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Clock, CheckCircle, TrendingUp } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstname}!
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Here's an overview of your requisition requests
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <FileText className="h-4 w-4 text-blue-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboard.total_requests}</div>
                <p className="text-blue-200 text-xs">All time</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-yellow-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboard.pending_requests}</div>
                <p className="text-yellow-200 text-xs">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-200" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboard.approved_requests}</div>
                <p className="text-green-200 text-xs">Successfully processed</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Table Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Requests Over Time Chart */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle className="text-lg font-semibold">Requests Over Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboard.requests_over_time}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="request_count"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Requests Table */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Recent Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <DataTable columns={recentRequestColumns} data={dashboard.recent_requests} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UsersLayout>
  );
}