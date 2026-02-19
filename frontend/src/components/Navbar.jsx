import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar-container">
            <div className="container navbar-inner">
                {/* Left: Brand + Dashboard */}
                <div className="navbar-left">
                    <Link to="/dashboard" className="navbar-brand">
                        <span className="brand-icon">⚡</span> AI Mock Interview
                    </Link>
                    <Link to="/dashboard" className="navbar-link">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                </div>

                {/* Right: New Test + Logout */}
                <div className="navbar-right">
                    <Link to="/upload" className="btn btn-primary btn-sm">
                        <PlusCircle size={16} /> New Test
                    </Link>
                    <button onClick={handleLogout} className="btn btn-logout">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
