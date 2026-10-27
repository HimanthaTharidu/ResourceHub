import { Link } from "react-router-dom";

export default function ResourceCard({ resource }) {
  return (
    <article className="card bg-base-100 border border-base-300 shadow-sm">
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
          <Link
            to={`/resources/${resource._id}`}
            className="btn btn-primary btn-sm"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}