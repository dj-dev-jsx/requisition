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
    if (isNaN(qty)) qty = 0;
    if (qty > stock) {
      qty = stock;
      toast.error("Exceeds available stock");
    }
    if (qty < 0) qty = 0;
    setQuantities(prev => ({ ...prev, [id]: qty }));
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

  const allZero = Object.values(quantities).every(q => q === 0);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto p-4">
        {/* Header */}
        <Head title="Request Details"/>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Requisition & Issue Slip
            </h1>
            <p className="text-gray-500 mt-1">Issue items based on available stock</p>
          </div>
          <Badge className={`px-4 py-2 rounded-full font-semibold capitalize text-lg ${statusColor[request.status] || ""}`}>
            {request.status}
          </Badge>
        </div>

        {/* Requested User */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-blue-100 p-4 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Requested by</p>
              <p className="font-semibold text-lg text-gray-900">
                {request.user.firstname} {request.user.lastname}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="px-6 pt-6">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-gray-600" /> Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            {request.items.map(ri => {
              const stock = Number(ri.item.stock_quantity);
              const issued = quantities[ri.id];

              return (
                <div
                  key={ri.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200 bg-white"
                >
                  {/* Item Info */}
                  <div>
                    <p className="font-medium text-gray-900">{ri.item.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Stock:{" "}
                      <span className={`font-semibold px-2 py-1 rounded-full ${stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {stock}
                      </span>
                    </p>
                  </div>

                  {/* Issue Input */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Issue:</span>
                    {request.status === "pending" ? (
                      <input
                        type="number"
                        min="0"
                        max={stock}
                        value={issued}
                        onChange={e => handleChange(ri.id, e.target.value, stock)}
                        className="w-24 text-center border rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    ) : (
                      <span className="font-semibold text-gray-900">{issued}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Approve Button */}
        {request.status === "pending" && (
          <div className="flex justify-end mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  disabled={allZero}
                  className={`flex items-center gap-2 px-6 py-3 text-white font-semibold shadow-md rounded-lg transition
                    ${allZero ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}
                >
                  <CheckCircle className="w-5 h-5" /> Approve & Issue Items
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="bg-white rounded-xl shadow-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve and issue these items? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={approveRequest}>Approve</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}