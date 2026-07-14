import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import {
  BarChart3Icon,
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquareIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import useLogout from "../hooks/useLogout";
import { useQuery } from "@tanstack/react-query";
import { getNotificationCounts, getUnreadMessagesCount } from "../lib/api";
import BrandMark from "./BrandMark";
import { getAvatarFallback, getProfileImage } from "../lib/utils";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");
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

  const { logoutMutation } = useLogout();

  return (
    <nav className="sticky top-0 z-30 h-14 flex items-center border-b border-primary/15 bg-base-200/85 backdrop-blur-xl">
      <div className="w-full px-4 sm:px-5">
        <div className="flex items-center justify-between w-full gap-3">

          {/* LOGO - only on chat page */}
          {isChatPage && (
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <BrandMark className="size-8" />
              <span className="text-xl font-bold tracking-tight gradient-text font-display">
                Voxora
              </span>
            </Link>
          )}

          {/* MOBILE MENU */}
          <div className="dropdown lg:hidden">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-circle text-base-content/70"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <ul
              tabIndex={0}
              className="menu dropdown-content mt-2.5 p-1.5 shadow-2xl bg-base-200/95 backdrop-blur-xl rounded-2xl w-52 border border-primary/20 z-[60] text-sm gap-1"
            >
              <li><Link to="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-all"><HomeIcon className="size-4 text-primary" />Home</Link></li>
              <li><Link to="/friends" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-all"><UsersIcon className="size-4 text-primary" />Friends</Link></li>
              <li><Link to="/dashboard" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-all"><BarChart3Icon className="size-4 text-primary" />Progress</Link></li>
              <li><Link to="/assistant" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-all"><SparklesIcon className="size-4 text-primary" />AI Assistant</Link></li>
              <li><Link to="/profile" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 transition-all"><UserIcon className="size-4 text-primary" />Profile</Link></li>
            </ul>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">

            {/* Messages */}
            <Link
              to="/friends"
              className="relative btn btn-ghost btn-circle text-base-content/60 hover:text-base-content hover:bg-base-content/5"
              title="Messages"
            >
              <MessageSquareIcon className="h-5 w-5" />
              {unreadMessages > 0 && (
                <span className="badge badge-primary absolute -top-0.5 -right-0.5 text-[9px] min-w-[18px] h-[18px] p-0 flex items-center justify-center font-bold">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link to="/notifications" className="relative btn btn-ghost btn-circle text-base-content/60 hover:text-base-content hover:bg-base-content/5">
              <BellIcon className="h-5 w-5" />
              {pendingRequests > 0 && (
                <span className="badge badge-primary absolute -top-0.5 -right-0.5 text-[9px] min-w-[18px] h-[18px] p-0 flex items-center justify-center font-bold">
                  {pendingRequests > 9 ? "9+" : pendingRequests}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <Link
              to="/profile"
              className="relative flex-shrink-0"
              title="Profile"
            >
              <img
                src={getProfileImage(authUser?.profilePic, authUser?.fullName)}
                alt="User Avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30 hover:ring-primary/60 transition-all"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAvatarFallback(authUser?.fullName);
                }}
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-base-200" />
            </Link>

            {/* Logout */}
            <button
              className="btn btn-ghost btn-circle text-base-content/50 hover:text-error hover:bg-error/10"
              onClick={logoutMutation}
              title="Log out"
            >
              <LogOutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;