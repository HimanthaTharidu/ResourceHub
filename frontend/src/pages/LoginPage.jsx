import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {

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
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main>
      <h1>Log in</h1>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          name="email"
          type="text"
          value={form.email}
          onChange={handleChange}
          required
        />
        {emailErrors && (
          <p role="alert" className="email error">
            {emailErrors}
          </p>
        )}
        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {passwordErrors && (
          <p role="alert" className="email error">
            {passwordErrors}
          </p>
        )}

        <button>log in</button>
        {error && <div className="error">{error}</div>}
      </form>
      <div>
        <Link to='/signup'>Don&apos;t have an account? Register</Link>
      </div>
    </main>
  );
}

export default LoginPage;
