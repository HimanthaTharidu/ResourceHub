import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getResources } from "../../api/resources.js";
import { getAllReservations } from "../../api/reservation.js";

function AdminDashboardPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [resourceData, reservationData] = await Promise.all([
          getResources(),
          getAllReservations(),
        ]);

        setResources(
          Array.isArray(resourceData)
            ? resourceData
            : (resourceData.resources ?? []),
        );

        setReservations(
          Array.isArray(reservationData)
            ? reservationData
            : (reservationData.reservations ?? []),
        );
      } catch (err) {
        setError(err.message || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (!user) return null;

  const pendingReservations = reservations.filter(
    (reservation) => reservation.status === "pending",
  );

  const upcomingReservations = reservations.filter(
    (reservation) =>
      reservation.startTime && new Date(reservation.startTime) >= new Date(),
  );

  const availableResources = resources.filter(
    (resource) => resource.isAvailable,
  );

  const unavailableResources = resources.filter(
    (resource) => !resource.isAvailable,
  );

  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
          <p className="mt-1 opacity-70">ResourceHub admin dashboard</p>
        </div>

        <div className="flex gap-3">
          <Link to="/admin/resources/new" className="btn btn-primary">
            Add resource
          </Link>
          <Link to="/admin/reservations" className="btn btn-outline">
            Manage reservations
          </Link>
        </div>
      </header>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Total resources" value={resources.length} />
        <SummaryCard
          label="Pending requests"
          value={pendingReservations.length}
        />
        <SummaryCard
          label="Upcoming reservations"
          value={upcomingReservations.length}
        />
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center justify-between gap-3">
            <h2 className="card-title">Pending requests</h2>
            <Link to="/admin/reservations" className="link link-primary">
              View all
            </Link>
          </div>

          {pendingReservations.length === 0 ? (
            <p className="py-3 opacity-70">No pending requests.</p>
          ) : (
            <ul className="divide-y divide-base-300">
              {pendingReservations.slice(0, 5).map((reservation) => (
                <li
                  key={reservation._id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-semibold">
                      {reservation.resource?.name ?? "Resource"}
                    </p>
                    <p className="text-sm opacity-70">
                      Requested by:{" "}
                      {reservation.requestedBy?.name ?? "Unknown user"}
                    </p>
                    <p className="text-sm opacity-70">
                      {reservation.startTime
                        ? new Date(reservation.startTime).toLocaleString()
                        : "Time not specified"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="badge badge-warning">Pending</span>
                    <Link
                      to={`/admin/reservations/${reservation._id}`}
                      className="btn btn-sm btn-primary"
                    >
                      Review
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex items-center justify-between gap-3">
            <h2 className="card-title">Resource overview</h2>
            <Link to="/admin/resources" className="link link-primary">
              Manage resources
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="badge badge-success badge-lg">
              Available: {availableResources.length}
            </span>
            <span className="badge badge-warning badge-lg">
              Unavailable: {unavailableResources.length}
            </span>
          </div>

          {unavailableResources.length > 0 && (
            <ul className="mt-2 divide-y divide-base-300">
              {unavailableResources.slice(0, 5).map((resource) => (
                <li key={resource._id} className="py-3">
                  <p className="font-medium">{resource.name}</p>
                  <p className="text-sm opacity-70">
                    {resource.maintenanceNotes || "Marked unavailable"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <p className="text-sm opacity-70">{label}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
