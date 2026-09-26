import React, { useState,useContext } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import PersonalTaskContext from '../context/PersonalTaskContext';
import { notify } from '../utils/notifications';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { getTasks, getuser } = useContext(PersonalTaskContext);
  const navigate = useNavigate();

  const host = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const loginuser = async () => {
    try {
      const response = await fetch(`${host}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email,password}),
      });

      const json = await response.json();
      if (json.success) {
        notify.success('Signed in');
        localStorage.setItem('token', json.authtoken);
        window.dispatchEvent(new Event('taskmanager:auth-changed'));
        await getuser();
        getTasks();
        navigate('/');
      } else {
        notify.error(json.error || 'Unable to sign in. Please try again.');
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
      notify.error('Unable to sign in. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginuser();

  };

  return (
    <main className="login-container" aria-labelledby="login-title">
      <div className="login-content">
        <span className="login-eyebrow">TASKFLOW</span>
        <h1 className="login-title" id="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to pick up where you left off.</p>
        <form onSubmit={handleSubmit} className="login-form">
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
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>

        <div className="signup-link">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>
    </main>
  );
};

export default Login;
