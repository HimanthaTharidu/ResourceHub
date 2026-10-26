import { useState } from "react";

function LoginPage(){
    const [form, setForm] = useState({email: '', password: ''})
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
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "login failed");
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
            <h1>Log in</h1>
            <form onSubmit={handleSubmit}>
                <label>Email</label>
                <input name="email" type="text" value={form.email} onChange={handleChange} required/>
                <label>Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required/>

                <button>log in</button>
                {error && <div className="error">{error}</div>}
            </form>
        </main>
    )
}

export default LoginPage