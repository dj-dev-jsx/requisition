import UsersLayout from "@/Layouts/UsersLayout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
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
  Send
} from "lucide-react";


export default function Items({ items, filters }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [search, setSearch] = useState(filters.search || "");

const addItem = (item) => {
  setSelectedItems((prev) => {
    if (prev.find((i) => i.id === item.id)) return prev;

    return [...prev, { ...item, quantity: 1 }];
  });
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
const getStockStatus = (qty) => {
  if (qty === 0) {
    return {
      label: "Out of Stock",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
    };
  } else if (qty <= 5) {
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
return (
  <UsersLayout>
    <Head title="Items" />
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Browse Items
          </h1>
          <p className="text-gray-600">
            Select items you need and submit a requisition request
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items Grid */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {items.map((item) => {
                const stockStatus = getStockStatus(item.stock_quantity);
                const StatusIcon = stockStatus.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.stock_quantity > 0) addItem(item);
                    }}
                    className={`group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer ${
                      item.stock_quantity === 0 ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color} flex items-center gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {stockStatus.label}
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {item.description}
                      </h3>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          Available: <span className="font-semibold text-gray-900">{item.stock_quantity} {item.unit}</span>
                        </span>
                      </div>

                      <button
                        disabled={item.stock_quantity === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(item);
                        }}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 ${
                          item.stock_quantity === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
                        }`}
                      >
                        {item.stock_quantity === 0 ? (
                          <>
                            <XCircle className="h-4 w-4" />
                            Unavailable
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
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

          {/* Desktop Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Request Summary
                </h2>
              </div>

              {selectedItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No items selected yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click on items to add them</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                      >
                        <img
                          src={getImageUrl(item.image)}
                          className="h-16 w-16 object-contain rounded-lg border border-gray-200 bg-white"
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                            {item.description}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            Available: {item.stock_quantity} {item.unit}
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => decreaseQty(item)}
                              className="p-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>

                            <input
                              type="number"
                              min="1"
                              max={item.stock_quantity}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, e.target.value, item.stock_quantity)
                              }
                              className="w-16 text-center border border-gray-300 rounded-md py-1 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
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
                          className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose of Request
                      </label>
                      <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Please describe why you need these items..."
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                        rows={3}
                      />
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <Send className="h-4 w-4" />
                          Submit Request ({selectedItems.reduce((total, item) => total + item.quantity, 0)} items)
                        </button>
                      </AlertDialogTrigger>

                      <AlertDialogContent className="sm:max-w-md">
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
                            Yes, Submit
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
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 max-h-[80vh] overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <p className="text-sm font-medium text-gray-900">
                    {selectedItems.reduce((total, item) => total + item.quantity, 0)} item(s) selected
                  </p>
                </div>
              </div>

              {/* Selected Items List */}
              <div className="max-h-48 overflow-y-auto mb-3 space-y-2">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 border border-gray-200 rounded-lg p-2 bg-gray-50"
                  >
                    <img
                      src={getImageUrl(item.image)}
                      className="h-10 w-10 object-contain rounded border bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => decreaseQty(item)}
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-xs transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-xs font-medium min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQty(item)}
                          className="p-1 bg-gray-200 hover:bg-gray-300 rounded text-xs transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="text-xs text-gray-500">
                          / {item.stock_quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
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
                className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                rows={2}
              />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
                    <Send className="h-4 w-4" />
                    Submit Request
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent className="sm:max-w-md">
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
                      Yes, Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>
    </div>
  </UsersLayout>
);
}