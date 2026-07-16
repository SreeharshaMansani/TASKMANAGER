import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TeamTaskContext from './TeamTaskContext';
import TeamTaskCard from './TeamTaskCard';
import CreateTeamTasks from './CreateTeamTasks';
import { FiPlus, FiUsers, FiSearch, FiFilter } from 'react-icons/fi';
import './css/TeamTasks.css';

const TeamTasks = () => {
  const { teamTasks, getTeamTasks, deleteTeamTask } = useContext(TeamTaskContext);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
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
        await getTeamTasks();
        setError(null);
      } catch (err) {
        setError('Failed to load team tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [getTeamTasks, token]);

  if (!token) {
    return (
      <div className="auth-wall-container">
        <div className="auth-wall-card">
          <div className="auth-wall-icon">👥</div>
          <h2>Authentication Required</h2>
          <p>Please log in or create an account to view and manage team tasks.</p>
          <div className="auth-wall-actions">
            <Link to="/login" className="btn btn-primary">Login Now</Link>
            <Link to="/signup" className="btn btn-outline-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this team task?')) {
      try {
        await deleteTeamTask(taskId);
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  // Filter tasks
  const filteredTasks = teamTasks.filter(task => {
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
    <div className="team-tasks-container">

      <div className="team-header">
        <h2 className="team-title">
          <FiUsers className="team-icon" />
          Team Tasks
        </h2>
        <button 
          className="floating-team-button"
          onClick={() => {
            setShowModal(true);
            setSelectedTask(null);
          }}
        >
          <FiPlus className="plus-icon" />
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Search, Filter, Sort Controls Panel */}
      <div className="controls-panel">
        <div className="search-bar-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search team tasks..."
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
        <div className="loading-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="team-skeleton">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="team-tasks-grid">
          {sortedTasks.length === 0 ? (
            <div className="empty-team-state">
              <p className="empty-team-text">No team tasks matched your search/filters.</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TeamTaskCard
                key={task._id}
                task={task}
                onDelete={handleDelete}
                onEdit={() => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="team-modal-backdrop" onClick={() => {
          setShowModal(false);
          setSelectedTask(null);
        }}>
          <div className="team-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="team-modal-close"
              onClick={() => {
                setShowModal(false);
                setSelectedTask(null);
              }}
            >
              &times;
            </button>
            <CreateTeamTasks 
              onClose={() => {
                setShowModal(false);
                setSelectedTask(null);
              }}
              editTask={selectedTask}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTasks;