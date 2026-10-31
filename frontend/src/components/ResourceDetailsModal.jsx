export default function ResourceDetailsModal({ resource, onClose }) {
  if (!resource) return null;

  const department = resource.department;
  const departmentName =
    typeof department === "object" ? department?.name : department;

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <div
      className="modal modal-open modal-bottom sm:modal-middle"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
      onClick={handleBackdropClick}
    >
      <section className="modal-box max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-base-content/60">{resource.category}</p>
            <h2 id="resource-modal-title" className="text-2xl font-bold">
              {resource.name}
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-square btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close resource details"
          >
            ✕
          </button>
        </div>

        <div className="divider my-2" />

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-base-content/60">Location</dt>
            <dd className="font-medium">{resource.location}</dd>
          </div>

          {resource.capacity != null && (
            <div>
              <dt className="text-sm text-base-content/60">Capacity</dt>
              <dd className="font-medium">{resource.capacity}</dd>
            </div>
          )}

          <div>
            <dt className="text-sm text-base-content/60">Department</dt>
            <dd className="font-medium">{departmentName || "Not specified"}</dd>
          </div>

          <div>
            <dt className="text-sm text-base-content/60">Availability</dt>
            <dd>
              <span
                className={`badge ${
                  resource.isAvailable ? "badge-success" : "badge-error"
                }`}
              >
                {resource.isAvailable ? "Available" : "Unavailable"}
              </span>
            </dd>
          </div>

          {resource.maintenanceNotes && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-base-content/60">Maintenance notes</dt>
              <dd className="whitespace-pre-wrap font-medium">
                {resource.maintenanceNotes}
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}
