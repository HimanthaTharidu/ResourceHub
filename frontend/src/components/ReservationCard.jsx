import { Link } from "react-router-dom";

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

export default function ReservationCard({
  reservation,
  onCancel,
  cancelling = false,
}) {
  const resource = reservation.resource;
  const status = reservation.status || "pending";
  const canManage = status === "pending";

  return (
    <article className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-base-content/60">
              {resource?.category || "Resource"}
            </p>
            <h2 className="card-title">
              {resource?.name || "Resource reservation"}
            </h2>
          </div>

          <span className={`badge ${statusStyles[status] || "badge-ghost"}`}>
            {status}
          </span>
        </div>

        {resource?.location && (
          <p className="text-sm">Location: {resource.location}</p>
        )}

        <div>
          <p className="text-sm font-medium">Requested time</p>
          <time className="text-sm text-base-content/70">
            {formatDate(reservation.startTime)}
          </time>
          <span className="mx-1 text-base-content/50">to</span>
          <time className="text-sm text-base-content/70">
            {formatDate(reservation.endTime)}
          </time>
        </div>

        <p className="line-clamp-2 text-sm">{reservation.purpose}</p>

        <div className="card-actions justify-end pt-2">
          <Link
            to={`/reservations/${reservation._id}`}
            className="btn btn-ghost btn-sm"
          >
            Details
          </Link>

          {canManage && (
            <>
              <Link
                to={`/reservations/${reservation._id}/edit`}
                className="btn btn-outline btn-sm"
              >
                Edit
              </Link>

              <button
                type="button"
                className="btn btn-outline btn-error btn-sm"
                disabled={cancelling}
                onClick={() => onCancel?.(reservation._id)}
              >
                {cancelling ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  "Cancel"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
