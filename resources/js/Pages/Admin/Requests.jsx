import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { DataTable } from "@/components/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Eye } from "lucide-react";
import { toast } from "sonner";

export default function Requests() {
  const { requests } = usePage().props; // eager loaded with user, items, ris
  const [printRequestId, setPrintRequestId] = useState(null);

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const columns = [
    { header: "Request #", accessorKey: "request_number" },
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
      header: "RIS Number",
      accessorFn: (row) => (row.ris ? row.ris.ris_number : "-"),
      id: "ris_number",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() || "-"}</span>
      ),
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
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Requests</h1>
            <p className="text-muted-foreground text-sm">
              Manage and view all user requests.
            </p>
          </div>
        </div>

        {/* Table Card */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Request List</CardTitle>
          </CardHeader>

          <CardContent>
            <DataTable columns={columns} data={requests} />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}