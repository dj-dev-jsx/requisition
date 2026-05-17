import React, { useEffect, useState, useRef } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { User, LayoutDashboard, Package, LogOut, Bell, CheckCircle, XCircle } from "lucide-react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersLayout({ children }) {
  const { url } = usePage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [flashBell, setFlashBell] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const flashTimer = useRef(null);
  const prevNotifications = useRef([]);
  const isFirstFetch = useRef(true);

  const navLink = (routeName) => {
    const path = route(routeName, {}, false); // false = relative path
    const isActive = url.startsWith(path);
    return `flex items-center gap-3 p-2 rounded transition ${
      isActive ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
    }`;
  };

  const getNotificationLabel = (notification) => {
    return notification.data.request_number || notification.data.request_id || "Request";
  };

  const markAsReadAndRedirect = async (notification) => {
    try {
      await axios.post(`/api/admin/notifications/${notification.id}/read`);

      // Update UI instantly
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read_at: new Date() } : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));

      setOpenDropdown(false);

      // Redirect to request detail
      router.visit(route("user.requests.show", notification.data.request_id));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get("/api/admin/notifications");
      const fetched = response.data;
      const unread = fetched.filter((n) => !n.read_at).length;

      if (!isFirstFetch.current) {
        const newNotifications = fetched.filter(
          (n) => !prevNotifications.current.some((prev) => prev.id === n.id)
        );

        if (newNotifications.length > 0) {
          const latest = newNotifications[0];
          const label = getNotificationLabel(latest);
          setFlashBell(true);
          clearTimeout(flashTimer.current);
          flashTimer.current = setTimeout(() => setFlashBell(false), 1200);

          if (latest.data.status === "processed") {
            toast.success(`A request was processed.`);
          } else if (latest.data.status === "rejected") {
            toast.error(`A request was rejected.`);
          } else {
            toast(`A request has been submitted.`);
          }
        }
      }

      prevNotifications.current = fetched;
      isFirstFetch.current = false;
      setNotifications(fetched);
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // poll every 15s
    return () => {
      clearInterval(interval);
      clearTimeout(flashTimer.current);
    };
  }, []);

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
              Requisition
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-3 text-sm font-medium">
            <div className="relative">
              <button
                className={`relative z-10 p-3 rounded-full overflow-visible transition-all duration-300 ${
                  flashBell
                    ? "scale-105 shadow-[0_0_0_18px_rgba(59,130,246,0.16)] ring-2 ring-blue-300/50 animate-pulse bg-blue-50"
                    : "hover:scale-105 hover:bg-slate-100"
                }`}
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <Bell className={`relative z-10 w-5 h-5 ${flashBell ? 'text-blue-700' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {openDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 transform transition-all duration-300 ease-out">
                  
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">Notifications</span>
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 && (
                      <div className="p-6 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          No notifications yet
                        </p>
                      </div>
                    )}

                    {notifications.map((n) => {
                      const isUnread = !n.read_at;
                      const isProcessed = n.data.status === "processed";
                      const isRejected = n.data.status === "rejected";

                      return (
                        <div
                          key={n.id}
                          onClick={() => markAsReadAndRedirect(n)}
                          className={`relative cursor-pointer p-4 border-b border-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 group ${
                            isUnread ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isProcessed ? "bg-green-100" : isRejected ? "bg-red-100" : isUnread ? "bg-blue-100" : "bg-gray-100"
                            }`}>
                              {isProcessed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : isRejected ? (
                                <XCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <Bell className="w-4 h-4 text-blue-600" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium leading-tight ${
                                isProcessed ? "text-green-800" : isRejected ? "text-red-800" : "text-gray-800"
                              }`}>
                                {n.data.message}
                                {isProcessed && (
                                  <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                    Processed
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                                    Rejected
                                  </span>
                                )}
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600 font-medium">
                                  Request #{n.data.request_number}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                              </p>
                            </div>

                            {/* Unread indicator */}
                            {isUnread && (
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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
            <button 
              onClick={() => setConfirmLogout(true)}
              className={navLink("logout")}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
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

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent className="bg-white rounded-2xl shadow-2xl border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900">
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-base mt-2">
              Are you sure you want to logout? You will be redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="px-6 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-all duration-200"
              onClick={() => router.post(route("logout"))}
            >
              Logout
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}