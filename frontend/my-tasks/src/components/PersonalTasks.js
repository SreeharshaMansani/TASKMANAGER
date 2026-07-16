import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PersonalTaskContext from './PersonalTaskContext';
import PersonalTaskCard from './Personaltaskcard';
import CreateTask from './Createtask';
import { FiPlus, FiCheckCircle, FiSearch, FiFilter } from 'react-icons/fi';
import './css/Personal.css';
import noTasksImg from '../Images/undraw_to-do-list_eoia.png';

const PersonalTasks = () => {
  const { tasks, getTasks } = useContext(PersonalTaskContext);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Search & Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchTasks = async () => {
      try {
        await getTasks();
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [getTasks, token]);

  if (!token) {
    return (
      <div className="auth-wall-container">
        <div className="auth-wall-card">
          <div className="auth-wall-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please log in or create an account to view and manage your personal tasks.</p>
          <div className="auth-wall-actions">
            <Link to="/login" className="btn btn-primary">Login Now</Link>
            <Link to="/signup" className="btn btn-outline-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'dueDate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'priority') {
      const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      return weightB - weightA; // High priority first
    }
    return 0;
  });

  return (
    <div className="personal-tasks-container">

      <div className="header-section">
        <h2 className="page-title">
          <FiCheckCircle className="title-icon" />
          My Personal Tasks
        </h2>
        <button className="floating-action-btn" onClick={() => setShowModal(true)}>
          <FiPlus className="plus-icon" />
        </button>
      </div>

      {/* Search, Filter, Sort Controls Panel */}
      <div className="controls-panel">
        <div className="search-bar-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-wrapper">
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="filter-group">
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="filter-group">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Categories</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
            </select>
          </div>

          <div className="filter-group sort-group">
            <span className="sort-label">Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select sort-select"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="none">Default</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-skeleton">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="task-skeleton-card">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tasks-grid">
          {sortedTasks.length === 0 ? (
            <div className="empty-state">
              <img src={noTasksImg} alt="No tasks" className="empty-illustration" />
              <p className="empty-message">No tasks matched your search/filters.</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <PersonalTaskCard 
                key={task._id}
                task={task}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => {
              setShowModal(false);
            }}>
              &times;
            </button>
            <CreateTask 
              onClose={() => {
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalTasks;