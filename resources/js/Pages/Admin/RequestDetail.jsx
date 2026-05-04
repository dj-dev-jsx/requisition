import React, { useState } from "react";
import { usePage, router, Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, User, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function RequestDetail() {
  const { request } = usePage().props;

  const [quantities, setQuantities] = useState(
    request.items.reduce((acc, item) => {
      acc[item.id] = Math.min(Number(item.quantity), Number(item.item.stock_quantity));
      return acc;
    }, {})
  );

  const handleChange = (id, value, stock) => {
    let qty = Number(value);
    if (Number.isNaN(qty)) qty = 0;
    if (qty > stock) {
      qty = stock;
      toast.error("Exceeds available stock");
    }
    if (qty < 0) qty = 0;
    setQuantities((prev) => ({ ...prev, [id]: qty }));
  };

  const approveRequest = () => {
    router.post(
      `/admin/requests/${request.id}/approve`,
      { items: quantities },
      {
        onSuccess: () => {
          toast.success("Request approved!");
          window.open(`/admin/requests/${request.id}/print`, "_blank");
        },
      }
    );
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <AdminLayout>
      <Head title="Request Details" />
      <div className="min-h-screen bg-slate-50 py-6">
        <div className="max-w-5xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-[0.2em] mb-2">Request detail</p>
              <h1 className="text-3xl font-semibold text-slate-900">Requisition & Issue Slip</h1>
              <p className="text-slate-500 mt-2">Issue items based on available stock for this request.</p>
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
                <ClipboardList className="w-5 h-5 text-slate-700" /> Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6 pt-6">
              {request.items.map((ri) => {
                const stock = Number(ri.item.stock_quantity);
                const issued = quantities[ri.id];

                return (
                  <div
                    key={ri.id}
                    className="grid grid-cols-1 md:grid-cols-[1.7fr_0.8fr_1fr] gap-4 p-4 border border-slate-200 rounded-3xl bg-slate-50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{ri.item.description}</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Stock:{" "}
                        <span
                          className={`font-semibold px-2 py-1 rounded-full ${
                            stock === 0
                              ? "bg-red-100 text-red-700"
                              : stock <= 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {stock === 0
                            ? "Out of Stock"
                            : stock <= 5
                            ? `Low Stock (${stock})`
                            : stock}
                        </span>
                      </p>
                    </div>
                    <div className="rounded-3xl bg-white border border-slate-200 p-4 text-center">
                      <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">Requested</p>
                      <p className="mt-2 text-2xl font-semibold text-blue-600">{ri.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className="text-sm text-slate-500">Issue</span>
                      {request.status === "pending" ? (
                        <input
                          type="number"
                          min="0"
                          max={stock}
                          value={issued}
                          onChange={(e) => handleChange(ri.id, e.target.value, stock)}
                          className="w-28 text-center border border-slate-200 rounded-2xl px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 outline-none"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900">{issued}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {request.status === "pending" && (
            <div className="flex justify-end mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className= "flex items-center gap-2 px-6 py-3 font-semibold rounded-2xl shadow-lg transition bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                  
                  >
                    <CheckCircle className="w-5 h-5" /> Approve & Issue Items
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold text-slate-900">Confirm approval</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm text-slate-500 mt-2">
                      Are you sure you want to approve and issue these items? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-end gap-3 mt-6">
                    <AlertDialogCancel className="rounded-2xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-2xl !bg-blue-600 !text-white hover:!bg-blue-700 px-4 py-2"
                      onClick={approveRequest}
                    >
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
