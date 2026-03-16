import React from "react";

export default function UsersLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow h-16 flex items-center px-6 justify-between">
        {/* Logo on the left */}
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
          <span className="ml-3 text-xl font-semibold text-gray-800">MyApp</span>
        </div>

        {/* Navigation links / user menu */}
        <nav className="flex items-center space-x-4">
          <a href="/dashboard" className="text-gray-700 hover:text-gray-900">
            Dashboard
          </a>
          <a href="/profile" className="text-gray-700 hover:text-gray-900">
            Profile
          </a>
          <a href="/settings" className="text-gray-700 hover:text-gray-900">
            Settings
          </a>
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}