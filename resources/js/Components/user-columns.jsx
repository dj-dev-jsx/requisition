import { Pencil, Trash } from "lucide-react";
import { Button } from "./ui/button";

export const columns = [
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(user.id)}
            className="flex items-center bg-blue-200 text-gray-800 hover:bg-blue-300 shadow-md rounded-sm"
          >
            <Pencil className="w-4 h-4 mr-1" /> Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(user.id)}
            className="flex items-center bg-red-200 text-gray-800 hover:bg-red-300 shadow-md rounded-sm"
          >
            <Trash className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      );
    },
  },
];

const handleEdit = (id) => {
  // Redirect to edit page or open modal
  console.log("Edit user", id);
};

const handleDelete = (id) => {
  // Call Inertia delete or open confirm modal
  if (confirm("Are you sure you want to delete this user?")) {
    console.log("Delete user", id);
    // Example: router.delete(`/users/${id}`);
  }
};