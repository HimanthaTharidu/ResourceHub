const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/resources${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Resource request failed");
  }

  return data;
}

export function createResource(values) {
  return request("", {
    method: "POST",
    body: JSON.stringify(values),
  });
}

export function updateResource(id, values) {
  return request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(values),
  });
}

export function deleteResource(id) {
  return request(`/${id}`, {
    method: "DELETE",
  });
}

export async function getResources() {
  return request("")
}

export async function getResourceById(id) {
 return request(`/${id}`)
}

