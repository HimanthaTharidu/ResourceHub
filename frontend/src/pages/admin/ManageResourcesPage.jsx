import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteResource,
  getResources,
} from "../../api/resources";

export default function ManageResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadResources = useCallback(async () => {
    setError("");

    try {
      setResources(await getResources());
    } catch (err) {
      setError(err.message || "Could not load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  async function handleDelete(resource) {
    if (!window.confirm(`Delete "${resource.name}"?`)) return;

    setDeletingId(resource._id);
    setError("");

    try {
      await deleteResource(resource._id);
      setResources((current) =>
        current.filter((item) => item._id !== resource._id),
      );
    } catch (err) {
      setError(err.message || "Could not delete the resource.");
    } finally {
      setDeletingId("");
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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Admin
          </p>
          <h1 className="text-3xl font-bold">Manage resources</h1>
        </div>
        <Link to="/admin/resources/new" className="btn btn-primary">
          Add resource
        </Link>
      </header>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
          <button className="btn btn-sm" onClick={loadResources}>
            Try again
          </button>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="card border border-base-300 bg-base-100">
          <div className="card-body items-center text-center">
            <h2 className="card-title">No resources yet</h2>
            <p>Add a resource to make it available to faculty.</p>
          </div>
        </div>
      ) : (
        <div className="hidden md:block overflow-x-auto rounded-box border border-base-300 bg-base-100">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource._id}>
                  <td className="font-medium">{resource.name}</td>
                  <td>{resource.category}</td>
                  <td>{resource.location}</td>
                  <td>
                    <span
                      className={`badge ${
                        resource.isAvailable ? "badge-success" : "badge-error"
                      }`}
                    >
                      {resource.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/resources/${resource._id}/edit`}
                        className="btn btn-outline btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        className="btn btn-outline btn-error btn-sm"
                        disabled={deletingId === resource._id}
                        onClick={() => handleDelete(resource)}
                      >
                        {deletingId === resource._id ? "Deleting…" : "Delete"}
                      </button>
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