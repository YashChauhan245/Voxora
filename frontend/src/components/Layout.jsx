import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import InteractiveBackground from "./InteractiveBackground";
import PageTransition from "./PageTransition";
import { useLocation } from "react-router";

const Layout = ({ children, showSidebar = false }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base-100 text-base-content relative overflow-hidden">
      {/* Animated Canvas Particle Network */}
      <InteractiveBackground />

      <div className="flex h-screen overflow-hidden relative z-10">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-auto scrollbar-thin relative">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;