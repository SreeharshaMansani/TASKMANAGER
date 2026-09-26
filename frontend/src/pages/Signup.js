import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import PersonalTaskContext from '../context/PersonalTaskContext';
import { notify } from '../utils/notifications';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { getTasks, getuser } = useContext(PersonalTaskContext);
  const navigate = useNavigate(); 

  const host = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const createuser = async () => {
    try {
      const response = await fetch(`${host}/api/auth/createuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await response.json();
      if (json.success) {
        notify.success('Account created');
        localStorage.setItem('token', json.authtoken);
        window.dispatchEvent(new Event('taskmanager:auth-changed'));
        await getuser();
        getTasks(); 
        navigate('/'); 
      } else {
        notify.error(json.error || 'Unable to create your account.');
      }
    } catch (error) {
      console.error("Error creating user:", error);
      notify.error('Unable to create your account. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createuser();
  };

  return (
    <main className="login-container" aria-labelledby="signup-title">
      <div className="login-content">
        <span className="login-eyebrow">TASKFLOW</span>
        <h1 className="login-title" id="signup-title">Create your account</h1>
        <p className="login-subtitle">Keep your personal and team tasks in one place.</p>
        <form onSubmit={handleSubmit} className="login-form">

          <div className="login-field">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              autoComplete="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              inputMode="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Sign Up</button>
        </form>

        <div className="signup-link">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </main>
  );
};

export default Signup;
