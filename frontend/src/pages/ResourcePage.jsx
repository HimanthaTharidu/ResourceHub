import { useState, useEffect, use } from "react";
import { createResource, getResources } from "../api/resource";

const emptyForm = {
  name: "",
  category: "",
  capacity: "",
  location: "",
  maintenanceNotes: "",
  department: "",
};

function ResourcePage() {
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getResources()
      .then((data) => setResources(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await createResource({
        ...form,
        capacity: Number(form.capacity),
      });

      setResources((previous) => [result.resource, ...previous]);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <h1>Resources</h1>
      <h2>Add a resource</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          name="name"
          type="text"
          onChange={handleChange}
          value={form.name}
          required
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          <option value="lecture_hall">Lecture hall</option>
          <option value="lecture_theatre">Lecture theatre</option>
          <option value="auditorium">Auditorium</option>
          <option value="projector">Projector</option>
          <option value="computer_lab">Computer lab</option>
        </select>
        <label>Capacity</label>
        <input
          name="capacity"
          type="text"
          onChange={handleChange}
          value={form.capacity}
          required
        />
        <label>Location</label>
        <input
          name="location"
          type="text"
          onChange={handleChange}
          value={form.location}
          required
        />
        <label>Maintenance Notes</label>
        <input
          name="maintenanceNotes"
          type="text"
          onChange={handleChange}
          value={form.maintenanceNotes}
          required
        />
        <label>Department</label>
        <input
          name="department"
          type="text"
          onChange={handleChange}
          value={form.department}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>

        <h2>Resource list</h2>
        {loading ? (
          <p>loading ...</p>
        ) : resources.length === 0 ? (
          <p>No resourses yet</p>
        ) : (
          <ul>
            {resources.map((resource) => (
              <li key={resource._id}>
                <strong>{resource.name}</strong> — {resource.category},{" "}
                {resource.location} (capacity: {resource.capacity})
              </li>
            ))}
          </ul>
        )}
      </form>
    </main>
  );
}

export default ResourcePage;
