import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";

import { DataTable } from "@/components/DataTable";
import { getInventoryColumns } from "@/components/inventory-columns";

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

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export default function Inventory({ items }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
  description: "",
  image: "",
  stock_quantity: 0,
  unit: "",
});

const [deleteId, setDeleteId] = useState(null);
const [deleting, setDeleting] = useState(false);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
        formData.append(key, form[key]);
        }
    });

    if (form.id) {
        formData.append("_method", "PUT");

        router.post(route("admin.update_item", form.id), formData, {
        onSuccess: () => {
          setOpen(false);
          setForm({ description: "", image: null, stock_quantity: 0, unit: "" });
          toast.success(form.id ? "Item updated successfully!" : "Item added successfully!");
        },

        onError: (err) => {
          setErrors(err);
          toast.error("Please check the form fields.");
        },
        });
    } else {
        router.post(route("admin.add_item"), formData, {
        onSuccess: () => {
          setOpen(false);
          setForm({ description: "", image: null, stock_quantity: 0, unit: "" });
          toast.success(form.id ? "Item updated successfully!" : "Item added successfully!");
        },

        onError: (err) => {
          setErrors(err);
          toast.error("Please check the form fields.");
        },
        });
    }
    };

const handleEdit = (item) => {
  setForm({
    id: item.id,
    description: item.description,
    image: null,
    stock_quantity: item.stock_quantity,
    unit: item.unit,
  });

  setOpen(true);
};

const confirmDelete = (id) => {
  setDeleteId(id);
};

const handleDelete = () => {
  if (!deleteId) return;

  const id = deleteId;
  setDeleting(true);
  setDeleteId(null);

  router.delete(`/items/${id}`, {
    onSuccess: () => {
      toast.success("Item deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete item.");
    },
    onFinish: () => {
      setDeleting(false);
    },
  });
};

    const [restockOpen, setRestockOpen] = useState(false);
    const [restockForm, setRestockForm] = useState({
    item_id: null,
    additional_stock: 0,
    current_stock: 0, // new
    });

    const handleRestock = (id, currentStock) => {
    setRestockForm({ item_id: id, additional_stock: 0, current_stock: currentStock });
    setRestockOpen(true);
    };

    const handleRestockSubmit = (e) => {
  e.preventDefault();

  router.post(
    route("admin.restock_item"),
    {
      item_id: restockForm.item_id,
      additional_stock: restockForm.additional_stock,
    },
    {
      onSuccess: () => {
        setRestockOpen(false);
        setRestockForm({
          item_id: null,
          additional_stock: 0,
          current_stock: 0,
        });

        toast.success("Item restocked successfully!");
      },
      onError: () => {
        toast.error("Failed to restock item.");
      },
    }
  );
};

  const columns = getInventoryColumns(handleEdit, confirmDelete, handleRestock);

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
            <DataTable columns={columns} data={items} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>

    <DialogContent className="sm:max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6">
      <DialogHeader>
        <DialogTitle>{form.id ? "Edit Item" : "Add Item "}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Description</Label>
            <Input
              id="description"
              name="description"
              value={form.description || ""}
              onChange={handleChange}
              placeholder="Enter description"
              className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <Input
                id="image"
                name="image"
                type="file"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })} // handle File object
                className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
                />
            {errors.image && <p className="text-red-600 text-sm mt-1">{errors.image}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="stockQuantity">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            value={form.stock_quantity || ""}
            onChange={handleChange}
            placeholder="Enter stock quantity"
            className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
          />
          {errors.stock_quantity && <p className="text-red-600 text-sm mt-1">{errors.stock_quantity}</p>}
        </div>

        {/* Username */}
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            name="unit"
            value={form.unit || ""}
            onChange={handleChange}
            placeholder="Enter unit (e.g., pcs, kg)"
            className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
          />
          {errors.unit && <p className="text-red-600 text-sm mt-1">{errors.unit}</p>}
        </div>



        <DialogFooter className="mt-4">
          <Button type="submit" className="w-full sm:w-auto">
            {form.id ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
</Dialog>

<Dialog open={restockOpen} onOpenChange={setRestockOpen}>
  <DialogContent className="sm:max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
    <DialogHeader>
      <DialogTitle>Restock Item</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleRestockSubmit} className="space-y-4 mt-4">

      {/* Current Stock */}
      <div>
        <Label htmlFor="current_stock">Current Stock</Label>
        <Input
          id="current_stock"
          name="current_stock"
          type="number"
          value={restockForm.current_stock}
          readOnly
          className="shadow-sm focus:ring-2 focus:ring-gray-300 mt-2 bg-gray-100 cursor-not-allowed"
        />
      </div>

      {/* Additional Stock */}
      <div>
        <Label htmlFor="additional_stock">Add Quantity</Label>
        <Input
          id="additional_stock"
          name="additional_stock"
          type="number"
          min={1}
          value={restockForm.additional_stock}
          onChange={(e) =>
            setRestockForm({ ...restockForm, additional_stock: e.target.value })
          }
          placeholder="Enter quantity to add"
          className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
        />
      </div>

      <DialogFooter className="mt-4">
        <Button type="submit" className="w-full sm:w-auto">
          Restock
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
  <AlertDialogContent className="bg-white rounded-xl shadow-xl">
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Item?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the item.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>

      <AlertDialogAction
        onClick={handleDelete}
        disabled={deleting}
        className="bg-red-600 hover:bg-red-700"
      >
        {deleting ? "Deleting..." : "Yes, Delete"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </AdminLayout>
  );
}