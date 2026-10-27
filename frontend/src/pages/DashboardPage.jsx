import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          { credentials: "include" },
        );

        if (response.status === 401) {
          navigate("/login");
          return;
        }
        if (!response.ok) {
          throw new Error("Could not load user");
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        setErrors(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [navigate]);

  async function handleClick() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.ok) {
        navigate("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Could not connect to the server:", error);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!user) return <p role="alert">{errors || "Could not load user."}</p>;

  return (
    <main>
      <h1>Dashboard</h1><br />
      <div>
        <h2>welcome : {user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Department: {user.department}</p>
      </div>
      {errors && <p role="alert">{errors}</p>}
      <button onClick={handleClick}>Log out</button>
    </main>
  );
}

export default DashboardPage;
