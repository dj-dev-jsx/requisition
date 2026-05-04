import { usePage, router, Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { DataTable } from "@/components/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Eye, Search, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";

export default function Requests() {
  const { requests, filters } = usePage().props;

const [search, setSearch] = useState(filters?.search || "");

const [month, setMonth] = useState("");
const [year, setYear] = useState("");
useEffect(() => {
  const delay = setTimeout(() => {
    router.get(
      route("admin.requests"),
      {
        search,
        month,
        year,
      },
      {
        preserveState: true,
        replace: true,
      }
    );
  }, 400);

  return () => clearTimeout(delay);
}, [search, month, year]);

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const columns = [
    { header: "Request #", accessorKey: "id", id: "id"  },
    { 
      header: "Requested By", 
      accessorFn: (row) => `${row.user.firstname} ${row.user.lastname}`, 
      id: "user"
    },
    { 
      header: "Status", 
      accessorFn: (row) => row.status, 
      id: "status",
      cell: ({ getValue }) => (
        <Badge className={`px-3 py-1 rounded-full text-sm ${statusColor[getValue()] || ""} capitalize`}>
          {getValue()}
        </Badge>
      )
    },
    {
        header: "Purpose",
        accessorKey: "purpose",
    },
    { 
      header: "Approved At", 
      accessorKey: "approved_at",
      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleString() : "-",
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 rounded-2xl bg-slate-100 text-slate-900 hover:bg-slate-200 px-3 py-2"
            onClick={() => router.visit(`/admin/requests/${row.original.id}`)}
          >
            <Eye className="w-4 h-4" /> View
          </Button>
            <Button
              size="sm"
              className="flex items-center gap-1 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 px-3 py-2"
              onClick={() => window.open(`/admin/requests/${row.original.id}/print`, "_blank")}
            >
              <Printer className="w-4 h-4" /> Print
            </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Head title="Requests" />
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                  <ClipboardList className="text-white w-6 h-6" />
                </div>
                <h1 className="text-4xl font-bold text-blue-700">Requests Management</h1>
              </div>
              <p className="text-gray-500 text-base">
                View, approve, and export requisition slips with clarity.
              </p>
            </div>

            <Button
              onClick={() => {
                window.location.href = route('ris.export', {
                  month,
                  year,
                });
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl rounded-lg px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Printer className="w-5 h-5" /> Export RIS
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900"
              >
                <option value="">All Months</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900"
              >
                <option value="">All Years</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Card */}
          <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-slate-900 text-white rounded-t-2xl px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Request List</CardTitle>
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {requests.total} total
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-2">
                Displaying {requests.data.length} of {requests.total} requests
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <DataTable columns={columns} data={requests.data} />
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <Button
                  disabled={!requests.prev_page_url}
                  onClick={() =>
                    requests.prev_page_url &&
                    router.get(requests.prev_page_url, {}, { preserveState: true })
                  }
                  className="px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </Button>

                {Array.from({ length: requests.last_page }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() =>
                      router.get(route('admin.requests'), { page, search, month, year }, { preserveState: true })
                    }
                    className={`px-4 py-2 rounded-2xl border ${requests.current_page === page ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  disabled={!requests.next_page_url}
                  onClick={() =>
                    requests.next_page_url &&
                    router.get(requests.next_page_url, {}, { preserveState: true })
                  }
                  className="px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}