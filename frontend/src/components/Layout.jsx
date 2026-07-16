import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import InteractiveBackground from "./InteractiveBackground";
import PageTransition from "./PageTransition";
import { Link, useLocation } from "react-router";
import {
  BarChart3Icon,
  BellIcon,
  HomeIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getNotificationCounts } from "../lib/api";

const BOTTOM_NAV_ITEMS = [
  { to: "/", icon: HomeIcon, label: "Home" },
  { to: "/friends", icon: UsersIcon, label: "Friends" },
  { to: "/dashboard", icon: BarChart3Icon, label: "Progress" },
  { to: "/assistant", icon: SparklesIcon, label: "AI" },
  { to: "/notifications", icon: BellIcon, label: "Alerts" },
];

const Layout = ({ children, showSidebar = false }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const { data: notificationCounts } = useQuery({
    queryKey: ["notificationCounts"],
    queryFn: getNotificationCounts,
  });

  const pendingRequests = notificationCounts?.pendingRequests || 0;

  return (
    <div className="min-h-screen bg-base-100 text-base-content relative overflow-hidden">
      {/* Animated Canvas Particle Network */}
      <InteractiveBackground />

      <div className="flex h-screen overflow-hidden relative z-10">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-auto scrollbar-thin relative pb-16 lg:pb-0">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar — visible below lg */}
      {showSidebar && (
        <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-stretch border-t border-primary/15 bg-base-200/95 backdrop-blur-xl">
          {BOTTOM_NAV_ITEMS.map(({ to, icon: Icon, label }) => {
            const isActive = currentPath === to;
            const isNotification = to === "/notifications";
            return (
              <Link
                key={to}
                to={to}
                className={`mobile-bottom-nav-item flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative transition-colors duration-150 ${
                  isActive
                    ? "text-primary"
                    : "text-base-content/45 active:text-base-content/70"
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`size-5 transition-colors ${
                      isActive ? "text-primary" : ""
                    }`}
                  />
                  {isNotification && pendingRequests > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[8px] font-bold min-w-[14px] h-[14px] flex items-center justify-center rounded-full px-0.5">
                      {pendingRequests > 9 ? "9+" : pendingRequests}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium leading-none ${
                    isActive ? "text-primary" : ""
                  }`}
                >
                  {label}
                </span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
};
export default Layout;