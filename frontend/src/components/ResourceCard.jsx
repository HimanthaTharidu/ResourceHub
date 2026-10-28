export default function ResourceCard({ resource, onViewDetails }) {
  return (
    <article className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body">
        <div className="flex justify-between gap-3">
          <div>
            <h2 className="card-title">{resource.name}</h2>
            <p className="opacity-70">{resource.category}</p>
          </div>

          <span
            className={`badge ${
              resource.isAvailable ? "badge-success" : "badge-error"
            }`}
          >
            {resource.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <p>Location: {resource.location}</p>
        {resource.capacity != null && <p>Capacity: {resource.capacity}</p>}

        <div className="card-actions justify-end">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onViewDetails(resource)}
          >
            View details
          </button>
        </div>
      </div>
    </article>
  );
}
