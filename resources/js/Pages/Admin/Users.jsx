import AdminLayout from "@/Layouts/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

import { DataTable } from "@/components/DataTable";
import { columns } from "@/components/user-columns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Users as UsersIcon, AlertTriangle, Check, Save, Loader, XCircle, Pencil } from "lucide-react";

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
  const [status, setStatus] = useState(filters?.status || "all");

  useEffect(() => {
    const delay = setTimeout(() => {
      router.get(
        route("admin.view_users"),
        { search, role, status },
        { preserveState: true, replace: true }
      );
    }, 400);

    return () => clearTimeout(delay);
  }, [search, role, status]);
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
    admin_password: "",
  });
  const [errors, setErrors] = useState({});
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState("");
  const [actionPassword, setActionPassword] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = (e) => {
  e.preventDefault();

  const url = form.id ? route("admin.update_user", form.id) : route("admin.add_user");
  const method = form.id
    ? (...args) => router.put(...args)
    : (...args) => router.post(...args);

  setProcessing(true);
  method(url, form, {
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
        admin_password: "",
      });
      setErrors({});

      toast.success(form.id ? "User updated successfully!" : "User added successfully!", {
        description: form.id ? "The user has been updated." : "The user has been created.",
      });
    },

    onError: (err) => {
      setErrors(err);

      toast.error(form.id ? "Failed to update user" : "Failed to add user", {
        description: "Please check the form fields.",
      });
    },
    onFinish: () => setProcessing(false),
  });
};

const confirmUserAction = (user) => {
  setActionUser(user);
  setActionType(user.is_active ? "deactivate" : "activate");
  setActionPassword("");
  setErrors({});
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
    admin_password: "",
  });

  setErrors({});
  setOpen(true);
};

const handleAction = () => {
  if (!actionUser) return;

  setProcessing(true);
  const url =
    actionType === "activate"
      ? route("admin.activate_user", actionUser.id)
      : route("admin.deactivate_user", actionUser.id);

  if (actionType === "activate") {
    router.post(url, { admin_password: actionPassword }, {
      onSuccess: () => {
        toast.success("User account has been activated.");
        setActionUser(null);
        setActionType("");
        setActionPassword("");
        setErrors({});
      },
      onError: (err) => {
        setErrors(err);
        toast.error("Failed to complete user action.");
      },
      onFinish: () => setProcessing(false),
    });
  } else {
    router.delete(url, {
      data: { admin_password: actionPassword },
      onSuccess: () => {
        toast.success("User account has been marked inactive.");
        setActionUser(null);
        setActionType("");
        setActionPassword("");
        setErrors({});
      },
      onError: (err) => {
        setErrors(err);
        toast.error("Failed to complete user action.");
      },
      onFinish: () => setProcessing(false),
    });
  }
};
  return (
    <AdminLayout>
      <Head title="Users" />

      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Premium Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center">
                  <UsersIcon className="text-white w-6 h-6" />
                </div>
                <h1 className="text-4xl font-bold text-purple-700">
                  User Management
                </h1>
              </div>
              <p className="text-gray-500 text-base ml-15">
                Create, manage, and organize system users and permissions
              </p>
            </div>

            <Button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl rounded-lg px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" /> Add New User
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or username..."
                className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 placeholder-gray-400"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 font-medium"
              >
                <option value="">All Roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-300 text-gray-900 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table Card with Premium Styling */}
          <Card className="shadow-xl border-0 rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="bg-slate-900 text-white rounded-t-2xl px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">User List</CardTitle>
                <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {users.total} total
                </span>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                Displaying {users.data.length} of {users.total} users
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <div className="overflow-x-auto">
                <DataTable columns={columns(handleEdit, confirmUserAction)} data={users.data} />
              </div>

              {/* Modern Pagination */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Page <span className="font-bold text-gray-900">{users.current_page}</span> of{' '}
                  <span className="font-bold text-gray-900">{users.last_page}</span>
                </div>
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    disabled={!users.prev_page_url}
                    onClick={() => users.prev_page_url && router.get(users.prev_page_url, {}, { preserveState: true })}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    ← Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        onClick={() =>
                          router.get(route("admin.view_users"), { page, search, role, status }, { preserveState: true })
                        }
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          users.current_page === page
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    disabled={!users.next_page_url}
                    onClick={() => users.next_page_url && router.get(users.next_page_url, {}, { preserveState: true })}
                    className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    Next →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
<Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 border-0">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-purple-700 flex items-center gap-2">
              {form.id ? (
                <>
                  <Pencil className="w-6 h-6 text-purple-600" /> Edit User Details
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-purple-600" /> Add New User
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName" className="text-base font-semibold text-gray-700 mb-2 block">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName || ""}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName" className="text-base font-semibold text-gray-700 mb-2 block">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName || ""}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-base font-semibold text-gray-700 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {errors.email}
                </p>
              )}
            </div>

            {/* Username & Office */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="username" className="text-base font-semibold text-gray-700 mb-2 block">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username || ""}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.username}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="office" className="text-base font-semibold text-gray-700 mb-2 block">
                  Office
                </Label>
                <Input
                  id="office"
                  name="office"
                  value={form.office || ""}
                  onChange={handleChange}
                  placeholder="Enter office"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
                {errors.office && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.office}
                  </p>
                )}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="password" className="text-base font-semibold text-gray-700 mb-2 block">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password || ""}
                  onChange={handleChange}
                  placeholder={form.id ? "Leave blank to keep current" : "Enter password"}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.password}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700 mb-2 block">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation || ""}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role" className="text-base font-semibold text-gray-700 mb-2 block">
                User Role
              </Label>
              <select
                id="role"
                name="role"
                value={form.role || ""}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm font-medium"
              >
                <option value="">Select a role</option>
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {errors.role}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="admin_password" className="text-base font-semibold text-gray-700 mb-2 block">
                Admin Password
              </Label>
              <Input
                id="admin_password"
                type="password"
                name="admin_password"
                value={form.admin_password || ""}
                onChange={handleChange}
                placeholder="Enter your admin password to confirm changes"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
              />
              <p className="text-sm text-gray-500 mt-2">
                Admin password is required to add or update a user account.
              </p>
              {errors.admin_password && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> {errors.admin_password}
                </p>
              )}
            </div>

            <DialogFooter className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                {form.id ? (
                  <>
                    <Save className="w-4 h-4" /> Update User
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!actionUser} onOpenChange={(open) => {
        if (!open) {
          setActionUser(null);
          setActionType("");
          setActionPassword("");
          setErrors({});
        }
      }}>
        <AlertDialogContent className="bg-white rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <XCircle className="w-6 h-6" /> {actionType === "activate" ? "Activate User" : "Deactivate User"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base mt-2">
              {actionType === "activate"
                ? "Enter your admin password to activate this user account."
                : "Enter your admin password to mark this user account as inactive."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mt-4">
            <Label htmlFor="action_admin_password" className="text-base font-semibold text-gray-700 mb-2 block">
              Admin Password
            </Label>
            <Input
              id="action_admin_password"
              type="password"
              value={actionPassword}
              onChange={(e) => setActionPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all duration-200 shadow-sm"
            />
            {errors.admin_password && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {errors.admin_password}
              </p>
            )}
          </div>

          <AlertDialogFooter className="flex gap-3 mt-6">
            <AlertDialogCancel className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleAction}
              disabled={processing || !actionPassword}
              className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
            >
              {processing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Working...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" /> Confirm
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}