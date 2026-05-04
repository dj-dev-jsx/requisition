import { Pencil, Trash, Users, Hash, Mail, User } from "lucide-react";
import { Button } from "./ui/button";

export const columns = (onEdit, onDelete) => [
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
    accessorKey: "firstname",
    header: ({ column }) => (
      <div className="font-bold text-gray-700 flex items-center gap-1">
        <User className="w-4 h-4" /> First Name
      </div>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
        {row.original.firstname}
      </span>
    ),
  },
  {
    accessorKey: "lastname",
    header: ({ column }) => (
      <div className="font-bold text-gray-700 flex items-center gap-1">
        <User className="w-4 h-4" /> Last Name
      </div>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
        {row.original.lastname}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="font-bold text-gray-700 flex items-center gap-1">
        <Mail className="w-4 h-4" /> Email
      </div>
    ),
    cell: ({ row }) => (
      <span className="text-gray-700 hover:text-purple-600 transition-colors break-all">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => (
      <div className="font-bold text-gray-700">Username</div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-semibold text-sm">
          @{row.original.username}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <div className="font-bold text-gray-700 text-center">Role</div>
    ),
    cell: ({ row }) => {
      let bgColor = "bg-gray-100 text-gray-700";
      if (row.original.role === "admin") bgColor = "bg-red-100 text-red-700";
      if (row.original.role === "staff") bgColor = "bg-blue-100 text-blue-700";
      if (row.original.role === "user") bgColor = "bg-green-100 text-green-700";

      return (
        <div className="text-center">
          <span className={`${bgColor} px-3 py-1.5 rounded-full text-xs font-bold shadow-sm inline-block`}>
            {row.original.role?.toUpperCase()}
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
      const user = row.original;

      return (
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            size="sm"
            onClick={() => onEdit(user)}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Edit this user"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Button>

          <Button
            size="sm"
            onClick={() => onDelete(user.id)}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg px-3 py-1.5 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            title="Delete this user"
          >
            <Trash className="w-4 h-4" /> Delete
          </Button>
        </div>
      );
    },
  },
];