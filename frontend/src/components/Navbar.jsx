import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <div style={styles.logo} onClick={() => navigate('/')}>
          <span style={styles.logoIcon}>⚡</span>
          <span className="glow-text" style={styles.logoText}>AuraPerformance <span style={styles.logoAi}>AI</span></span>
        </div>

        <div style={styles.navLinks}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/recommendations"
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            AI Recommendations
          </NavLink>
        </div>

        <div style={styles.profile}>
          <div style={styles.userInfo}>
            <span style={styles.userRole}>HR Admin</span>
            <span style={styles.userName}>{user.name}</span>
          </div>
          <div style={styles.avatar}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <button className="btn btn-danger" style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(9, 11, 15, 0.75)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 99,
    width: '100%',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0.8rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  logoIcon: {
    fontSize: '1.4rem',
    textShadow: '0 0 15px rgba(99, 102, 241, 0.6)',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ffffff 40%, #c084fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  logoAi: {
    fontSize: '0.65rem',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    color: 'white',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    WebkitTextFillColor: 'initial',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  link: {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    transition: 'var(--transition-fast)',
  },
  activeLink: {
    color: 'white',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 0 15px -5px rgba(99, 102, 241, 0.2)',
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    lineHeight: '1.2',
  },
  userRole: {
    fontSize: '0.7rem',
    color: 'var(--accent-purple)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'white',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.95rem',
    boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
  },
  logoutBtn: {
    padding: '0.45rem 0.9rem',
    fontSize: '0.8rem',
  },
};

export default Navbar;
