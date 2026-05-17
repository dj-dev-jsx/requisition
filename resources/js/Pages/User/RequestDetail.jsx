import React from "react";
import { usePage, Head } from "@inertiajs/react";
import UsersLayout from "@/Layouts/UsersLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, User, AlertTriangle } from "lucide-react";

export default function RequestDetail() {
  const { request } = usePage().props;

  const formatWhole = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? Math.trunc(num) : value;
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <UsersLayout>
      <Head title="Request Details" />
      <div className="min-h-screen bg-slate-50 py-6">
        <div className="max-w-5xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-[0.2em] mb-2">Request detail</p>
              <h1 className="text-3xl font-semibold text-slate-900">Requisition & Issue Slip</h1>
              <p className="text-slate-500 mt-2">View the details of your request.</p>
              <p className="text-sm text-slate-500 mt-3">
                Request ID <span className="font-semibold text-slate-900">#{request.id}</span>
              </p>
            </div>
            <Badge
              className={`px-4 py-2 rounded-full font-semibold capitalize text-sm ${statusColor[request.status] || ""} shadow-sm`}
            >
              {request.status}
            </Badge>
          </div>

          {request.status === "rejected" && request.rejection_reason && (
            <Card className="shadow-sm border border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Rejection Reason</h3>
                    <p className="text-red-700">{request.rejection_reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6">
              <div className="bg-slate-100 p-4 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-slate-700" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Requested by</p>
                <p className="font-semibold text-lg text-slate-900">
                  {request.user.firstname} {request.user.lastname}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border border-slate-200 bg-white">
            <CardHeader className="px-6 pt-6 pb-4 border-b border-slate-200">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
                <ClipboardList className="w-5 h-5 text-slate-700" /> Items Requested
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6 pt-6">
              {request.items.map((ri) => (
                <div
                  key={ri.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_0.5fr] gap-4 p-4 border border-slate-200 rounded-3xl bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{ri.item.description}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="text-sm text-slate-500">Quantity:</span>
                    <span className="ml-2 font-semibold text-slate-900">{formatWhole(ri.quantity)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </UsersLayout>
  );
}