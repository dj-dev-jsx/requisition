import { Pencil, Trash, PlusCircle, Package, BarChart3, Scale, AlertCircle, CheckCircle2, XCircle, Hash } from "lucide-react";
import { Button } from "./ui/button";

export const getInventoryColumns = (handleEdit, handleDelete, handleRestock) => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div className="text-center font-bold text-gray-700 flex items-center justify-center gap-1">
        <Hash className="w-4 h-4" /> ID
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-semibold text-gray-900 bg-gray-100 px-3 py-2 rounded-lg">
        #{row.original.id}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <div className="font-bold text-gray-700 flex items-center gap-1">
        <Package className="w-4 h-4" /> Item Name
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <span className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          {row.original.description}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "image",
    header: ({ column }) => (
      <div className="font-bold text-gray-700">
        Image
      </div>
    ),
    cell: ({ row }) => {
      const imageUrl = row.original.image
        ? `${window.location.origin}/storage/${row.original.image}`
        : "/placeholder.png";
      return (
        <div className="flex justify-center">
          <div className="relative group">
            <img
              src={imageUrl}
              alt="Item"
              className="w-14 h-14 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-all duration-200 ring-2 ring-gray-200 group-hover:ring-blue-400"
            />
            <div className="absolute inset-0 rounded-xl bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "stock_quantity",
    header: ({ column }) => (
      <div className="font-bold text-gray-700 text-center flex items-center justify-center gap-1">
        <BarChart3 className="w-4 h-4" /> Quantity
      </div>
    ),
    cell: ({ row }) => {
      const quantity = row.original.stock_quantity;
      let bgColor = "bg-red-100 text-red-700";
      if (quantity > 100) bgColor = "bg-green-100 text-green-700";
      else if (quantity > 50) bgColor = "bg-blue-100 text-blue-700";
      else if (quantity > 0) bgColor = "bg-amber-100 text-amber-700";
      
      return (
        <div className="flex justify-center">
          <span className={`${bgColor} px-4 py-2 rounded-full font-bold text-sm shadow-sm`}>
            {quantity}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "unit",
    header: ({ column }) => (
      <div className="font-bold text-gray-700 text-center flex items-center justify-center gap-1">
        <Scale className="w-4 h-4" /> Unit
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">
        <span className="inline-block px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-sm">
          {row.original.unit}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <div className="font-bold text-gray-700 text-center flex items-center justify-center gap-1">
        <AlertCircle className="w-4 h-4" /> Status
      </div>
    ),
    cell: ({ row }) => {
      let colorClasses = "bg-gray-100 text-gray-700";
      let Icon = AlertCircle;
      
      if (row.original.status === "in_stock") {
        colorClasses = "bg-green-100 text-green-700";
        Icon = CheckCircle2;
      }
      if (row.original.status === "low_stock") {
        colorClasses = "bg-yellow-100 text-yellow-700";
        Icon = AlertCircle;
      }
      if (row.original.status === "out_of_stock") {
        colorClasses = "bg-red-100 text-red-700";
        Icon = XCircle;
      }

      return (
        <div className="flex justify-center">
          <span className={`${colorClasses} px-3 py-1.5 rounded-full text-xs font-bold shadow-sm inline-flex items-center gap-1.5`}>
            <Icon className="w-3.5 h-3.5" />
            {row.original.status.replace("_", " ")}
          </span>
        </div>
      );
    },
  },
  {
    header: ({ column }) => (
      <div className="font-bold text-gray-700 text-center flex items-center justify-center gap-1">
        Actions
      </div>
    ),
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            size="sm"
            onClick={() => handleRestock(item.id, item.stock_quantity)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Restock this item"
          >
            <PlusCircle className="w-4 h-4" /> Restock
          </Button>

          <Button
            size="sm"
            onClick={() => handleEdit(item)}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Edit this item"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Button>

          <Button
            size="sm"
            onClick={() => handleDelete(item.id)}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Delete this item"
          >
            <Trash className="w-4 h-4" /> Delete
          </Button>
        </div>
      );
    },
  },
];