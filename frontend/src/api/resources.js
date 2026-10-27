const API_URL = import.meta.env.VITE_API_URL;

export async function getResources() {
  const response = await fetch(`${API_URL}/resources`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not load resources");
  }

  return response.json();
}

export async function getResourceById(id) {
  const response = await fetch(`${API_URL}/resources/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(
      response.status === 404 ? "Resource not found" : "Could not load resource",
    );
  }

  return response.json();
}