import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  return (
    <div className="drawer min-h-screen bg-base-200 lg:drawer-open">
      <input id="close-sidebar" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-screen-2xl flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Sidebar />
    </div>
  );
}
