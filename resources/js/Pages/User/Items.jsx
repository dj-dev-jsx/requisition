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


export default function Items({ items, filters }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [search, setSearch] = useState(filters.search || "");

  const addItem = (item) => {
    setSelectedItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
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
        quantity: 1,
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
      color: "bg-red-100 text-red-600",
    };
  } else if (qty <= 5) {
    return {
      label: "Low Stock",
      color: "bg-yellow-100 text-yellow-600",
    };
  } else {
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-600",
    };
  }
};
return (
  <UsersLayout>
    <Head title="Items" />

    <div className="flex flex-col gap-4 p-3 md:p-6">
      
      {/* SEARCH */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search items..."
        className="w-full md:w-1/2 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
      />

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4">
        
        {/* ITEMS GRID */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
  const stockStatus = getStockStatus(item.stock_quantity);

  return (
    <div
      key={item.id}
      onClick={() => {
        if (item.stock_quantity > 0) addItem(item);
      }}
      className={`group bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition cursor-pointer ${
        item.stock_quantity === 0 ? "opacity-60 cursor-not-allowed" : ""
      }`}
    >
      <div className="h-32 md:h-40 bg-gray-50 flex items-center justify-center p-3">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="h-full object-contain group-hover:scale-105 transition"
        />
      </div>

      <div className="p-3 space-y-1">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
          {item.description}
        </h3>

        {/* ✅ STOCK NUMBER */}
        <p className="text-xs text-gray-500">
          Available:{" "}
          <span className="font-semibold text-gray-700">
            {item.stock_quantity} {item.unit}
          </span>
        </p>

        {/* ✅ STATUS BADGE */}
        <span
          className={`inline-block text-[11px] px-2 py-1 rounded-full font-medium ${stockStatus.color}`}
        >
          {stockStatus.label}
        </span>

        <button
          disabled={item.stock_quantity === 0}
          onClick={(e) => {
            e.stopPropagation();
            addItem(item);
          }}
          className={`w-full mt-2 text-sm py-2 rounded-lg transition ${
            item.stock_quantity === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[.98]"
          }`}
        >
          {item.stock_quantity === 0 ? "Unavailable" : "Add"}
        </button>
      </div>
    </div>
  );
})}
        </div>

        {/* DESKTOP SUMMARY */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="bg-white border rounded-2xl shadow-sm p-5 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">
              Request Summary
            </h2>

            {selectedItems.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-10">
                No items selected
              </p>
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 border rounded-lg p-2"
                >
                  <img
                    src={getImageUrl(item.image)}
                    className="h-12 w-12 object-contain rounded-md border"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">
                      {item.description}
                    </p>
                    {(() => {
                      const stockStatus = getStockStatus(item.stock_quantity);
                      return (
                        <p className="text-xs">
                          <span className="text-gray-500">Stock:</span>{" "}
                          <span className="font-medium">{item.stock_quantity}</span>{" "}
                          <span className={`ml-1 px-2 py-[2px] rounded-full text-[10px] ${stockStatus.color}`}>
                            {stockStatus.label}
                          </span>
                        </p>
                      );
                    })()}
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {/* PURPOSE */}
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Purpose..."
                className="w-full mt-3 border rounded-lg p-2 text-sm"
                rows={3}
              />
            </div>

            {selectedItems.length > 0 && (
              <button
                onClick={submitRequest}
                className="w-full mt-4 bg-green-600 text-white py-2.5 rounded-lg"
              >
                Submit ({selectedItems.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ✅ MOBILE FLOATING SUMMARY */}
      {selectedItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-3 z-50">
          
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              {selectedItems.length} item(s) selected
            </p>
          </div>

          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Purpose..."
            className="w-full border rounded-lg p-2 text-sm mb-2"
            rows={2}
          />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full bg-green-600 text-white py-2.5 rounded-lg">
                Submit Request
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Confirm Request
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Submit {selectedItems.length} item(s)?
                  <br />
                  <strong>Purpose:</strong> {purpose || "N/A"}
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={submitRequest}>
                  Yes, Submit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  </UsersLayout>
);
}