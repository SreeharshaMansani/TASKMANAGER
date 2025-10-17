import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Login.css';
import PersonalTaskContext from './PersonalTaskContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { getTasks } = useContext(PersonalTaskContext);
  const navigate = useNavigate(); 

  const createuser = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/createuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await response.json();
      if (json.success) {
        alert(json.response);
        localStorage.setItem('token', json.authtoken);
        getTasks(); 
        navigate('/'); 
      } else {
        alert(json.error || "Some error occurred");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createuser();
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <h2 className="login-title">Create Account</h2>
        <form onSubmit={handleSubmit} className="login-form">

          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
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
    </div>
  );
};

export default Signup;
