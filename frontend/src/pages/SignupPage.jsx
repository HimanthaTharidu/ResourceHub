import { useState } from "react";

function SignupPage(){
    const [form, setForm] = useState({name: '', department: '', email: '', password: ''})
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleChange(e){
        const {name, value} = e.target
        setForm(previousForm => ({...previousForm, [name]: value}));
    }

    async function handleSubmit(e){
        e.preventDefault();
        setLoading(true);

        try{
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Signup failed");
            }
        }
        catch(err){
            setError(err.message);
        }
        finally{
            setLoading(false);
        }
    }
    return(
        <main>
            <h1>Sign Up</h1>
            <form onSubmit={handleSubmit}>
                <label>Name</label>
                <input name="name" type="text" value={form.name} onChange={handleChange} required/>
                <label>Department</label>
                <input name="department" type="text" value={form.department} onChange={handleChange} required/>
                <label>Email</label>
                <input name="email" type="text" value={form.email} onChange={handleChange} required/>
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required/>

                <button>Sign up</button>
                {error && <div className="error">{error}</div>}
            </form>
        </main>
    )
}

export default SignupPage