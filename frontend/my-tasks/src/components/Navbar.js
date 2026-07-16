import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PersonalTaskContext from './PersonalTaskContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser, getuser } = useContext(PersonalTaskContext);

  useEffect(() => {
    if (localStorage.getItem('token') && !user) {
      getuser();
    }
  }, [user, getuser]);

  const logout = () => {
    localStorage.clear();
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

  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={{ height: "75px", fontSize: "1rem", borderBottom: "1px solid var(--border-color)", background: "var(--bg-secondary)", zIndex: 100 }}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" style={{ fontWeight: 800, color: "var(--primary)" }}>TaskFlow</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            {localStorage.getItem('token') && (
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard" style={{ fontWeight: 500 }}>Dashboard</Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="nav-link" to="/personal" style={{ fontWeight: 500 }}>Personal Tasks</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/team" style={{ fontWeight: 500 }}>Team Tasks</Link>
            </li>
          </ul>
        </div>

        <div className="d-flex align-items-center">
          <span className="me-3" style={{ fontWeight: 500, color: "var(--text-secondary)" }}>{name}</span>
          {isLoggedin && <button type="button" onClick={handleSubmit} className="btn btn-outline-secondary btn-sm" style={{ borderRadius: "8px", fontWeight: 600 }}>Logout</button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
