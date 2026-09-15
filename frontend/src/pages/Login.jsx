import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="font-display text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-ink/60">Sign in to see what's renewing.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-sm border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ledger focus:ring-1 focus:ring-ledger"
          />
        </div>
        {error && <p className="text-sm text-rust">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-sm bg-ledger py-2 text-sm font-medium text-white transition-colors hover:bg-ledger-dark disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        New here? <Link to="/register" className="text-ledger hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
