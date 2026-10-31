import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getResources } from "../../api/resources";
import {
  createReservation,
  getReservationById,
  updateReservation,
} from "../../api/reservation";

function toLocalDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);

  return localDate.toISOString().slice(0, 16);
}

export default function CreateReservationPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    resourceId: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });
  const [reservationStatus, setReservationStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFormData() {
      setLoading(true);
      setError("");

      try {
        const [resourceList, reservation] = await Promise.all([
          getResources(),
          isEditing ? getReservationById(id) : Promise.resolve(null),
        ]);

        if (!active) return;

        setResources(resourceList);

        if (reservation) {
          const resource = reservation.resource;

          setReservationStatus(reservation.status);
          setForm({
            resourceId: typeof resource === "object" ? resource?._id : resource,
            startTime: toLocalDateTime(reservation.startTime),
            endTime: toLocalDateTime(reservation.endTime),
            purpose: reservation.purpose || "",
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Could not load the form.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFormData();

    return () => {
      active = false;
    };
  }, [id, isEditing]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (new Date(form.startTime) <= new Date()) {
      setError("Start time must be in the future.");
      return;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError("End time must be later than start time.");
      return;
    }

    setSaving(true);

    try {
      const values = {
        resourceId: form.resourceId,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        purpose: form.purpose.trim(),
      };

      if (isEditing) {
        await updateReservation(id, values);
      } else {
        await createReservation(values);
      }

      navigate("/reservations", { replace: true });
    } catch (err) {
      setError(err.message || "Could not save the reservation.");
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

  const canEdit = !isEditing || reservationStatus === "pending";

  const availableResources = resources.filter(
    (resource) => resource.isAvailable || resource._id === form.resourceId,
  );

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/reservations" className="link link-primary">
          ← My reservations
        </Link>
        <h1 className="mt-5 text-3xl font-bold">
          {isEditing ? "Edit reservation" : "Request a resource"}
        </h1>
        <p className="mt-1 text-base-content/70">
          {isEditing
            ? "Only pending reservation requests can be edited."
            : "Choose a resource, time, and purpose for your request."}
        </p>
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {isEditing && !canEdit && (
        <div role="alert" className="alert alert-warning">
          <span>
            This reservation is no longer pending, so it can’t be edited.
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card border border-base-300 bg-base-100 shadow-sm"
      >
        <div className="card-body gap-4">
          <label className="form-control">
            <span className="label">
              <span className="label-text font-medium">Resource </span>
            </span>
            <select
              className="select select-bordered"
              name="resourceId"
              value={form.resourceId}
              onChange={handleChange}
              required
              disabled={!canEdit}
            >
              <option value="">Choose a resource</option>
              {availableResources.map((resource) => (
                <option key={resource._id} value={resource._id}>
                  {resource.name} — {resource.category} ({resource.location})
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-control">
              <span className="label">
                <span className="label-text font-medium">Start time</span>
              </span>
              <input
                className="input input-bordered"
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
                disabled={!canEdit}
              />
            </label>

            <label className="form-control">
              <span className="label">
                <span className="label-text font-medium">End time</span>
              </span>
              <input
                className="input input-bordered"
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
                disabled={!canEdit}
              />
            </label>
          </div>

          <fieldset className="fieldset">
            <legend className="fieldset-legend font-medium">Purpose</legend>
            <textarea
              className="textarea h-24"
              placeholder="What will you use the resource for?"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              maxLength={500}
              required
              disabled={!canEdit}
            ></textarea>
          </fieldset>

          {availableResources.length === 0 && (
            <p className="text-sm text-warning">
              There are no available resources to request.
            </p>
          )}

          <div className="card-actions justify-end">
            <Link to="/reservations" className="btn btn-ghost">
              Back
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !canEdit || availableResources.length === 0}
            >
              {saving ? "Saving…" : isEditing ? "Save changes" : "Send request"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
