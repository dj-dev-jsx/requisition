import UsersLayout from "@/Layouts/UsersLayout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  Layers3,
} from "lucide-react";


export default function Items({ items, filters }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [search, setSearch] = useState(filters.search || "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const formatWhole = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? Math.trunc(num) : value;
  };

const canRequestItem = (item) => {
  return item.stock_quantity > 0 && item.status !== "out_of_stock";
};

const addItem = (item) => {
  if (!canRequestItem(item)) return;

  setSelectedItems((prev) => {
    if (prev.find((i) => i.id === item.id)) return prev;

    return [...prev, { ...item, quantity: 1 }];
  });
};

const getStockStatus = (item) => {
  if (item.status === "out_of_stock" || item.stock_quantity === 0) {
    return {
      label: "Out of Stock",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
    };
  } else if (item.status === "low_stock" || item.stock_quantity <= 5) {
    return {
      label: "Low Stock",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: AlertCircle,
    };
  } else {
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle,
    };
  }
};

const updateQuantity = (id, qty, maxStock) => {
  qty = Number(qty);

  if (isNaN(qty) || qty < 1) qty = 1;
  if (qty > maxStock) qty = maxStock;

  setSelectedItems((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    )
  );
};

const increaseQty = (item) => {
  if (item.quantity < item.stock_quantity) {
    updateQuantity(item.id, item.quantity + 1, item.stock_quantity);
  }
};

const decreaseQty = (item) => {
  if (item.quantity > 1) {
    updateQuantity(item.id, item.quantity - 1, item.stock_quantity);
  }
};

  const removeItem = (id) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/placeholder.png";
    return `${window.location.origin}/storage/${imagePath}`;
  };

const submitRequest = () => {
  if (selectedItems.length === 0) return;

  const invalidItems = selectedItems.filter((item) => !canRequestItem(item));
  if (invalidItems.length > 0) {
    setSelectedItems((prev) => prev.filter(canRequestItem));
    toast.error("Some selected items are no longer available. Please remove them before submitting.");
    return;
  }

  setLoading(true);

  router.post(
    route("requests.store"),
    {
      purpose,
      items: selectedItems.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
      })),
    },
    {
      onSuccess: () => {
        setSelectedItems([]);

        toast.success("Request submitted successfully!", {
          description: "Your request is now pending approval.",
        });
      },

      onError: () => {
        toast.error("Something went wrong!", {
          description: "Please try again.",
        });
      },

      onFinish: () => {
        setLoading(false);
      },
    }
  );
};

const handleSearch = (value) => {
  setSearch(value);

  router.get(
    route("user.items"), // adjust if your route name is different
    { search: value },
    {
      preserveState: true,
      replace: true,
    }
  );
};

