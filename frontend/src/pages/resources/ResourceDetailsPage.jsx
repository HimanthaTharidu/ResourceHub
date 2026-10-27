import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getResourceById } from "../../api/resources";

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getResourceById(id)
      .then(setResource)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Loading resource…</p>;
  if (error) return <p className="alert alert-error m-6">{error}</p>;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link to="/resources" className="link mb-4 inline-block">
        ← Back to resources
      </Link>

      <article className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <h1 className="card-title text-3xl">{resource.name}</h1>
          <p>Category: {resource.category}</p>
          <p>Location: {resource.location}</p>
          {resource.capacity != null && <p>Capacity: {resource.capacity}</p>}
          <p>
            Availability: {resource.isAvailable ? "Available" : "Unavailable"}
          </p>
          {resource.maintenanceNotes && (
            <p>Maintenance notes: {resource.maintenanceNotes}</p>
          )}
        </div>
      </article>
    </main>
  );
}