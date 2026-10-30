import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function NavigationLinks({ onNavigate }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const linkClass = ({ isActive }) =>
    `btn btn-ghost justify-start ${isActive ? "bg-primary text-primary-content" : ""}`;

  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {isAdmin ? (
        <>
          <NavLink end to="/admin" className={linkClass} onClick={onNavigate}>Dashboard</NavLink>
          <NavLink to="/admin/resources" className={linkClass} onClick={onNavigate}>Manage resources</NavLink>
          <NavLink to="/admin/reservations" className={linkClass} onClick={onNavigate}>Manage reservations</NavLink>
          <NavLink to="/resources" className={linkClass} onClick={onNavigate}>Browse resources</NavLink>
        </>
      ) : (
        <>
         <NavLink end to="/dashboard" className={linkClass} onClick={onNavigate}>Dashboard</NavLink>
          <NavLink to="/resources" className={linkClass} onClick={onNavigate}>Browse resources</NavLink>
          <NavLink end to="/reservations" className={linkClass} onClick={onNavigate}>My reservations</NavLink>
          <NavLink to="/reservations/new" className={linkClass} onClick={onNavigate}>Request a resource</NavLink>
        </>
      )}
    </nav>
  );
}

export default function Sidebar({ onClose }) {
  function closeOnMobileNavigation() {
    if (window.matchMedia("(max-width: 1023px)").matches) onClose();
  }

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-base-300 bg-base-100 p-4 lg:block">
        <div className="mb-1 flex items-center justify-end">
          <button
            type="button"
            className="btn btn-square btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Collapse sidebar"
          >
            ✕
          </button>
        </div>
        <NavigationLinks />
      </aside>

      <div className="fixed inset-0 z-40 flex lg:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
          aria-label="Close sidebar"
        />
        <aside className="relative z-10 min-h-full w-72 bg-base-100 p-4 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-bold text-primary">ResourceHub</span>
            <button
              type="button"
              className="btn btn-square btn-ghost btn-sm"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
          <NavigationLinks onNavigate={closeOnMobileNavigation} />
        </aside>
      </div>
    </>
  );
}

