import React from 'react';
import '../styles/Home.css';
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
          <section className="home-hero" aria-labelledby="home-heading">
            <div className="home-content">
              <p className="home-eyebrow">YOUR WORK, ORGANIZED</p>
              <h2 id="home-heading">Keep things moving with <span className="home-brand">TaskFlow</span></h2>
              <p className="home-lead">One place for your personal plans and shared projects.</p>
              <div className="home-features">
                <article className="home-feature">
                  <FiCheckCircle className="home-feature-icon" aria-hidden="true" />
                  <h3>Personal Tasks</h3>
                  <p>Organize your individual workflow efficiently.</p>
                  <Link to="/personal" className="btn btn-primary">Explore tasks <FiArrowRight aria-hidden="true" /></Link>
                </article>
                <article className="home-feature">
                  <FiUsers className="home-feature-icon" aria-hidden="true" />
                  <h3>Team Collaboration</h3>
                  <p>Keep everyone on the same page with shared tasks.</p>
                  <Link to="/team" className="btn btn-primary">View team tasks <FiArrowRight aria-hidden="true" /></Link>
                </article>
              </div>
              <footer className="home-footer">© {new Date().getFullYear()} TaskFlow · Built by Sree Harsha</footer>
            </div>
          </section>
        </>
      ) : (
        <main className="home-auth" aria-labelledby="home-heading">
          <div className="home-welcome-card">
            <div className="home-mark" aria-hidden="true"><FiCheckCircle /></div>
            <p className="home-eyebrow">A LITTLE FOCUS. A LOT DONE.</p>
            <h1 id="home-heading">Welcome to <span className="home-brand">TaskFlow</span></h1>
            <p className="home-lead">Make room for what matters. Organize your tasks, work with your team, and see your progress.</p>
            <div className="home-auth-actions">
              <Link to="/login" className="btn btn-primary">Get Started <FiArrowRight aria-hidden="true" /></Link>
              <Link to="/signup" className="btn btn-outline-secondary">Create Account</Link>
            </div>
            <div className="home-benefits">
              <div><FiCheckCircle aria-hidden="true" /><span>Personal tasks</span></div>
              <div><FiUsers aria-hidden="true" /><span>Team collaboration</span></div>
              <div><FiBarChart2 aria-hidden="true" /><span>Clear progress</span></div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Home;
