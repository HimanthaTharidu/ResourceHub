import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-primary text-primary-content"
      : "text-base-content hover:bg-base-200"
  }`;

function NavigationLinks({ onNavigate }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

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
          <NavLink to="/resources" className={linkClass} onClick={onNavigate}>Browse resources</NavLink>
          <NavLink to="/dashboard" className={linkClass} onClick={onNavigate}>My dashboard</NavLink>
          <NavLink to="/reservations" className={linkClass} onClick={onNavigate}>My Reservation</NavLink>
        </>
      )}
    </nav>
  );
}

export default function Sidebar() {
  function closeMobileMenu() {
    const toggle = document.getElementById("close-sidebar");
    if (toggle) toggle.checked = false;
  }

  return (
    <div className="drawer-side z-40">
      <label htmlFor="close-sidebar" aria-label="Close navigation menu" className="drawer-overlay" />
      <aside className="min-h-full w-72 border-r border-base-300 bg-base-100 p-4 lg:w-64">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="font-bold text-primary">ResourceHub</span>
          <label htmlFor="close-sidebar" className="btn btn-square btn-ghost btn-sm" aria-label="Close navigation menu">✕</label>
        </div>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-base-content/50">Workspace</p>
        <NavigationLinks onNavigate={closeMobileMenu} />
      </aside>
    </div>
  );
}
