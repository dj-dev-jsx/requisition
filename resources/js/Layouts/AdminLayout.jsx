import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { Home, Users, Settings, LogOut, BoxesIcon, ClipboardIcon } from "lucide-react";

export default function AdminLayout({ children }) {
  const { url } = usePage();

  // helper to check active link
  const navLink = (routeName) => {
    const path = route(routeName, {}, false); // false = relative path
    const isActive = url.startsWith(path);
    return `flex items-center gap-3 p-2 rounded transition ${
      isActive ? "bg-white text-gray-800" : "text-white hover:bg-gray-100 hover:text-gray-800"
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] shadow flex flex-col">
        {/* Logo */}
        <div className="h-25 flex items-center justify-center border-b">
          <img src="/img/bluelogodeped.png" alt="Logo" className="h-20 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-4">
          <Link href={route("admin.admin_dashboard")} className={navLink("admin.admin_dashboard")}>
            <Home className="w-5 h-5" />
            Dashboard
          </Link>

          <Link href={route("admin.users")} className={navLink("admin.users")}>
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

          <Link href={route("logout")} method="post" as="button" className="flex items-center gap-3 p-2 text-white rounded hover:bg-gray-100 hover:text-gray-800 mt-auto">
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-[#111827] shadow px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
          <div className="text-white">User Profile / Notifications</div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}