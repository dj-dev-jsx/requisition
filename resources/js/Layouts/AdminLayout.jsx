import React, { useEffect, useState, useRef } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Home, Users, Settings, LogOut, BoxesIcon, ClipboardIcon, Bell, User, CheckCircle, XCircle, ChevronDown, Menu, X } from "lucide-react";
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

export default function AdminLayout({ children }) {
  const { url } = usePage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(false); // Toggle state
  const [flashBell, setFlashBell] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const flashTimer = useRef(null);
  const prevNotifications = useRef([]);
  const isFirstFetch = useRef(true);

  const navLink = (routeName) => {
    const path = route(routeName, {}, false);
    const isActive = url.startsWith(path);
    return `group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
      isActive
        ? "bg-white/20 text-white shadow-lg border border-white/20"
        : "text-slate-200 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/20"
    }`;
  };

  const getNotificationLabel = (notification) => {
    return notification.data.request_number || notification.data.request_id || "Request";
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
      const fetched = response.data;
      const unread = fetched.filter((n) => !n.read_at).length;

      if (!isFirstFetch.current) {
        const newNotifications = fetched.filter(
          (n) => !prevNotifications.current.some((prev) => prev.id === n.id)
        );

        if (newNotifications.length > 0) {
          const latest = newNotifications[0];
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
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 bg-gradient-to-b from-slate-800 via-slate-800/95 to-slate-900 shadow-2xl flex flex-col border-r border-slate-700/50 backdrop-blur-sm`}>
        <div className="h-24 flex items-center justify-center border-b border-slate-700/30 px-4">
          <Link href={route("admin.admin_dashboard")} className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-300 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
              <img src="/img/bluelogodeped.png" alt="Logo" className="h-10 w-auto" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg">ADMIN</span>
                <span className="text-xs text-slate-400">System</span>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <Link href={route("admin.admin_dashboard")} className={navLink("admin.admin_dashboard")}>
            <Home className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            {sidebarOpen && <span className="font-semibold text-sm">Dashboard</span>}
          </Link>
          <Link href={route("admin.view_users")} className={navLink("admin.view_users")}>
            <Users className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            {sidebarOpen && <span className="font-semibold text-sm">Users</span>}
          </Link>
          <Link href={route("admin.inventory")} className={navLink("admin.inventory")}>
            <BoxesIcon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            {sidebarOpen && <span className="font-semibold text-sm">Inventory</span>}
          </Link>
          <Link href={route("admin.requests")} className={navLink("admin.requests")}>
            <ClipboardIcon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            {sidebarOpen && <span className="font-semibold text-sm">Requests</span>}
          </Link>
          <Link href={route("admin.profile")} className={navLink("admin.profile")}>
            <User className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            {sidebarOpen && <span className="font-semibold text-sm">Profile</span>}
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-700/30 space-y-3">
          <button
            onClick={() => setConfirmLogout(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg bg-gradient-to-r from-red-600/20 to-pink-600/20 text-red-200 hover:from-red-600/40 hover:to-pink-600/40 hover:text-red-100 transition-all duration-300 font-semibold text-sm border border-red-500/20 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/20"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-full p-2.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-all duration-300 border border-slate-700/30"
          >
            {sidebarOpen ? <ChevronDown className="w-5 h-5 rotate-90" /> : <ChevronDown className="w-5 h-5 -rotate-90" />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all duration-300 lg:hidden hover:shadow-md"
            >
              {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
            </button>
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">Administrator</h1>
              <p className="text-sm text-slate -500 font-medium">Welcome back, manage your system efficiently</p>
            </div>
          </div>

          <div className="flex items-center gap-6">

            <div className="relative">
              <button
                className={`relative z-10 p-2.5 rounded-full transition-all duration-300 ${
                  flashBell
                    ? "scale-105 shadow-[0_0_0_18px_rgba(59,130,246,0.16)] ring-2 ring-blue-300/50 animate-pulse bg-blue-50"
                    : "hover:bg-slate-100 hover:shadow-md"
                }`}
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <Bell className={`relative z-10 w-6 h-6 ${flashBell ? 'text-blue-700' : 'text-slate-700'}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-5 h-5 px-2 text-xs font-bold text-white bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg animate-pulse">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {openDropdown && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200/50 backdrop-blur-xl animate-in slide-in-from-top-2 duration-300">
                  <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                          <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-lg">Notifications</span>
                          <span className="text-xs text-slate-500 font-medium">Stay in the loop</span>
                        </div>
                      </div>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-1.5 rounded-full font-bold shadow-md">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                    {notifications.length === 0 && (
                      <div className="p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center mx-auto mb-4">
                          <Bell className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-semibold text-lg">No notifications</p>
                        <p className="text-sm text-slate-400 mt-1">You're all caught up! 🎉</p>
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
                          className={`relative cursor-pointer p-5 border-b border-slate-100 hover:bg-gradient-to-r transition-all duration-200 group ${
                            isUnread ? "bg-blue-50/80 hover:from-blue-50 hover:to-cyan-50/60" : "hover:from-slate-50 hover:to-blue-50/40"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-transform group-hover:scale-110 ${
                              isProcessed ? "bg-gradient-to-br from-green-400 to-emerald-600" : isRejected ? "bg-gradient-to-br from-red-400 to-pink-600" : isUnread ? "bg-gradient-to-br from-blue-400 to-cyan-600" : "bg-gradient-to-br from-slate-400 to-slate-600"
                            }`}>
                              {isProcessed ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : isRejected ? (
                                <XCircle className="w-6 h-6" />
                              ) : (
                                <Bell className="w-6 h-6" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className={`text-sm font-bold leading-tight line-clamp-2 ${
                                  isProcessed ? "text-emerald-900" : isRejected ? "text-red-900" : "text-slate-900"
                                }`}>
                                  {n.data.message}
                                </p>
                                {isProcessed && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">Processed</span>
                                )}
                                {isRejected && (
                                  <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap">Rejected</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 my-2 flex-wrap">
                                <span className="text-xs text-slate-700 font-bold bg-slate-200/60 px-2.5 py-1 rounded-full hover:bg-slate-300/60 transition-colors">
                                  {n.data.user_name}
                                </span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-blue-700 font-bold bg-blue-100/70 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors">
                                  Request #{n.data.request_number}
                                </span>
                              </div>

                              <p className="text-xs text-slate-500 font-medium">
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                              </p>
                            </div>

                            {isUnread && (
                              <div className="flex-shrink-0">
                                <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full shadow-lg animate-pulse"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-t border-slate-100">
                    <Link
                      href={route("admin.requests")}
                      className="flex items-center justify-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all py-2 px-4 rounded-lg hover:bg-blue-100/50"
                      onClick={() => setOpenDropdown(false)}
                    >
                      View all requests <ChevronDown className="w-4 h-4 rotate-90" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all duration-300 hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                  <User className="w-5 h-5 text-white" />
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-600 transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-slate-200/50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300">
                  <Link
                    href={route("admin.profile")}
                    className="flex items-center gap-3 px-4 py-3.5 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all border-b border-slate-100 font-medium"
                  >
                    <User className="w-5 h-5 text-blue-600" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setConfirmLogout(true);
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3.5 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all w-full text-left font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
          <div className="p-8">
            {children}
          </div>
          <Toaster position="top-right" richColors />
        </main>
      </div>

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent className="bg-white rounded-2xl shadow-2xl border-0 max-w-md backdrop-blur-xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold text-slate-900">
                Confirm Logout
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-600 text-base mt-3">
              Are you sure you want to logout? You will be redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-8">
            <AlertDialogCancel className="px-6 py-2.5 rounded-lg border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 hover:border-slate-400">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
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