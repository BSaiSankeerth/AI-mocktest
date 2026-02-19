import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-bg-dark">
            <div className="card w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-primary flex items-center justify-center gap-2">
                    <LogIn size={24} /> Login
                </h2>
                {error && <div className="text-danger text-center mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary w-full">
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center text-dim text-sm">
                    Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
