import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import {
  BellIcon,
  LogOutIcon,
  MessageSquareIcon,
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
    <nav className="sticky top-0 z-30 h-14 flex items-center border-b border-primary/15 bg-base-200/85 backdrop-blur-xl safe-area-top">
      <div className="w-full px-3 sm:px-5">
        <div className="flex items-center justify-between w-full gap-2">

          {/* LOGO — shown on mobile always, on desktop only for chat page */}
          <Link to="/" className={`flex items-center gap-2 shrink-0 ${!isChatPage ? "lg:hidden" : ""}`}>
            <BrandMark className="size-7 sm:size-8" />
            <span className="text-lg sm:text-xl font-bold tracking-tight gradient-text font-display">
              Voxora
            </span>
          </Link>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 ml-auto">

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

            {/* Notifications — hidden on mobile since we have bottom nav */}
            <Link to="/notifications" className="relative btn btn-ghost btn-circle text-base-content/60 hover:text-base-content hover:bg-base-content/5 hidden sm:inline-flex">
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
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-primary/30 hover:ring-primary/60 transition-all"
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