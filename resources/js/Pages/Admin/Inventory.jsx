import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";

import { DataTable } from "@/components/DataTable";
import { columns } from "@/components/inventory-columns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export default function Inventory({ items }) {
  return (
    <AdminLayout>
      <Head title="Inventory" />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Items</h1>
            <p className="text-muted-foreground text-sm">
              Manage stock and inventory levels.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-green-200 hover:bg-green-300 shadow-md rounded-md border-none"
          >
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </div>

        {/* Table Card */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>Item List</CardTitle>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={[
                ...columns,
              ]}
              data={items}
            />
          </CardContent>
        </Card>
      </div>

    </AdminLayout>
  );
}