import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import {
  BarChart3Icon,
  BellIcon,
  HomeIcon,
  MessageSquareIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getNotificationCounts, getUnreadMessagesCount } from "../lib/api";
import BrandMark from "./BrandMark";
import { getAvatarFallback, getProfileImage } from "../lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: HomeIcon, label: "Home" },
  { to: "/friends", icon: UsersIcon, label: "Friends" },
  { to: "/dashboard", icon: BarChart3Icon, label: "Progress" },
  { to: "/assistant", icon: SparklesIcon, label: "AI Assistant" },
  { to: "/profile", icon: UserIcon, label: "Profile" },
];

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  const { data: notificationCounts } = useQuery({
    queryKey: ["notificationCounts"],
    queryFn: getNotificationCounts,
  });

  const { data: unreadData } = useQuery({
    queryKey: ["unreadMessagesCount"],
    queryFn: getUnreadMessagesCount,
  });

  const pendingRequests = notificationCounts?.pendingRequests || 0;
  const unreadMessages = unreadData?.unreadCount || 0;

  return (
    <aside className="w-64 hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/[0.05]"
      style={{ background: "rgba(4,4,12,0.97)", backdropFilter: "blur(20px)" }}>

      {/* LOGO */}
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <BrandMark className="size-9 relative z-10" />
            <div className="absolute inset-0 blur-md opacity-40 rounded-full bg-gradient-to-br from-primary to-secondary scale-110" />
          </div>
          <span className="text-2xl font-bold tracking-tight gradient-text font-display">
            Voxora
          </span>
        </Link>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = currentPath === to;
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
              }`}
            >
              <Icon
                className={`size-[18px] flex-shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-white/40 group-hover:text-white/70"
                }`}
              />
              <span className="truncate">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* Messages link */}
        <Link
          to="/friends"
          className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            currentPath === "/chat" || currentPath.startsWith("/chat/")
              ? "bg-primary/15 text-primary border border-primary/20"
              : "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
          }`}
        >
          <MessageSquareIcon className="size-[18px] flex-shrink-0 text-white/40 group-hover:text-white/70" />
          <span className="truncate">Messages</span>
          {unreadMessages > 0 && (
            <span className="ml-auto badge badge-primary badge-sm px-1.5 py-0.5 text-[10px] font-bold min-w-[20px] text-center">
              {unreadMessages > 99 ? "99+" : unreadMessages}
            </span>
          )}
        </Link>

        {/* Notifications link */}
        <Link
          to="/notifications"
          className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            currentPath === "/notifications"
              ? "bg-primary/15 text-primary border border-primary/20"
              : "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
          }`}
        >
          <BellIcon className="size-[18px] flex-shrink-0 text-white/40 group-hover:text-white/70" />
          <span className="truncate">Notifications</span>
          {pendingRequests > 0 && (
            <span className="ml-auto badge badge-primary badge-sm px-1.5 py-0.5 text-[10px] font-bold min-w-[20px] text-center">
              {pendingRequests > 99 ? "99+" : pendingRequests}
            </span>
          )}
        </Link>
      </nav>

      {/* USER PROFILE */}
      <div className="p-3 border-t border-white/[0.05]">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-all duration-150 group"
        >
          <div className="relative flex-shrink-0">
            <img
              src={getProfileImage(authUser?.profilePic, authUser?.fullName)}
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/30"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = getAvatarFallback(authUser?.fullName);
              }}
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#04040c] shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate leading-tight">
              {authUser?.fullName}
            </p>
            <p className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
              <span className="online-dot w-1.5 h-1.5" />
              Online
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
export default Sidebar;