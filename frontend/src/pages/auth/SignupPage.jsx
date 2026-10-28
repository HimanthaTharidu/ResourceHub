import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    department: "",
    email: "",
    password: "",
  });
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setEmailErrors(data.email || "");
        setpasswordErrors(data.password || "");
        setError(data.message || "");
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-200 p-4">
      <section className="card w-full max-w-md border border-base-300 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="mb-3 text-center">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="mt-2 text-base-content/70">
              Sign up to browse and request resources.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="form-control">
              <span className="label"><span className="label-text">Name</span></span>
              <input
                id="name"
                className="input input-bordered w-full mb-3"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-control">
              <span className="label"><span className="label-text">Department</span></span>
              <input
                id="department"
                className="input input-bordered w-full mb-3"
                name="department"
                type="text"
                value={form.department}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-control">
              <span className="label"><span className="label-text">Email</span></span>
              <input
                id="email"
                className={`input input-bordered w-full mb-3 ${emailErrors ? "input-error" : ""}`}
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                aria-invalid={Boolean(emailErrors)}
                aria-describedby={emailErrors ? "email-error" : undefined}
              />
              {emailErrors && (
                <span id="email-error" role="alert" className="mt-1 text-sm text-error">
                  {emailErrors}
                </span>
              )}
            </label>

            <label className="form-control">
              <span className="label"><span className="label-text">Password</span></span>
              <input
                id="password"
                className={`input input-bordered w-full mb-6 ${passwordErrors ? "input-error" : ""}`}
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
                aria-invalid={Boolean(passwordErrors)}
                aria-describedby={passwordErrors ? "password-error" : undefined}
              />
              {passwordErrors && (
                <span id="password-error" role="alert" className="mt-1 text-sm text-error">
                  {passwordErrors}
                </span>
              )}
            </label>

            {error && (
              <div role="alert" className="alert alert-error py-2">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <><span className="loading loading-spinner loading-sm" /> Creating account…</> : "Sign up"}
            </button>
          </form>

          <p className="mt-2 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary font-medium">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default SignupPage;
