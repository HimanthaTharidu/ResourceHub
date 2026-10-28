import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailErrors, setEmailErrors] = useState("");
  const [passwordErrors, setpasswordErrors] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setEmailErrors("");
    setpasswordErrors("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setEmailErrors(data.email || "");
        setpasswordErrors(data.password || "");
        setError(data.message || "");
        return;
      }
      const user = await refreshUser();

      if (!user) {
        throw new Error("Could not load your account");
      }
      navigate(user.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="min-h-screen bg-base-200 flex items-center justify-center p-4">
  <section className="card w-full max-w-md bg-base-100 shadow-xl">
    <div className="card-body">
      <h1 className="card-title text-3xl justify-center mb-2">Log in</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label" htmlFor="email">
            <span className="label-text">Email</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`input input-bordered w-full ${
              emailErrors ? "input-error" : ""
            }`}
            value={form.email}
            onChange={handleChange}
            required
          />
          {emailErrors && (
            <p role="alert" className="text-error text-sm mt-1">
              {emailErrors}
            </p>
          )}
        </div>

        <div className="form-control">
          <label className="label" htmlFor="password">
            <span className="label-text">Password</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className={`input input-bordered w-full ${
              passwordErrors ? "input-error" : ""
            }`}
            value={form.password}
            onChange={handleChange}
            required
          />
          {passwordErrors && (
            <p role="alert" className="text-error text-sm mt-1">
              {passwordErrors}
            </p>
          )}
        </div>

        {error && (
          <div role="alert" className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full">
          Log in
        </button>
      </form>

      <div className="text-center mt-4">
        <Link to="/signup" className="link link-primary">
          Don&apos;t have an account? Register
        </Link>
      </div>
    </div>
  </section>
</main>
  );
}

export default LoginPage;
