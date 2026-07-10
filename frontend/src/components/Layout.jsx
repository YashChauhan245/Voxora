import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen bg-black">
      <div className="flex h-screen overflow-hidden">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />

          <main className="flex-1 overflow-y-auto scrollbar-thin">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;