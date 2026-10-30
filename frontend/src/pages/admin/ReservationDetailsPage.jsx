import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getReservationById,
  setReservationStatus,
} from "../../api/reservation";

export default function ReservationDetailsPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getReservationById(id)
      .then((data) => {
        setReservation(data);
        setAdminNotes(data.adminNotes || "");
      })
      .catch((err) => setError(err.message || "Could not load reservation."))
      .finally(() => setLoading(false));
  }, [id]);

  async function review(status) {
    setSaving(true);
    setError("");

    try {
      const result = await setReservationStatus(id, status, adminNotes);
      setReservation(result.reservation);
    } catch (err) {
      setError(err.message || "Could not update reservation.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div role="alert" className="alert alert-error">
        <span>{error || "Reservation not found."}</span>
      </div>
    );
  }

  const resource = reservation.resource;
  const requester = reservation.requestedBy;
  const pending = reservation.status === "pending";

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <Link to="/admin/reservations" className="link link-primary">
        ← Manage reservations
      </Link>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <article className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-base-content/60">Resource request</p>
              <h1 className="card-title text-2xl">
                {resource?.name || "Resource"}
              </h1>
            </div>
            <span className="badge badge-outline">{reservation.status}</span>
          </div>

          <div className="divider my-1" />

          <p><strong>Requested by:</strong> {requester?.name} ({requester?.email})</p>
          <p><strong>Department:</strong> {requester?.department || "—"}</p>
          <p><strong>Location:</strong> {resource?.location || "—"}</p>
          <p><strong>Start:</strong> {new Date(reservation.startTime).toLocaleString()}</p>
          <p><strong>End:</strong> {new Date(reservation.endTime).toLocaleString()}</p>
          <p><strong>Purpose:</strong> {reservation.purpose}</p>

          <label className="form-control">
            <span className="label">
              <span className="label-text font-medium">Admin note</span>
            </span>
            <textarea
              className="textarea textarea-bordered"
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              disabled={!pending}
            />
          </label>

          {pending && (
            <div className="card-actions justify-end">
              <button
                className="btn btn-error"
                disabled={saving}
                onClick={() => review("rejected")}
              >
                Reject
              </button>
              <button
                className="btn btn-success"
                disabled={saving}
                onClick={() => review("approved")}
              >
                {saving ? "Saving…" : "Approve"}
              </button>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}