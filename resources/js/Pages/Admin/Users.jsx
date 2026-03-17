import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";

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

export default function Users({ users, roles }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  password_confirmation: "",
  role: "",
  // division: "", // optional
});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    router.post(route("admin.add_user"), form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ firstName: "", lastName: "", email: "", username: "", password: "", password_confirmation: "", role: "" });
        setErrors({});
        showToast("User added successfully!");
      },
      onError: (err) => {
        setErrors(err);
        showToast("Error! Please fix the form errors.", "error");
      },
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      router.delete(`/users/${id}`, {
        onSuccess: () => showToast("User deleted successfully!"),
        onError: () => showToast("Error deleting user.", "error"),
      });
    }
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

        {/* Table Card */}
        <Card className="shadow-sm border">
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={[
                ...columns,
              ]}
              data={users}
            />
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

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-md shadow-md text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </AdminLayout>
  );
}