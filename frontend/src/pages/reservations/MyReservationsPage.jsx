import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  cancelReservation,
  getMyReservations,
} from "../../api/reservation";
import ReservationCard from "../../components/ReservationCard";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  const loadReservations = useCallback(async () => {
    setError("");

    try {
      const results = await getMyReservations();
      setReservations(results);
    } catch (err) {
      setError(err.message || "Could not load your reservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  async function handleCancel(id) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this reservation request?",
    );

    if (!confirmed) return;

    setCancellingId(id);
    setError("");

    try {
      await cancelReservation(id);

      // Update the displayed card without fetching the whole list again.
      setReservations((current) =>
        current.map((reservation) =>
          reservation._id === id
            ? { ...reservation, status: "cancelled" }
            : reservation,
        ),
      );
    } catch (err) {
      setError(err.message || "Could not cancel this reservation.");
    } finally {
      setCancellingId("");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Faculty
          </p>
          <h1 className="text-3xl font-bold">My reservations</h1>
          <p className="mt-1 text-base-content/70">
            View and manage your resource requests.
          </p>
        </div>

        <Link to="/reservations/new" className="btn btn-primary">
          Request a resource
        </Link>
      </header>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={loadReservations}
          >
            Try again
          </button>
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="card border border-base-300 bg-base-100">
          <div className="card-body items-center py-12 text-center">
            <h2 className="card-title">No reservations yet</h2>
            <p className="text-base-content/70">
              Browse resources and send your first request.
            </p>
            <Link to="/resources" className="btn btn-outline btn-primary mt-2">
              Browse resources
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation._id}
              reservation={reservation}
              onCancel={handleCancel}
              cancelling={cancellingId === reservation._id}
            />
          ))}
        </div>
      )}
    </section>
  );
}