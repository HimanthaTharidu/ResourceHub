import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createResource,
  getResourceById,
  updateResource,
} from "../../api/resources";

const categories = [
  { value: "lecture_hall", label: "Lecture Hall" },
  { value: "lecture_theatre", label: "Lecture Theatre" },
  { value: "auditorium", label: "Auditorium" },
  { value: "equipment", label: "Equipment" },
  { value: "computer_lab", label: "Computer Lab" },
];

const emptyForm = {
  name: "",
  category: "",
  capacity: "",
  location: "",
  department: "",
  maintenanceNotes: "",
  isAvailable: true,
};

export default function ResourceFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;

    getResourceById(id)
      .then((resource) => {
        setForm({
          name: resource.name || "",
          category: resource.category || "",
          capacity: resource.capacity ?? "",
          location: resource.location || "",
          department: resource.department || "",
          maintenanceNotes: resource.maintenanceNotes || "",
          isAvailable: resource.isAvailable ?? true,
        });
      })
      .catch((err) => setError(err.message || "Could not load resource."))
      .finally(() => setLoading(false));
  }, [id, editing]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const values = {
      ...form,
      capacity: form.capacity === "" ? null : Number(form.capacity),
    };
    if (!form.category) {
      setError("Please choose a category.");
      setSaving(false);
      return;
    }

    try {
      if (editing) {
        await updateResource(id, values);
      } else {
        await createResource(values);
      }

      navigate("/admin/resources");
    } catch (err) {
      setError(err.message || "Could not save resource.");
    } finally {
      setSaving(false);
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
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/admin/resources" className="link link-primary">
          ← Manage resources
        </Link>
        <h1 className="mt-5 text-3xl font-bold">
          {editing ? "Edit resource" : "Add resource"}
        </h1>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card border border-base-300 bg-base-100 shadow-sm"
      >
        <div className="card-body gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Name?</legend>
            <input
              type="text"
              className="input"
              placeholder="Type here"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </fieldset>

          <div className="dropdown dropdown-bottom">
            <div tabIndex={0} role="button" className="btn m-1">
              {categories.find((item) => item.value === form.category)?.label ??
                "Choose category"}
            </div>

            <ul
              tabIndex={-1}
              className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
            >
              {categories.map(({ value, label }) => (
                <li key={value}>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({ ...previous, category: value }))
                    }
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Capacity?</legend>
            <input
              type="number"
              className="input"
              placeholder="Type here"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              required
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Location?</legend>
            <input
              type="text"
              className="input"
              placeholder="Type here"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Department?</legend>
            <input
              type="text"
              className="input"
              placeholder="Type here"
              name="department"
              value={form.department}
              onChange={handleChange}
              required
            />
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset-legend">Maintenance Notes?</legend>
            <textarea
              className="textarea"
              placeholder="Type here"
              name="maintenanceNotes"
              value={form.maintenanceNotes}
              onChange={handleChange}
            />
          </fieldset>

          <label className="label cursor-pointer justify-start gap-3">
            <input
              className="checkbox"
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
            />
            <span className="label-text">Available for reservations</span>
          </label>

          <div className="card-actions justify-end">
            <Link to="/admin/resources" className="btn btn-ghost">
              Cancel
            </Link>
            <button className="btn btn-primary" disabled={saving}>
              {saving
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Create resource"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
