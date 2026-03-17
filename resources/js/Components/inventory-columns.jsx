import { Pencil, Trash, PlusCircle } from "lucide-react";
import { Button } from "./ui/button";

export const getInventoryColumns = (handleEdit, handleDelete, handleRestock) => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.original.image
        ? `${window.location.origin}/storage/${row.original.image}` // serve from storage
        : "/placeholder.png"; // fallback placeholder
      return <img src={imageUrl} alt="Item" className="w-12 h-12 object-cover rounded" />;
    },
  },
  {
    accessorKey: "stock_quantity",
    header: "Stock Quantity",
  },
  {
    accessorKey: "unit",
    header: "Unit",
  },
{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    let colorClasses = "bg-gray-200 text-gray-800";
    if (row.original.status === "in_stock") colorClasses = "bg-green-200 text-green-800";
    if (row.original.status === "low_stock") colorClasses = "bg-yellow-200 text-yellow-800";
    if (row.original.status === "out_of_stock") colorClasses = "bg-red-200 text-red-800";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
        {row.original.status.replace("_", " ")}
      </span>
    );
  },
},
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRestock(item.id, item.stock_quantity)}
            className="flex items-center bg-yellow-200 text-gray-800 hover:bg-yellow-300 shadow-lg rounded-sm"
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Restock
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(item)}
            className="flex items-center bg-blue-200 text-gray-800 hover:bg-blue-300 shadow-lg rounded-sm"
          >
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(item.id)}
            className="flex items-center bg-red-200 text-gray-800 hover:bg-red-300 shadow-lg rounded-sm"
          >
            <Trash className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      );
    },
  },
];