export default function ResourceFilter({ filters, onChange }) {
  return (
    <div>
      <input
        className="input input-bordered"
        type="search"
        placeholder="Search resources"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />

      <select
        className="select select-bordered"
        value={filters.category}
        onChange={(event) => onChange("category", event.target.value)}
      >
        <option value="">All categories</option>
        <option value="lecture_hall">Lecture hall</option>
        <option value="lecture theatre">Lecture theatre</option>
        <option value="auditorium">Auditorium</option>
        <option value="projector">Projector</option>
        <option value="computer lab">Computer lab</option>
      </select>

      <select
        className="select select-bordered"
        value={filters.availability}
        onChange={(event) => onChange("availability", event.target.value)}
      >
        <option value="">Any availability</option>
        <option value="true">Available</option>
        <option value="false">Unavailable</option>
      </select>
    </div>
  );
}
