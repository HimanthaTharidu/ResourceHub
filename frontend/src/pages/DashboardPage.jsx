import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "../api/auth.js";
import { getMyReservations } from "../api/reservation.js";

const statusStyles = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
  cancelled: "badge-ghost",
};

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [upcomingReservations, setUpcomingReservations] = useState([]);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        console.log(userData); // Log the response for debugging
        setUser(userData.user);

        const reservationData = await getMyReservations();
        console.log(reservationData);
        setUpcomingReservations(
          reservationData.filter(
            (reservation) => new Date(reservation.startTime) >= new Date(),
          ),
        );
      } catch (error) {
        setErrors(error.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p role="alert">{errors || "Could not load user."}</p>;

  return (
    <main className="space-y-6 p-6">
      <header className="rounded-box bg-base-200 p-6">
        <p className="text-sm opacity-70">ResourceHub</p>
        <h1 className="mt-1 text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="mt-2 opacity-80">
          Find a resource or check on your reservation requests.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/resources" className="btn btn-primary">
            Browse resources
          </Link>
          <Link to="/reservations" className="btn btn-outline">
            My reservations
          </Link>
        </div>
      </header>

      {errors && (
        <div className="alert alert-error" role="alert">
          {errors}
        </div>
      )}

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <h2 className="card-title">Your reservations</h2>
          <p className="opacity-70">
            View your requests and their current status.
          </p>
          <div className="card-actions">
            <Link to="/reservations" className="btn btn-sm btn-outline">
              View reservations
            </Link>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <h2 className="card-title">Upcoming reservations</h2>
            <Link to="/reservations" className="link link-primary">
              View all
            </Link>
          </div>

          {upcomingReservations.length === 0 ? (
            <p>You have no upcoming reservations.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {upcomingReservations.map((reservation) => (
                <li key={reservation._id} className="py-3 ">
                  <p className="font-semibold mb-3">
                    {reservation.resource?.name ?? "Resource"}
                  </p>
                  <p className="mb-2">
                    {new Date(reservation.startTime).toLocaleString()}
                  </p>
                  <span
                    className={`badge ${statusStyles[reservation.status] || "badge-ghost"}`}
                  >
                    {reservation.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
