const categories = [
  { value: "", label: "All categories" },
  { value: "lecture_hall", label: "Lecture hall" },
  { value: "lecture_theatre", label: "Lecture theatre" },
  { value: "auditorium", label: "Auditorium" },
  { value: "equipment", label: "Equipment" },
  { value: "computer_lab", label: "Computer lab" },
];

const availabilityOptions = [
  { value: "", label: "Any availability" },
  { value: "true", label: "Available" },
  { value: "false", label: "Unavailable" },
];

export default function ResourceFilter({ filters, onChange }) {
  const selectedLabel =
    categories.find((category) => category.value === filters.category)?.label ??
    "All categories";
  
  const availabilityLabel =
    availabilityOptions.find((option) => option.value === filters.availability)
      ?.label ?? "Any availability";

  return (
    <div>
      <input
        className="input input-bordered"
        type="search"
        placeholder="Search resources"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />

      <div className="dropdown dropdown-bottom">
        <div tabIndex={0} role="button" className="btn m-1">
          {selectedLabel}
        </div>

        <ul
          tabIndex={-1}
          className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          {categories.map((category) => (
            <li key={category.value}>
              <button
                type="button"
                value={category.value}
                onClick={(event) => {
                  onChange("category", event.currentTarget.value);
                  event.currentTarget.blur();
                }}
              >
                {category.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="dropdown dropdown-bottom">
        <div tabIndex={0} role="button" className="btn m-1">
          {availabilityLabel}
        </div>

        <ul
          tabIndex={-1}
          className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          {availabilityOptions.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                value={option.value}
                onClick={(event) => {
                  onChange("availability", event.currentTarget.value);
                  event.currentTarget.blur();
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
