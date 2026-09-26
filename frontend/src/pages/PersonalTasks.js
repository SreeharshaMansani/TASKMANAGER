import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PersonalTaskContext from '../context/PersonalTaskContext';
import PersonalTaskCard from '../components/tasks/PersonalTaskCard';
import CreateTask from '../components/tasks/CreatePersonalTask';
import { FiPlus, FiCheckCircle, FiSearch, FiFilter } from 'react-icons/fi';
import '../styles/Personal.css';
import noTasksImg from '../assets/images/undraw_to-do-list_eoia.png';
import useTaskDialog from '../hooks/useTaskDialog';

const PersonalTasks = () => {
  const { tasks, getTasks } = useContext(PersonalTaskContext);
  const [showModal, setShowModal] = useState(false);
  const dialogRef = useTaskDialog(showModal, () => setShowModal(false));
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

  const sortedTasks = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filteredTasks = tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    // Sort tasks
    return filteredTasks.sort((a, b) => {
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

  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy]);

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

  return (
    <div className="task-page personal-tasks-container">

      <div className="header-section">
        <h2 className="page-title">
          <FiCheckCircle className="title-icon" />
          My Personal Tasks
        </h2>
        <button className="floating-action-btn" aria-label="Create personal task" onClick={() => setShowModal(true)}>
          <FiPlus className="plus-icon" />
        </button>
      </div>

      {/* Search, Filter, Sort Controls Panel */}
      <div className="controls-panel">
        <div className="search-bar-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..." aria-label="Search personal tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-wrapper">
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select
              aria-label="Filter by status" value={statusFilter}
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
              aria-label="Filter by priority" value={priorityFilter}
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
              aria-label="Filter by category" value={categoryFilter}
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
              aria-label="Sort tasks" value={sortBy}
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
        <div className="task-dialog-backdrop" onClick={() => setShowModal(false)}>
          <div className="task-modal" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Create personal task" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" aria-label="Close task form" onClick={() => {
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
