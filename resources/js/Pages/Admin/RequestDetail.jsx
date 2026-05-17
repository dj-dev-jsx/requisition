import React, { useState } from "react";
import { usePage, router, Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, User, CheckCircle, XCircle } from "lucide-react";
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
import axios from "axios";

export default function RequestDetail() {
  const { request } = usePage().props;

  const [quantities, setQuantities] = useState(
    request.items.reduce((acc, item) => {
      acc[item.id] = Math.min(Number(item.quantity), Number(item.item.stock_quantity));
      return acc;
    }, {})
  );

  const [rejectionReason, setRejectionReason] = useState("");
  const [issueDate, setIssueDate] = useState(request.ris?.issue_date ?? "");

  const isApprovalBlocked = request.items.some(
    (ri) => Number(ri.item.stock_quantity) === 0 || ri.item.status === "out_of_stock"
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

  const approveRequest = async () => {
    if (isApprovalBlocked) {
      toast.error(
        "One or more items are out of stock. Please resolve the request before approving."
      );
      return;
    }

    try {
      const response = await axios.post(
        `/admin/requests/${request.id}/approve`,
        {
          items: quantities,
          issue_date: issueDate || null,
        }
      );

      toast.success("Request approved!");

      if (response.data.print_url) {
        window.open(response.data.print_url, "_blank");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to approve request."
      );
    }
  };

  const rejectRequest = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    router.post(
      `/admin/requests/${request.id}/reject`,
      { rejection_reason: rejectionReason },
      {
        onSuccess: () => {
          toast.success("Request rejected!");
          setRejectionReason("");
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

          {request.status === "rejected" && request.rejection_reason && (
            <Card className="shadow-sm border border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 p-2 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
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
            <>
              <Card className="shadow-sm border border-slate-200 bg-white">
                <CardContent className="p-6">
                  <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr] items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Issue Date</p>
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="mt-2 w-full max-w-xs rounded-2xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                    <p className="text-sm text-slate-500">
                      If you leave this blank, the Issue Date in the printable PDF will also remain blank.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col gap-3 justify-end mt-4">
                {isApprovalBlocked && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl p-3">
                    One or more items are out of stock. Approval is blocked until the inventory is restocked.
                  </p>
                )}
              <div className="flex justify-end gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 px-6 py-3 font-semibold rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                    >
                      <XCircle className="w-5 h-5" /> Reject Request
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-lg font-semibold text-slate-900">Reject Request</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-slate-500 mt-2">
                        Please provide a reason for rejecting this request. The user will be notified.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="mt-4">
                      <textarea
                        placeholder="Enter rejection reason..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full min-h-24 rounded-2xl border border-slate-200 p-3 focus:ring-2 focus:ring-red-500 bg-white text-slate-900 outline-none resize-none"
                        rows={4}
                      />
                    </div>
                    <AlertDialogFooter className="flex justify-end gap-3 mt-6">
                      <AlertDialogCancel className="rounded-2xl border border-slate-200 px-4 py-2 hover:bg-slate-50">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="!bg-red-600 !text-white hover:!bg-red-700 rounded-2xl px-4 py-2"
                        onClick={rejectRequest}
                      >
                        Reject Request
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={isApprovalBlocked}
                      className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-2xl shadow-lg transition ${
                        isApprovalBlocked
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                      }`}
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
                        disabled={isApprovalBlocked}
                        className={`rounded-2xl px-4 py-2 ${
                          isApprovalBlocked
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "!bg-blue-600 !text-white hover:!bg-blue-700"
                        }`}
                        onClick={approveRequest}
                      >
                        Approve
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
