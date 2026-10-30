import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const desktopQuery = "(min-width: 1024px)";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    window.matchMedia(desktopQuery).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopQuery);
    const handleBreakpointChange = (event) => {
      setSidebarOpen(event.matches);
    };

    mediaQuery.addEventListener("change", handleBreakpointChange);
    return () => mediaQuery.removeEventListener("change", handleBreakpointChange);
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar onMenuClick={() => setSidebarOpen((open) => !open)} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
