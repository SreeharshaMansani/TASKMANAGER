import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PersonalTaskContext from './PersonalTaskContext';
import TeamTaskContext from './TeamTaskContext';
import { FiList, FiCheckCircle, FiClock, FiAlertTriangle, FiArrowRight, FiUser, FiUsers } from 'react-icons/fi';
import './css/Dashboard.css';

const Dashboard = () => {
  const { tasks, getTasks } = useContext(PersonalTaskContext);
  const { teamTasks, getTeamTasks } = useContext(TeamTaskContext);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      getTasks();
      getTeamTasks();
    }
  }, [token, getTasks, getTeamTasks]); // Run once when token is verified

  if (!token) {
    return (
      <div className="auth-wall-container">
        <div className="auth-wall-card">
          <div className="auth-wall-icon">🔒</div>
          <h2>Authentication Required</h2>
          <p>Please log in or create an account to view your workspace dashboard.</p>
          <div className="auth-wall-actions">
            <Link to="/login" className="btn btn-primary">Login Now</Link>
            <Link to="/signup" className="btn btn-outline-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  // Personal task metrics
  const totalPersonal = tasks.length;
  const completedPersonal = tasks.filter(t => t.status === 'Completed').length;
  const pendingPersonal = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overduePersonal = tasks.filter(t => {
    if (t.status === 'Completed') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < today;
  }).length;

  // Team task metrics
  const totalTeam = teamTasks.length;
  const completedTeam = teamTasks.filter(t => t.status === 'Completed').length;
  const pendingTeam = teamTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const overdueTeam = teamTasks.filter(t => {
    if (t.status === 'Completed') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < today;
  }).length;

  // Aggregate metrics
  const totalTasks = totalPersonal + totalTeam;
  const completedTasks = completedPersonal + completedTeam;
  const pendingTasks = pendingPersonal + pendingTeam;
  const overdueTasks = overduePersonal + overdueTeam;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Urgent attention items (overdue or due within 3 days)
  const thresholdDate = new Date();
  thresholdDate.setDate(today.getDate() + 3);
  thresholdDate.setHours(23, 59, 59, 999);

  const combinedTasks = [
    ...tasks.map(t => ({ ...t, taskType: 'Personal' })),
    ...teamTasks.map(t => ({ ...t, taskType: 'Team' }))
  ];

  const urgentTasks = combinedTasks.filter(t => {
    if (t.status === 'Completed') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < thresholdDate;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const getRemainingDays = (dueDate) => {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return { text: 'Due Today', class: 'today' };
    if (diffDays === 1) return { text: '1 day left', class: 'warning' };
    if (diffDays > 1) return { text: `${diffDays} days left`, class: 'future' };
    if (diffDays === -1) return { text: 'Overdue by 1 day', class: 'critical' };
    return { text: `Overdue by ${Math.abs(diffDays)} days`, class: 'critical' };
  };

  return (
    <div className="dashboard-page-container">
      <div className="dashboard-page-header">
        <h1>Workspace Dashboard</h1>
        <p className="subtitle">Real-time overview of your personal and team tasks</p>
      </div>

      {/* Aggregate Stats Section */}
      <div className="dashboard-container">
        <h2 className="section-header-title">Workspace Summary</h2>
        <div className="dashboard-stats-grid">
          <div className="stat-card total-tasks">
            <div className="stat-icon-wrapper">
              <FiList className="stat-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Tasks</span>
              <span className="stat-value">{totalTasks}</span>
              <span className="stat-subtext">{totalPersonal} Personal • {totalTeam} Team</span>
            </div>
          </div>

          <div className="stat-card completed-tasks">
            <div className="stat-icon-wrapper">
              <FiCheckCircle className="stat-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{completedTasks}</span>
              <span className="stat-subtext">{completionRate}% Completion rate</span>
            </div>
            {totalTasks > 0 && (
              <div className="stat-progress-bar">
                <div className="stat-progress-fill" style={{ width: `${completionRate}%` }}></div>
              </div>
            )}
          </div>

          <div className="stat-card pending-tasks">
            <div className="stat-icon-wrapper">
              <FiClock className="stat-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Pending / Active</span>
              <span className="stat-value">{pendingTasks}</span>
              <span className="stat-subtext">Requires attention</span>
            </div>
          </div>

          <div className="stat-card overdue-tasks">
            <div className="stat-icon-wrapper">
              <FiAlertTriangle className="stat-icon" />
            </div>
            <div className="stat-content">
              <span className="stat-label">Overdue</span>
              <span className="stat-value critical">{overdueTasks}</span>
              <span className="stat-subtext">{overdueTasks > 0 ? 'Urgent attention required' : 'All caught up!'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="dashboard-split-layout">
        {/* Left Side: Personal vs Team reports */}
        <div className="dashboard-split-left">
          <div className="breakdown-card">
            <div className="breakdown-header">
              <h3><FiUser /> Personal Tasks Report</h3>
              <Link to="/personal" className="btn-link">View Tasks <FiArrowRight /></Link>
            </div>
            <div className="breakdown-stats">
              <div className="b-stat">
                <span className="b-value">{totalPersonal}</span>
                <span className="b-label">Total</span>
              </div>
              <div className="b-stat">
                <span className="b-value text-success">{completedPersonal}</span>
                <span className="b-label">Completed</span>
              </div>
              <div className="b-stat">
                <span className="b-value text-secondary">{pendingPersonal}</span>
                <span className="b-label">Pending</span>
              </div>
              <div className="b-stat">
                <span className="b-value text-danger">{overduePersonal}</span>
                <span className="b-label">Overdue</span>
              </div>
            </div>
          </div>

          <div className="breakdown-card">
            <div className="breakdown-header">
              <h3><FiUsers /> Team Tasks Report</h3>
              <Link to="/team" className="btn-link">View Team <FiArrowRight /></Link>
            </div>
            <div className="breakdown-stats">
              <div className="b-stat">
                <span className="b-value">{totalTeam}</span>
                <span className="b-label">Total</span>
              </div>
              <div className="b-stat">
                <span className="b-value text-success">{completedTeam}</span>
                <span className="b-label">Completed</span>
              </div>
              <div className="b-stat">
                <span className="b-value text-secondary">{pendingTeam}</span>
                <span className="b-label">Pending</span>
              </div>
              <div className="b-stat">
                <span className="b-value text-danger">{overdueTeam}</span>
                <span className="b-label">Overdue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Urgent attention list */}
        <div className="dashboard-split-right">
          <div className="action-items-card">
            <div className="action-header">
              <h3>⚠️ Urgent Action Items</h3>
              <span className="action-count">{urgentTasks.length} items</span>
            </div>
            
            <div className="action-list">
              {urgentTasks.length === 0 ? (
                <div className="action-empty-state">
                  <FiCheckCircle className="empty-ok-icon" />
                  <p>No urgent action items. You're completely caught up!</p>
                </div>
              ) : (
                urgentTasks.slice(0, 5).map((task) => {
                  const dayInfo = getRemainingDays(task.dueDate);
                  return (
                    <div key={task._id} className="action-item-row">
                      <div className="action-item-left">
                        <div className="action-item-title-row">
                          <span className={`action-type-badge ${task.taskType.toLowerCase()}`}>
                            {task.taskType}
                          </span>
                          <h4 className="action-item-title">{task.title}</h4>
                        </div>
                        {task.description && <p className="action-item-desc">{task.description}</p>}
                      </div>
                      <div className="action-item-right">
                        <span className={`action-priority badge priority-${(task.priority || 'Medium').toLowerCase()}`}>
                          {task.priority || 'Medium'}
                        </span>
                        <span className={`action-due-badge remaining-time ${dayInfo.class}`}>
                          {dayInfo.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {urgentTasks.length > 5 && (
              <div className="action-footer">
                <span>Showing top 5 tasks. Resolve them in your task boards.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
