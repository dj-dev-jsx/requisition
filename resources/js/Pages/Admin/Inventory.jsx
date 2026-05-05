import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/DataTable";
import { getInventoryColumns } from "@/components/inventory-columns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Package, BarChart3, Scale, AlertTriangle, Check, Loader, Save, XCircle, Pencil, Upload } from "lucide-react";
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

export default function Inventory({ }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
  description: "",  
  image: "",
  stock_quantity: 0,
  unit: "",
});
const { items, filters } = usePage().props;

const [search, setSearch] = useState(filters?.search || "");

useEffect(() => {
  const delay = setTimeout(() => {
    router.get(
      route("admin.inventory"), // make sure this matches your route
      { search },
      {
        preserveState: true,
        replace: true,
      }
    );
  }, 400);

  return () => clearTimeout(delay);
}, [search]);

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
const [bulkOpen, setBulkOpen] = useState(false);
const [bulkFile, setBulkFile] = useState(null);
const [uploading, setUploading] = useState(false);
  return (
    <AdminLayout>
      <Head title="Inventory" />

      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Premium Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
                  <Package className="text-white w-6 h-6" />
                </div>
                <h1 className="text-4xl font-bold text-blue-700">
                  Inventory Management
                </h1>
              </div>
              <p className="text-gray-500 text-base ml-15">
                Track, manage, and optimize your stock levels with ease
              </p>
            </div>
          <Button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg rounded-lg px-6 py-3 font-semibold"
          >
            <Upload className="w-5 h-5" /> Bulk Upload
          </Button>
            <Button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl rounded-lg px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" /> Add New Item
            </Button>
          </div>

          {/* Search Bar with Modern Styling */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items by name, description, or unit..."
                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
            </div>
          </div>

          {/* Table Card with Premium Styling */}
          <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-slate-900 text-white rounded-t-2xl px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Inventory Items</CardTitle>
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {items.total} total
                </span>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                Displaying {items.data.length} of {items.total} items
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <DataTable columns={columns} data={items.data} />
              </div>

              {/* Modern Pagination */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page <span className="font-bold text-gray-900">{items.current_page}</span> of{' '}
                  <span className="font-bold text-gray-900">{items.last_page}</span>
                </div>
                <div className="flex justify-center items-center space-x-2">
                  {/* Previous button */}
                  <Button
                    disabled={!items.prev_page_url}
                    onClick={() =>
                      items.prev_page_url &&
                      router.get(items.prev_page_url, {}, { preserveState: true })
                    }
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    ← Previous
                  </Button>

                  {/* Page numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: items.last_page }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() =>
                          router.get(route('admin.inventory'), { page, search }, { preserveState: true })
                        }
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          items.current_page === page
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  {/* Next button */}
                  <Button
                    disabled={!items.next_page_url}
                    onClick={() =>
                      items.next_page_url &&
                      router.get(items.next_page_url, {}, { preserveState: true })
                    }
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border-0">
            <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
              {form.id ? (
                <>
                  <Pencil className="w-6 h-6 text-blue-600" /> Edit Item Details
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-blue-600" /> Add New Inventory Item
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description Field */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold text-gray-700 mb-2 block">
                Item Description
              </Label>
              <Input
                id="description"
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Enter a detailed item description"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {errors.description}
                </p>
              )}
            </div>

            {/* Image Upload Field */}
            <div>
              <Label htmlFor="image" className="text-base font-semibold text-gray-700 mb-2 block">
                Product Image
              </Label>
              <div className="relative">
                <Input
                  id="image"
                  name="image"
                  type="file"
                  onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-all duration-200 cursor-pointer"
                  accept="image/*"
                />
                <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG, WebP (Max 5MB)</p>
              </div>
              {errors.image && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {errors.image}
                </p>
              )}
            </div>

            {/* Stock Quantity & Unit - Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="stock_quantity" className="text-base font-semibold text-gray-700 mb-2 block">
                  Stock Quantity
                </Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={form.stock_quantity || ""}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
                {errors.stock_quantity && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.stock_quantity}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="unit" className="text-base font-semibold text-gray-700 mb-2 block">
                  Unit of Measurement
                </Label>
                <Input
                  id="unit"
                  name="unit"
                  value={form.unit || ""}
                  onChange={handleChange}
                  placeholder="e.g., pcs, kg, boxes"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
                {errors.unit && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.unit}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                {form.id ? (
                  <>
                    <Save className="w-4 h-4" /> Update Item
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save Item
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={restockOpen} onOpenChange={setRestockOpen}>
        <DialogContent className="sm:max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border-0">
            <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-amber-700 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-600" /> Restock Item
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleRestockSubmit} className="space-y-6">
            {/* Current Stock - Read Only */}
            <div>
              <Label htmlFor="current_stock" className="text-base font-semibold text-gray-700 mb-2 block">
                Current Stock Level
              </Label>
              <Input
                id="current_stock"
                name="current_stock"
                type="number"
                value={restockForm.current_stock}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-600 font-semibold cursor-not-allowed outline-none shadow-sm"
              />
            </div>

            {/* Additional Stock */}
            <div>
              <Label htmlFor="additional_stock" className="text-base font-semibold text-gray-700 mb-2 block">
                Quantity to Add
              </Label>
              <div className="relative">
                <Input
                  id="additional_stock"
                  name="additional_stock"
                  type="number"
                  min={1}
                  value={restockForm.additional_stock}
                  onChange={(e) =>
                    setRestockForm({ ...restockForm, additional_stock: e.target.value })
                  }
                  placeholder="Enter quantity"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-amber-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                New total: <span className="font-bold text-green-600">{parseInt(restockForm.current_stock || 0) + parseInt(restockForm.additional_stock || 0)}</span>
              </p>
            </div>

            <DialogFooter className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <Button
                type="button"
                onClick={() => setRestockOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Confirm Restock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Delete Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base mt-2">
              Are you sure you want to delete this item? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span><span className="font-bold">Warning:</span> All associated inventory records will be removed.</span>
            </p>
          </div>

          <AlertDialogFooter className="flex gap-3">
            <AlertDialogCancel className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              {deleting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Deleting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" /> Yes, Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
  <DialogContent className="sm:max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold text-indigo-700">
        Bulk Upload Items
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <Input
        type="file"
        accept=".xlsx,.csv"
        onChange={(e) => setBulkFile(e.target.files[0])}
      />

      <p className="text-sm text-gray-500">
        Upload Excel file with columns: <b>description, stock_quantity, unit</b>
      </p>

      <a
        href="/templates/inventory_template.xlsx"
        className="text-blue-600 text-sm underline"
      >
        Download Template
      </a>
    </div>

    <DialogFooter>
      <Button onClick={() => setBulkOpen(false)} variant="outline">
        Cancel
      </Button>

      <Button
        onClick={() => {
          if (!bulkFile) return toast.error("Please select a file");

          const formData = new FormData();
          formData.append("file", bulkFile);

          setUploading(true);

          router.post(route("admin.bulk_upload_items"), formData, {
            onSuccess: () => {
              toast.success("Items uploaded successfully!");
              setBulkOpen(false);
              setBulkFile(null);
            },
            onError: () => {
              toast.error("Upload failed.");
            },
            onFinish: () => setUploading(false),
          });
        }}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </AdminLayout>
  );
}