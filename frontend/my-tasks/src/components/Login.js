import React, { useState,useContext } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import PersonalTaskContext from './PersonalTaskContext';
import './css/Login.css'; 

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
        alert("Logged in sucessfully");
        localStorage.setItem('token', json.authtoken); 
        await getuser();
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
    loginuser();

  };

  return (
    <div className="login-container" style={{  height: "750px" }}>
      <div className="login-content">
        <h2 className="login-title">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="login-form">
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
    </div>
  );
};

export default Login;
