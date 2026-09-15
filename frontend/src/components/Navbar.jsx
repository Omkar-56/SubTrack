import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `px-1 pb-1 border-b-2 text-sm transition-colors ${
    isActive ? 'border-ledger text-ink font-medium' : 'border-transparent text-ink/50 hover:text-ink'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="font-display text-lg font-semibold tracking-tight">SubTrack</span>
          {user && (
            <nav className="flex gap-6">
              <NavLink to="/" end className={linkClass}>Overview</NavLink>
              <NavLink to="/subscriptions" className={linkClass}>Subscriptions</NavLink>
            </nav>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-ink/50">{user.email}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-sm text-ink/60 hover:text-rust"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
