import React from 'react';
import './css/Home.css';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiUsers, FiBarChart2, FiArrowRight } from 'react-icons/fi';
import Dashboard from './Dashboard';

const Home = () => {
  const isLoggedIn = localStorage.getItem('token');

  return (
    <div className="home-page-container">
      {isLoggedIn ? (
        <>
          <Dashboard />
          <div className="container-fluid hero-container">
            <div className="gradient-overlay"></div>

            <div className="content-wrapper text-center">
              <h1 className="display-4 fw-bold mb-4 slide-in-top">
                Welcome to <span className="brand-highlight">TaskFlow</span>
                <div className="underline-animation"></div>
              </h1>

              <p className="lead mb-5 fade-in delay-1">
                Transform your productivity with smart task management
              </p>

              <div className="features-grid">
                <div className="feature-card pop-in delay-2">
                  <FiCheckCircle className="feature-icon" />
                  <h3>Personal Tasks</h3>
                  <p>Organize your individual workflow efficiently</p>
                  <Link to="/personal" className="btn btn-info position-absolute top-100 start-50 translate-middle">
                    Explore <FiArrowRight />
                  </Link>
                </div>

                <div className="feature-card pop-in delay-3">
                  <FiUsers className="feature-icon" />
                  <h3>Team Collaboration</h3>
                  <p>Manage group projects seamlessly</p>
                  <Link to="/team" className="btn btn-info position-absolute top-100 start-50 translate-middle">
                    Collaborate <FiArrowRight />
                  </Link>
                </div>


              </div>

              <footer className="mt-5 footer-text">
                © 2025 TaskFlow • Built with ❤️ by Sree Harsha
              </footer>
            </div>
          </div>
        </>
      ) : (
        <div className="container-fluid auth-container">
          <div className="content-wrapper text-center">
            <div className="auth-card slide-in-bottom">
              <h1 className="mb-4">Welcome to TaskFlow</h1>
              <p className="text-muted mb-5">Your productivity journey starts here</p>

              <div className="auth-buttons">
                <Link to="/login" className="btn btn-primary btn-glow">
                  Get Started
                </Link>
                <Link to="/signup" className="btn btn-outline-secondary">
                  Create Account
                </Link>
              </div>

              <div className="usp-grid">
                <div className="usp-item">
                  <FiCheckCircle />
                  <span>Smart Task Management</span>
                </div>
                <div className="usp-item">
                  <FiUsers />
                  <span>Team Collaboration</span>
                </div>
                <div className="usp-item">
                  <FiBarChart2 />
                  <span>Performance Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;