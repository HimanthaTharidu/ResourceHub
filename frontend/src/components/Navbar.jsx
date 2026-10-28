import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className="navbar sticky top-0 z-30 border-b border-base-300 bg-base-100 px-4 shadow-sm sm:px-6">
      <div className="flex-1 gap-2">
        <label
          htmlFor="resourcehub-sidebar"
          className="btn btn-square btn-ghost lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
        <Link to={user?.role === "admin" ? "/admin" : "/resources"} className="text-lg font-bold text-primary sm:text-xl">
          ResourceHub
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user.name || user.email}</p>
            <p className="text-xs capitalize text-base-content/60">{user.role}</p>
          </div>
        )}
        <button type="button" onClick={handleLogout} className="btn btn-outline btn-sm">
          Log out
        </button>
      </div>
    </header>
  );
}
