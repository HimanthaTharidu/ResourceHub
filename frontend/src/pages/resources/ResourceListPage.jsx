import ResourceCard from "../../components/ResourceCard";
import { getResources } from "../../api/resources";
import ResourceFilters from "../../components/ResourceFilters";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    availability: "",
  });

  useEffect(() => {
    getResources()
      .then(setResources)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function updateFilter(name, value) {
    setFilters((previous) => ({ ...previous, [name]: value }));
  }
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = resource.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.category || resource.category === filters.category;

      const matchesAvailability = (filters.availability ===
        "" || String(resource.isAvailable) === filters.availability);

      return matchesAvailability && matchesCategory && matchesSearch;
    });
  }, [resources, filters]);

  if (loading) {
    return <p className="p-6">Loading resources…</p>;
  }

  if (error) {
    return <p className="alert alert-error m-6">{error}</p>;
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Resources</h1>
        {/* Later, show this link only to admins. */}
        <Link to="/admin/resources/new" className="btn btn-primary">
          Add resource
        </Link>
      </div>

      <ResourceFilters filters={filters} onChange={updateFilter} />

      {filteredResources.length === 0 ? (
        <p className="mt-6">No resources match your filters.</p>
      ) : (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource._id} resource={resource} />
          ))}
        </section>
      )}
    </main>
  );
}
