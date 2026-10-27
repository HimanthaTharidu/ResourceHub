import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();

  async function handleClick() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
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

  return (
    <>
      <h1>Dashboard</h1>
      <button onClick={handleClick}>Log out</button>
    </>
  );
}

export default DashboardPage;