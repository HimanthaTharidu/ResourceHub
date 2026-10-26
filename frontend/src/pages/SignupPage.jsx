import { useState } from "react";

function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    department: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailErrors, setEmailErrors] = useState("")
  const [passwordErrors, setpasswordErrors] = useState("")

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

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
      //console.log(data.email)
      if (!response.ok) {
        setEmailErrors(data.email || "")
        setpasswordErrors(data.password || "")
        setError(data.message || "")
      }
    } catch (err) {
      //throw new Error("Signup failed");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <main>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />
        <label>Department</label>
        <input
          name="department"
          type="text"
          value={form.department}
          onChange={handleChange}
          required
        />
        <label>Email</label>
        <input
          name="email"
          type="text"
          value={form.email}
          onChange={handleChange}
          required
        />
        {emailErrors && <p role="alert" className="email error">{emailErrors}</p>}
        <label>Password</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {passwordErrors && <p role="alert" className="password error">{passwordErrors}</p>}
        <button>Sign up</button>
        {error && <div className="error">{error}</div>}
      </form>
    </main>
  );
}

export default SignupPage;
