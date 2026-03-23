import React, { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Home, Users, Settings, LogOut, BoxesIcon, ClipboardIcon, Bell, User } from "lucide-react";
import { Toaster } from "sonner";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";

export default function AdminLayout({ children }) {
  const { url } = usePage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(false); // Toggle state

  const navLink = (routeName) => {
    const path = route(routeName, {}, false);
    const isActive = url.startsWith(path);
    return `flex items-center gap-3 p-2 rounded transition ${
      isActive ? "bg-white text-gray-800" : "text-white hover:bg-gray-100 hover:text-gray-800"
    }`;
  };
  const markAsReadAndRedirect = async (notification) => {
  try {
    await axios.post(`/api/admin/notifications/${notification.id}/read`);

    // Update UI instantly (no reload needed)
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, read_at: new Date() } : n
      )
    );

    setUnreadCount((prev) => Math.max(prev - 1, 0));

    setOpenDropdown(false);

    // Redirect to request detail
    router.visit(route("admin.requests.show", notification.data.request_id));
  } catch (err) {
    console.error("Failed to mark as read", err);
  }
};
  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/admin/notifications");
      setNotifications(response.data);
      const unread = response.data.filter((n) => !n.read_at).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-300">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] shadow flex flex-col">
        <div className="h-25 flex items-center justify-center border-b">
          <img src="/img/bluelogodeped.png" alt="Logo" className="h-20 w-auto" />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-4">
          <Link href={route("admin.admin_dashboard")} className={navLink("admin.admin_dashboard")}>
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href={route("admin.view_users")} className={navLink("admin.view_users")}>
            <Users className="w-5 h-5" />
            Users
          </Link>
          <Link href={route("admin.inventory")} className={navLink("admin.inventory")}>
            <BoxesIcon className="w-5 h-5" />
            Inventory
          </Link>
          <Link href={route("admin.requests")} className={navLink("admin.requests")}>
            <ClipboardIcon className="w-5 h-5" />
            Requests
          </Link>
          <Link href={route("admin.settings")} className={navLink("admin.settings")}>
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <Link
            href={route("logout")}
            method="post"
            as="button"
            className="flex items-center gap-3 p-2 text-white rounded hover:bg-gray-100 hover:text-gray-800 mt-auto w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-[#111827] shadow px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>

          <div className="flex items-center gap-4 relative">
            {/* Notifications */}
            <div className="relative">
              <button
                className="text-white hover:text-gray-300 relative"
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {openDropdown && (
  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl z-50 overflow-hidden border">
    
    {/* Header */}
    <div className="p-3 border-b font-semibold text-gray-700 flex justify-between">
      Notifications
      {unreadCount > 0 && (
        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
          {unreadCount} new
        </span>
      )}
    </div>

    {/* List */}
    <div className="max-h-80 overflow-y-auto">
      {notifications.length === 0 && (
        <p className="p-4 text-gray-500 text-sm text-center">
          No notifications
        </p>
      )}

      {notifications.map((n) => {
  const isUnread = !n.read_at;
  const isProcessed = n.data.status === "processed"; // ✅ use 'processed' here

  return (
    <div
      key={n.id}
      onClick={() => markAsReadAndRedirect(n)}
      className={`relative cursor-pointer px-4 py-3 border-b hover:bg-gray-50 transition ${
        isUnread ? "bg-blue-50" : ""
      }`}
    >
      {/* Message */}
      <p
        className={`text-sm font-medium ${
          isProcessed ? "text-green-700" : "text-gray-800"
        }`}
      >
        {n.data.message} {isProcessed && "(Processed)"}
      </p>

      {/* Details */}
      <p className="text-xs text-gray-600 mt-1">
        {n.data.user_name} • #{n.data.request_number}
      </p>

      {/* Time */}
      <p className="text-xs text-gray-400 mt-1">
        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
      </p>

      {/* Unread dot */}
      {isUnread && (
        <span className="absolute right-4 top-4 w-2 h-2 bg-blue-500 rounded-full"></span>
      )}
    </div>
  );
})}
    </div>

    {/* Footer */}
    <div className="p-2 text-center border-t">
      <Link
        href={route("admin.requests")}
        className="text-sm text-blue-600 hover:underline"
        onClick={() => setOpenDropdown(false)}
      >
        View all requests
      </Link>
    </div>
  </div>
)}
            </div>

            {/* User Profile */}
            <button className="text-white hover:text-gray-300">
              <User className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children} <Toaster position="top-right" richColors />
        </main>
      </div>
    </div>
  );
}