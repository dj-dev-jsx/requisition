import UsersLayout from "@/Layouts/UsersLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
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


export default function Items({ items }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <UsersLayout>
      <Head title="Items" />

      <div className="grid grid-cols-12 gap-6">

        {/* ITEMS GRID */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => addItem(item)}
              className="group bg-white border border-solid rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="h-40 bg-gray-50 flex items-center justify-center p-4">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="h-full object-contain group-hover:scale-105 transition"
                />
              </div>

              <div className="p-4 space-y-2">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                  {item.description}
                </h3>

                <p className="text-xs text-gray-500">
                  Available:{" "}
                  <span className="font-semibold text-gray-700">
                    {item.stock_quantity} {item.unit}
                  </span>
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(item);
                  }}
                  className="w-full mt-2 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 active:scale-[.98] transition"
                >
                  Add to Request
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* REQUEST SUMMARY */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border rounded-2xl shadow-sm p-5 sticky top-6">
            
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
                  className="flex items-center gap-3 border rounded-lg p-2 hover:bg-gray-50 transition"
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.description}
                    className="h-12 w-12 object-contain rounded-md border"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 line-clamp-1">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {item.stock_quantity}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* ✅ SUBMIT BUTTON */}
            {selectedItems.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    disabled={loading}
                    className="w-full mt-5 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    {loading
                      ? "Submitting..."
                      : `Submit Request (${selectedItems.length})`}
                  </button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Confirm Request
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to submit this request?
                      <br />
                      <span className="font-semibold">
                        {selectedItems.length} item(s)
                      </span>{" "}
                      will be sent for approval.
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
            )}
          </div>
        </div>

      </div>
    </UsersLayout>
  );
}