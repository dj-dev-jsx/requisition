import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/DataTable";
import { columns } from "@/components/user-columns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export default function Users({ users, roles, filters }) {
    const [search, setSearch] = useState(filters?.search || "");
  const [role, setRole] = useState(filters?.role || "");

  useEffect(() => {
    const delay = setTimeout(() => {
      router.get(
        route("admin.view_users"),
        { search, role },
        { preserveState: true, replace: true }
      );
    }, 400);

    return () => clearTimeout(delay);
  }, [search, role]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  office: "",
  password: "",
  password_confirmation: "",
  role: "",
  // division: "", // optional
});
  const [errors, setErrors] = useState({});
  const [deleteId, setDeleteId] = useState(null);
const [editUser, setEditUser] = useState(null);
const [deleting, setDeleting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = (e) => {
  e.preventDefault();

  router.post(route("admin.add_user"), form, {
    onSuccess: () => {
      setOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
          office: "",
        password: "",
        password_confirmation: "",
        role: "",
      });
      setErrors({});

      toast.success("User added successfully!", {
        description: "The user has been created.",
      });
    },

    onError: (err) => {
      setErrors(err);

      toast.error("Failed to add user", {
        description: "Please check the form fields.",
      });
    },
  });
};

const confirmDelete = (id) => {
  setDeleteId(id);
};
const handleEdit = (user) => {
  setForm({
    id: user.id,
    firstName: user.firstname,
    lastName: user.lastname,
    email: user.email,
    username: user.username,
    office: user.office,
    password: "",
    password_confirmation: "",
    role: user.role ?? "",
  });

  setOpen(true);
};
const handleDelete = () => {
  if (!deleteId) return;

  const id = deleteId;
  setDeleting(true);
  setDeleteId(null);

  router.delete(`/users/${id}`, {
    onSuccess: () => {
      toast.success("User deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete user.");
    },
    onFinish: () => {
      setDeleting(false);
    },
  });
};
  return (
    <AdminLayout>
      <Head title="Users" />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground text-sm">
              Manage system users and their information.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-green-200 hover:bg-green-300 shadow-md rounded-md border-none"
          >
            <Plus className="w-4 h-4" /> Add User
          </Button>
        </div>
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full md:w-1/3"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full md:w-1/4 border rounded-md px-3 py-2"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Table Card */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-gray-500 mb-2">
              Showing {users.data.length} of {users.total} users
            </p>

            <DataTable columns={columns(handleEdit, confirmDelete)} data={users.data} />

            {/* Pagination */}
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                disabled={!users.prev_page_url}
                onClick={() => users.prev_page_url && router.get(users.prev_page_url, {}, { preserveState: true })}
              >
                Previous
              </Button>

              {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  onClick={() =>
                    router.get(route("admin.view_users"), { page, search, role }, { preserveState: true })
                  }
                  className={`px-3 py-1 ${users.current_page === page ? "bg-blue-500 text-white" : ""}`}
                >
                  {page}
                </Button>
              ))}

              <Button
                disabled={!users.next_page_url}
                onClick={() => users.next_page_url && router.get(users.next_page_url, {}, { preserveState: true })}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
<Dialog open={open} onOpenChange={setOpen}>

    <DialogContent className="sm:max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6">
      <DialogHeader>
        <DialogTitle>{form.id ? "Edit User" : "Add User"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={form.firstName || ""}
              onChange={handleChange}
              placeholder="Enter first name"
              className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
            />
            {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={form.lastName || ""}
              onChange={handleChange}
              placeholder="Enter last name"
              className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
            />
            {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            value={form.email || ""}
            onChange={handleChange}
            placeholder="Enter email"
            className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
          />
          {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={form.username || ""}
              onChange={handleChange}
              placeholder="Enter username"
              className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
          </div>
        <div>
          <Label htmlFor="office">Office</Label>
          <Input
            id="office"
            name="office"
            value={form.office || ""}
            onChange={handleChange}
            placeholder="Enter office"
            className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
          />
          {errors.office && <p className="text-red-600 text-sm mt-1">{errors.office}</p>}
        </div>
        </div>
        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Enter password"
              className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="password_confirmation" // <--- must match Laravel convention
              value={form.password_confirmation || ""}
              onChange={handleChange}
              placeholder="Confirm password"
              className="shadow-sm focus:ring-2 focus:ring-blue-500 mt-2"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
          <div>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={form.role || ""}
            onChange={handleChange}
            className="mt-2 w-full border rounded-md px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
        </div>
        </div>

        {/* Division - commented out for now */}
        {/*
        <div>
          <Label htmlFor="division">Division</Label>
          <Input
            id="division"
            name="division"
            value={form.division || ""}
            onChange={handleChange}
            placeholder="Enter division"
            className="shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          {errors.division && <p className="text-red-600 text-sm mt-1">{errors.division}</p>}
        </div>
        */}

        <DialogFooter className="mt-4">
          <Button type="submit" className="w-full sm:w-auto">
            {form.id ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
</Dialog>
<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
  <AlertDialogContent className="bg-white rounded-xl shadow-xl">
    <AlertDialogHeader>
      <AlertDialogTitle>Delete User?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the user.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700"
      >
        Yes, Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </AdminLayout>
  );
}