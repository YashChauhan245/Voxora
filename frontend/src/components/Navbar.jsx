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
import ThemeSelector from "./ThemeSelector";
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

  // const queryClient = useQueryClient();
  // const { mutate: logoutMutation } = useMutation({
  //   mutationFn: logout,
  //   onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  // });

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <BrandMark className="size-9" />
                <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  Voxora
                </span>
              </Link>
            </div>
          )}

          <div className="dropdown dropdown-end lg:hidden">
            <button tabIndex={0} className="btn btn-ghost btn-circle" aria-label="Open navigation menu">
              <MenuIcon className="h-6 w-6 text-base-content opacity-80" />
            </button>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[60] p-2 shadow bg-base-100 rounded-box w-52 border border-base-300"
            >
              <li>
                <Link to="/">
                  <HomeIcon className="size-4" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/friends">
                  <UsersIcon className="size-4" />
                  Friends
                </Link>
              </li>
              <li>
                <Link to="/dashboard">
                  <BarChart3Icon className="size-4" />
                  Progress
                </Link>
              </li>
              <li>
                <Link to="/assistant">
                  <SparklesIcon className="size-4" />
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/profile">
                  <UserIcon className="size-4" />
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to="/friends" className="btn btn-ghost btn-circle relative" title="Unread Messages">
              <MessageSquareIcon className="h-6 w-6 text-base-content opacity-70" />
              {unreadMessages > 0 && (
                <span className="badge badge-primary badge-sm absolute -top-1 -right-1">
                  {unreadMessages}
                </span>
              )}
            </Link>

            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle relative">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                {pendingRequests > 0 && (
                  <span className="badge badge-primary badge-sm absolute -top-1 -right-1">
                    {pendingRequests}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* TODO */}
          <ThemeSelector />

          <Link to="/profile" className="avatar btn btn-ghost btn-circle" title="Edit profile">
            <div className="w-9 rounded-full">
              <img
                src={getProfileImage(authUser?.profilePic, authUser?.fullName)}
                alt="User Avatar"
                rel="noreferrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getAvatarFallback(authUser?.fullName);
                }}
              />
            </div>
          </Link>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;