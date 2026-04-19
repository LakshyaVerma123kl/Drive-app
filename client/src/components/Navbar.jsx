import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLogout } from 'react-icons/hi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="navLogo" x1="0" y1="0" x2="40" y2="40">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="10" fill="url(#navLogo)" />
            <path d="M12 28V16l8-6 8 6v12H24v-6h-8v6z" fill="white" opacity="0.9" />
          </svg>
          <span className="brand-text">FileDrive</span>
        </div>

        <div className="navbar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="user-name">{user?.name || 'User'}</span>
          <button
            id="btn-logout"
            className="btn btn-ghost"
            onClick={handleLogout}
            title="Logout"
          >
            <HiOutlineLogout />
          </button>
        </div>
      </div>
    </nav>
  );
}
