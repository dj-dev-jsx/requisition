import { usePage, router, Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { DataTable } from "@/components/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Eye } from "lucide-react";
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
            className="flex items-center gap-1 bg-blue-200 text-gray-800 hover:bg-blue-300 shadow-md rounded-sm"
            onClick={() => router.visit(`/admin/requests/${row.original.id}`)}
          >
            <Eye className="w-4 h-4" /> View
          </Button>
            <Button
              size="sm"
              className="flex items-center gap-1 bg-green-200 text-gray-800 hover:bg-green-300 shadow rounded-sm"
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
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
            <p className="text-muted-foreground text-sm">
              Manage and view all user requests.
            </p>
          </div>
          <div>
          {/* MONTH */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1  py-5 bg-green-200 text-gray-800 hover:bg-green-300 shadow rounded-xl"
              onClick={() => {
                window.location.href = route('ris.export', {
                  month,
                  year
                });
              }}
            >
              <Printer className="w-4 h-4" /> Export RIS
            </Button>
          </div>
        </div>

<div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
  
  {/* SEARCH */}
  <input
    type="text"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search requests..."
    className="w-full md:w-1/3 border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
  />
   <div className="flex items-center gap-3">
        <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-xl px-7 py-2 text-sm"
          >
            <option value="">All Months</option>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          {/* YEAR */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border rounded-xl px-7 py-2 text-sm"
          >
            <option value="">All Years</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
  </div>
</div>

        {/* Table Card */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Request List</CardTitle>
          </CardHeader>

<CardContent>
  <p className="text-sm text-gray-500 mb-2">
    Showing {requests.data.length} of {requests.total} requests
  </p>

  <DataTable columns={columns} data={requests.data} />

  {/* Pagination */}
  <div className="flex justify-center space-x-2 mt-4">
    {/* Previous button */}
    <Button
      disabled={!requests.prev_page_url}
      onClick={() =>
        requests.prev_page_url &&
        router.get(requests.prev_page_url, {}, { preserveState: true })
      }
      className="px-3 py-1"
    >
      Previous
    </Button>

    {/* Page numbers */}
    {Array.from({ length: requests.last_page }, (_, i) => i + 1).map((page) => (
      <Button
        key={page}
        onClick={() =>
          router.get(route('admin.requests'), { page, search, month, year }, { preserveState: true })
        }
        className={`px-3 py-1 ${requests.current_page === page ? 'bg-blue-500 text-white' : ''}`}
      >
        {page}
      </Button>
    ))}

    {/* Next button */}
    <Button
      disabled={!requests.next_page_url}
      onClick={() =>
        requests.next_page_url &&
        router.get(requests.next_page_url, {}, { preserveState: true })
      }
      className="px-3 py-1"
    >
      Next
    </Button>
  </div>
</CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}