import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={styles.page}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <span style={styles.icon}>⚡</span>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Log in to AuraPerformance HR Portal</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label htmlFor="email">ADMIN EMAIL</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="admin@auraperformance.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an admin account? </span>
          <Link to="/register" style={styles.link}>
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '2.5rem',
    background: 'rgba(22, 27, 38, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  icon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '0.5rem',
    textShadow: '0 0 25px rgba(99, 102, 241, 0.6)',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'white',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    marginTop: '0.25rem',
  },
  errorAlert: {
    background: 'rgba(244, 63, 94, 0.15)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    color: '#f87171',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  submitBtn: {
    marginTop: '1rem',
    padding: '0.8rem',
    fontSize: '0.95rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--accent-indigo)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'var(--transition-fast)',
  },
};

export default Login;
