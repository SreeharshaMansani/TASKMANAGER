import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiCheck, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import PersonalTaskContext from '../../context/PersonalTaskContext';
import '../../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, getuser } = useContext(PersonalTaskContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event) => {
      if (!navRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (localStorage.getItem('token') && !user) {
      getuser();
    }
  }, [user, getuser]);

  const logout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event('taskmanager:auth-changed'));
    setUser('');
    navigate('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const isLoggedin = !!user;
  const name = user ? `Welcome, ${user}` : '';
  const navLinkClass = ({ isActive }) => `taskflow-nav-link${isActive ? ' is-active' : ''}`;

  return (
    <nav className="taskflow-navbar" aria-label="Main navigation" ref={navRef} onKeyDown={(event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }}>
      <div className="taskflow-navbar-inner">
        <Link className="taskflow-brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="taskflow-brand-mark"><FiCheck aria-hidden="true" /></span>
          TaskFlow
        </Link>
        <button
          className="taskflow-menu-toggle"
          type="button"
          ref={menuButtonRef}
          onClick={() => setMenuOpen((open) => !open)}
          aria-controls="taskflow-navigation"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </button>

        <div className={`taskflow-navbar-panel${menuOpen ? ' is-open' : ''}`} id="taskflow-navigation">
          <ul className="taskflow-nav-links">
            {localStorage.getItem('token') && (
              <li>
                <NavLink className={navLinkClass} to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              </li>
            )}
            <li>
              <NavLink className={navLinkClass} to="/personal" onClick={() => setMenuOpen(false)}>Personal Tasks</NavLink>
            </li>
            <li>
              <NavLink className={navLinkClass} to="/team" onClick={() => setMenuOpen(false)}>Team Tasks</NavLink>
            </li>
          </ul>
          {isLoggedin && (
            <div className="taskflow-nav-account">
              <span className="taskflow-nav-user" title={name}>{name}</span>
              <button type="button" onClick={handleSubmit} className="taskflow-logout"><FiLogOut aria-hidden="true" /> Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
