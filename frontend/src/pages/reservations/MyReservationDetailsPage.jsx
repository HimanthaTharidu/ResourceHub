import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  cancelReservation,
  getReservationById,
} from "../../api/reservation";

const statusStyles = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
  cancelled: "badge-ghost",
};

function formatDate(value) {
  if (!value) return "Not set";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
}

export default function ReservationDetailsPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReservation() {
      setLoading(true);
      setError("");

      try {
        const result = await getReservationById(id);
        if (active) setReservation(result);
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load this reservation.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReservation();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleCancel() {
    if (!window.confirm("Cancel this reservation request?")) return;

    setCancelling(true);
    setError("");

    try {
      await cancelReservation(id);
      setReservation((current) => ({ ...current, status: "cancelled" }));
    } catch (err) {
      setError(err.message || "Could not cancel this reservation.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div role="alert" className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!reservation) {
    return <p>Reservation not found.</p>;
  }

  const resource = reservation.resource;
  const canManage = reservation.status === "pending";

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <Link to="/reservations" className="link link-primary">
        ← My reservations
      </Link>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <article className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-base-content/60">
                {resource?.category || "Resource"}
              </p>
              <h1 className="card-title text-2xl">
                {resource?.name || "Reservation"}
              </h1>
            </div>

            <span
              className={`badge ${
                statusStyles[reservation.status] || "badge-ghost"
              }`}
            >
              {reservation.status}
            </span>
          </div>

          {resource?.location && <p>Location: {resource.location}</p>}

          <div className="divider my-1" />

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-base-content/60">Start time</dt>
              <dd className="font-medium">
                {formatDate(reservation.startTime)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-base-content/60">End time</dt>
              <dd className="font-medium">
                {formatDate(reservation.endTime)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-base-content/60">Purpose</dt>
              <dd className="whitespace-pre-wrap font-medium">
                {reservation.purpose}
              </dd>
            </div>
            {reservation.adminNotes && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-base-content/60">Admin note</dt>
                <dd>{reservation.adminNotes}</dd>
              </div>
            )}
          </dl>

          {canManage && (
            <div className="card-actions justify-end pt-4">
              <Link
                to={`/reservations/${id}/edit`}
                className="btn btn-outline"
              >
                Edit
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-error"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel request"}
              </button>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}