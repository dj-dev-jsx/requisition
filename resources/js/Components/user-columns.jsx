import { Pencil, Trash } from "lucide-react";
import { Button } from "./ui/button";

export const columns = (onEdit, onDelete) => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "firstname",
    header: "First Name",
  },
  {
    accessorKey: "lastname",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="flex gap-2">
          {/* EDIT */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(user)}
            className="flex items-center bg-blue-200 text-gray-800 hover:bg-blue-300 shadow-md rounded-sm"
          >
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>

          {/* DELETE */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(user.id)}
            className="flex items-center bg-red-200 text-gray-800 hover:bg-red-300 shadow-md rounded-sm"
          >
            <Trash className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      );
    },
  },
];