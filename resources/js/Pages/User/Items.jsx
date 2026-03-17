import UsersLayout from "@/Layouts/UsersLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Items({ items }) {
  const [selectedItems, setSelectedItems] = useState([]);

  // Add item to summary
  const addItem = (item) => {
    setSelectedItems((prev) => {
      // Avoid duplicates
      if (prev.find((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  // Remove item from summary
  const removeItem = (id) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Helper to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/img/placeholder.png"; // fallback
    return `${window.location.origin}/storage/${imagePath}`;
  };

  return (
    <UsersLayout>
        <Head title="Items" />
      <div className="grid grid-cols-12 gap-6">

        {/* Items Grid */}
        <div className="col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
              onClick={() => addItem(item)}
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="h-30 object-contain"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-medium text-gray-700 line-clamp-2">
                  {item.description}
                </h3>
                <p className="text-sm text-gray-500">Stock: {item.stock_quantity}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(item);
                  }}
                  className="w-full mt-2 bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700 transition"
                >
                  Add to Request
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Request Summary Form */}
        <div className="col-span-4 bg-white border rounded-xl shadow-sm p-6 flex flex-col h-fit">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Request Summary
          </h2>

          {selectedItems.length === 0 && (
            <p className="text-sm text-gray-500">No items selected.</p>
          )}

          <div className="flex-1 space-y-4">
            {selectedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex-1 flex items-center gap-2">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.description}
                    className="h-10 w-10 object-contain rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.description}</p>
                    <p className="text-xs text-gray-500">Stock: {item.stock_quantity}</p>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-2 text-red-500 hover:text-red-700 transition text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {selectedItems.length > 0 && (
            <button
              className="mt-6 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Submit Request ({selectedItems.length} items)
            </button>
          )}
        </div>

      </div>
    </UsersLayout>
  );
}