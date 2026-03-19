import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { User, LayoutDashboard, Package, LogOut } from "lucide-react";
import { Toaster } from "sonner";

export default function UsersLayout({ children }) {
  const { url } = usePage();

  const navLink = (routeName) => {
    const path = route(routeName, {}, false); // false = relative path
    const isActive = url.startsWith(path);
    return `flex items-center gap-3 p-2 rounded transition ${
      isActive ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/img/bluelogodeped.png"
              alt="Logo"
              className="h-9 w-auto"
            />
            <span className="font-semibold text-gray-700 text-lg hidden sm:block">
              Requisition System
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-3 text-sm font-medium">

            <Link
              href={route("user.user_dashboard")}
              className={navLink("user.user_dashboard")}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            <Link
              href={route("user.items")}
              className={navLink("user.items")}
            >
              <Package size={18} />
              Items
            </Link>

            <Link
              href={route("user.profile")}
              className={navLink("user.profile")}
            >
              <User size={18} />
              Profile
            </Link>
            <Link href={route("logout")} method="post" as="button" className={navLink("logout")}>
            <LogOut className="w-5 h-5" />
            Logout
          </Link>
          </nav>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {children}
            <Toaster position="top-right" richColors />
          </div>
        </div>
      </main>

    </div>
  );
}