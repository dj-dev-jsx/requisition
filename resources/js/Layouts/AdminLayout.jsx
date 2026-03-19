import React, { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Home, Users, Settings, LogOut, BoxesIcon, ClipboardIcon, Bell, User } from "lucide-react";
import { Toaster } from "sonner";
import axios from "axios";

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

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/admin/notifications");
      setNotifications(response.data);
      const unread = response.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
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
                <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-lg z-50">
                  {notifications.length === 0 && (
                    <p className="p-2 text-gray-500">No new requests</p>
                  )}
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={route("admin.requests.show", n.data.request_id)} // dynamic request detail page
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setOpenDropdown(false)}
                    >
                      {n.data.message}
                    </Link>
                  ))}
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