const handlePreviewImage = (item) => {
  setPreviewItem(item);
  setPreviewOpen(true);
};

  const summaryItems = items.map((item) => {
    const stockStatus = getStockStatus(item);

    return {
      ...item,
      stockLabel: stockStatus.label,
      stockTone: stockStatus.color,
    };
  });

  useEffect(() => {
    const delay = setTimeout(() => {
      router.get(
        route("user.items"),
        { search },
        {
          preserveState: true,
          replace: true,
        }
      );
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  return (
  <UsersLayout>
    <Head title="Items" />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Browse Items
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Select items you need and submit a requisition request
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm backdrop-blur">
            {[
              { id: "browse", label: "Browse Items", icon: Layers3 },
              { id: "summary", label: "Items Summary", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "summary" ? (
          <div className="pb-8">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
              <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 px-6 py-6 text-white">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-blue-100">Items Summary</p>
                    <h2 className="mt-2 text-2xl font-semibold">Inventory overview</h2>
                    <p className="mt-1 text-sm text-slate-200">A clean, document-style summary of every item name, unit, and available quantity.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100 shadow-inner">
                    <span className="font-semibold text-white">{summaryItems.length}</span> item(s) listed
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 md:p-8">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 shadow-inner">
                  <div className="hidden md:grid md:grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr] border-b border-slate-200 bg-white text-xs uppercase tracking-[0.25em] text-slate-500">
                    <div className="px-5 py-4 font-semibold">Item Name</div>
                    <div className="px-5 py-4 font-semibold">Unit</div>
                    <div className="px-5 py-4 font-semibold">Quantity</div>
                    <div className="px-5 py-4 font-semibold">Status</div>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {summaryItems.map((item) => (
                      <article
                        key={item.id}
                        className="grid gap-3 px-4 py-4 transition-colors duration-200 hover:bg-white md:grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr] md:px-5 md:py-5"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900 md:text-base">{item.description}</p>
                          <p className="text-xs text-slate-500">Inventory item reference</p>
                        </div>
                        <div className="flex items-center text-sm text-slate-700">{item.unit || "Unit"}</div>
                        <div className="flex items-center text-sm font-semibold text-slate-900">{formatWhole(item.stock_quantity)}</div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${item.stockTone}`}>
                            {item.stockLabel}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 pb-96 sm:pb-0 w-full">
          {/* Items Grid */}
          <div className="w-full lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
              {items.map((item) => {
                const stockStatus = getStockStatus(item);
                const StatusIcon = stockStatus.icon;

                return (
                  <div
                    key={item.id}
                    className={`group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 ${
                      !canRequestItem(item) ? "opacity-60" : ""
                    }`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2 sm:p-3 md:p-4 relative overflow-hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewImage(item);
                        }}
                        className="h-full w-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300"
                      >
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.description}
                          className="h-full w-full object-contain"
                        />
                      </button>
                      <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color} flex items-center gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {stockStatus.label}
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-3">
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {item.description}
                      </h3>

                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">
                          Available: <span className="font-semibold text-gray-900">{formatWhole(item.stock_quantity)} {item.unit}</span>
                        </span>
                      </div>

                      <button
                        disabled={!canRequestItem(item)}
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(item);
                        }}
                        className={`w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                          !canRequestItem(item)
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
                        }`}
                      >
                        {!canRequestItem(item) ? (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            Unavailable
                          </>
                        ) : (
                          <>
                            <Plus className="h-3.5 w-3.5" />
                            Add to Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="sm:max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900">Preview Item Image</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <img
                  src={previewItem ? getImageUrl(previewItem.image) : "/img/placeholder.png"}
                  alt={previewItem?.description || "Item Preview"}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-3xl border border-slate-200 shadow-lg"
                />
                <p className="mt-4 text-sm text-gray-600">{previewItem?.description}</p>
              </div>
              <DialogFooter className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                >
                  Close
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Desktop Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5 md:p-6 sticky top-4 md:top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <ShoppingCart className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Request Summary
                </h2>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Package className="h-10 sm:h-12 w-10 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-xs sm:text-sm text-gray-500">No items selected yet</p>
                  <p className="text-xs text-gray-400 mt-1">Click on items to add them</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto mb-4 sm:mb-6">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-2 sm:gap-4 border border-gray-200 rounded-xl p-2 sm:p-4 hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={getImageUrl(item.image)}
                          className="h-14 sm:h-16 w-14 sm:w-16 object-contain rounded-lg border border-gray-200 bg-white flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-2 mb-1 sm:mb-2">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500 mb-1 sm:mb-2">
                            Available: {formatWhole(item.stock_quantity)} {item.unit}
                          </p>

                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => decreaseQty(item)}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>

                            <input
                              type="number"
                              min="1"
                              max={formatWhole(item.stock_quantity)}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, e.target.value, item.stock_quantity)
                              }
                              className="w-12 sm:w-16 text-center border border-gray-300 rounded-md py-1 text-xs sm:text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />

                            <button
                              onClick={() => increaseQty(item)}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>

                            <span className="text-xs text-gray-500 ml-1">
                              {item.unit}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Purpose of Request
                      </label>
                      <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Please describe why you need these items..."
                        className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                        rows={3}
                      />
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-sm sm:text-base font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <Send className="h-4 w-4" />
                          Submit Request ({selectedItems.reduce((total, item) => total + item.quantity, 0)} items)
                        </button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 sm:p-6">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-green-600" />
                            Confirm Request
                          </AlertDialogTitle>
                          <AlertDialogDescription className="space-y-2">
                            <p>You're about to submit a request for:</p>
                            <p className="font-medium text-gray-900">
                              {selectedItems.reduce((total, item) => total + item.quantity, 0)} items
                            </p>
                            <p><strong>Purpose:</strong> {purpose || "Not specified"}</p>
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={submitRequest}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Submit
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Floating Summary */}
        {selectedItems.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 max-h-[70vh] sm:max-h-[75vh] overflow-hidden">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    {selectedItems.reduce((total, item) => total + item.quantity, 0)} item(s) selected
                  </p>
                </div>
              </div>

              {/* Selected Items List */}
              <div className="max-h-32 sm:max-h-40 overflow-y-auto mb-2 sm:mb-3 space-y-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 border border-gray-200 rounded-lg p-2 bg-gray-50"
                  >
                    <img
                      src={getImageUrl(item.image)}
                      className="h-8 sm:h-10 w-8 sm:w-10 object-contain rounded border bg-white flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => decreaseQty(item)}
                          className="p-0.5 bg-gray-200 hover:bg-gray-300 rounded text-xs transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-medium min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQty(item)}
                          className="p-0.5 bg-gray-200 hover:bg-gray-300 rounded text-xs transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="text-xs text-gray-500">
                          / {formatWhole(item.stock_quantity)} {item.unit}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Purpose of request..."
                className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm mb-2 sm:mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                rows={2}
              />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
                    <Send className="h-4 w-4" />
                    Submit Request
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="w-[90vw] sm:max-w-md bg-white border border-gray-200 shadow-2xl rounded-2xl p-4 sm:p-6">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-green-600" />
                      Confirm Request
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>You're about to submit a request for:</p>
                      <p className="font-medium text-gray-900">
                        {selectedItems.reduce((total, item) => total + item.quantity, 0)} items
                      </p>
                      <p><strong>Purpose:</strong> {purpose || "Not specified"}</p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={submitRequest}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  </UsersLayout>
);
}