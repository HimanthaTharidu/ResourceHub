import ResourceCard from "../../components/ResourceCard";
import ResourceDetailsModal from "../../components/ResourceDetailsModal";
import ResourceFilters from "../../components/ResourceFilters";
import { getResources } from "../../api/resources";
import { useEffect, useMemo, useState } from "react";

export default function ResourceListPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    availability: "",
  });
  const [selectedResource, setSelectedResource] = useState(null);

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
      const matchesAvailability =
        filters.availability === "" ||
        String(resource.isAvailable) === filters.availability;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [resources, filters]);

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="alert alert-error m-4">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Resources</h1>
        <p className="mt-1 text-base-content/70">
          Browse resources and open one to see its details.
        </p>
      </div>

      <ResourceFilters filters={filters} onChange={updateFilter} />

      {filteredResources.length === 0 ? (
        <p className="mt-6">No resources match your filters.</p>
      ) : (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onViewDetails={setSelectedResource}
            />
          ))}
        </section>
      )}

      <ResourceDetailsModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </main>
  );
}
