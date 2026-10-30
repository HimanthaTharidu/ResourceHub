import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllReservations,
  setReservationStatus,
} from "../../api/reservation";

const statusStyles = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
  cancelled: "badge-ghost",
};

export default function ManageReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState("");

  const loadReservations = useCallback(async () => {
    setError("");

    try {
      setReservations(await getAllReservations());
    } catch (err) {
      setError(err.message || "Could not load reservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  async function reviewReservation(id, status) {
    setWorkingId(id);
    setError("");

    try {
      const updatedReservation = await setReservationStatus(id, status);
      setReservations((currentReservations) =>
        currentReservations.map((reservation) =>
          reservation._id === updatedReservation._id
            ? updatedReservation
            : reservation,
        ),
      );
    } catch (err) {
      setError(err.message || "Could not update reservation.");
    } finally {
      setWorkingId("");
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
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Admin
        </p>
        <h1 className="text-3xl font-bold">Manage reservations</h1>
      </header>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadReservations}>Try again</button>
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="alert">
          <span>No reservation requests have been submitted.</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Requested by</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td>{reservation.resource?.name || "Resource"}</td>
                  <td>
                    {reservation.requestedBy?.name || "Faculty"}
                    <div className="text-xs text-base-content/60">
                      {reservation.requestedBy?.email}
                    </div>
                  </td>
                  <td>
                    <div>{new Date(reservation.startTime).toLocaleString()}</div>
                    <div className="text-xs text-base-content/60">
                      to {new Date(reservation.endTime).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        statusStyles[reservation.status] || "badge-ghost"
                      }`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/admin/reservations/${reservation._id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Details
                      </Link>
                      {reservation.status === "pending" && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            disabled={workingId === reservation._id}
                            onClick={() =>
                              reviewReservation(reservation._id, "approved")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            disabled={workingId === reservation._id}
                            onClick={() =>
                              reviewReservation(reservation._id, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}