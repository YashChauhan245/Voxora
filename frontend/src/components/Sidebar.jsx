import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { BarChart3Icon, BellIcon, HomeIcon, MessageSquareIcon, SparklesIcon, UserIcon, UsersIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getNotificationCounts, getUnreadMessagesCount } from "../lib/api";
import BrandMark from "./BrandMark";
import { getAvatarFallback, getProfileImage } from "../lib/utils";

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
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark className="size-9" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            Voxora
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/dashboard"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/dashboard" ? "btn-active" : ""
          }`}
        >
          <BarChart3Icon className="size-5 text-base-content opacity-70" />
          <span>Progress</span>
        </Link>

        <Link
          to="/assistant"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/assistant" ? "btn-active" : ""
          }`}
        >
          <SparklesIcon className="size-5 text-base-content opacity-70" />
          <span>AI Assistant</span>
        </Link>

        <Link
          to="/profile"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/profile" ? "btn-active" : ""
          }`}
        >
          <UserIcon className="size-5 text-base-content opacity-70" />
          <span>Profile</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}
          title="Open friends and start chats"
        >
          <MessageSquareIcon className="size-5 text-base-content opacity-70" />
          <span>Unread Messages</span>
          {unreadMessages > 0 && <span className="badge badge-primary ml-auto">{unreadMessages}</span>}
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
          {pendingRequests > 0 && <span className="badge badge-primary ml-auto">{pendingRequests}</span>}
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img
                src={getProfileImage(authUser?.profilePic, authUser?.fullName)}
                alt="User Avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAvatarFallback(authUser?.fullName);
                }}
              />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;