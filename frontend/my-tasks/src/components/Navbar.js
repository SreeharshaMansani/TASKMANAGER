import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isLoggedin, setIsLoggedin] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const getName = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/auth/getuser', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': token,
          },
        });

        const json = await response.json();
        if (json.name) {
          setName(`Welcome, ${json.name}`);
          setIsLoggedin(true);
        } else {
          console.error(json.error || 'Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    getName();
  }, []);

  const logout = () => {
    localStorage.clear();
    setName('');
    setIsLoggedin(false);
    navigate('/');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark" style={{ height: "75px", fontSize: "20px", fontFamily: "cursive", color: "#3E3F5B" }}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">MyTasks</Link>
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
            <li className="nav-item">
              <Link className="nav-link" to="/personal">Personal Tasks</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/team">Team Tasks</Link>
            </li>
          </ul>
        </div>

        <div className="d-flex align-items-center" style={{ color: "#F1EFEC" }}>
          <span className="me-3">{name}</span>
          {isLoggedin && <button type="button" onClick={handleSubmit} className="btn btn-light">Logout</button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
