const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}/reservations${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const text = response.status === 204 ? "" : await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Reservation request failed");
  }

  return data;
}

export async function getMyReservations() {
  const data = await request("/me");
  return data.reservations;
}

export async function getReservationById(id) {
  const data = await request(`/${id}`);
  return data.reservation;
}

export function createReservation(values) {
  return request("", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateReservation(id, values) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(values),
  });
}

export function cancelReservation(id) {
  return request(`/${id}`, { method: "DELETE" });
}