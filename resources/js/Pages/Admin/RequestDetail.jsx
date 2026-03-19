import React from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Button } from "@/components/ui/button";

export default function RequestDetail() {
  const { request } = usePage().props;

  const approveRequest = () => {
    router.post(`/admin/requests/${request.id}/approve`, {}, {
      onSuccess: () => {
        alert("Request approved!"); // or use a toast
        router.visit("/admin/requests"); // go back to requests list
      }
    });
  };

  return (
    <AdminLayout>
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">Request #{request.request_number}</h1>
        <p className="mb-4">Requested by: <strong>{request.user.firstname} {request.user.lastname}</strong></p>

        <h2 className="font-semibold mb-2">Items:</h2>
        <ul className="list-disc list-inside mb-4">
          {request.items.map((item) => (
            <li key={item.id}>
              {item.item.description} — {item.quantity}
            </li>
          ))}
        </ul>

        <Button onClick={approveRequest}>Approve Request</Button>
      </div>
    </AdminLayout>
  );
}