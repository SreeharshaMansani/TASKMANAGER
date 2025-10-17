import React, { useContext, useEffect, useState } from 'react';
import TeamTaskContext from './TeamTaskContext';
import TeamTaskCard from './TeamTaskCard';
import CreateTeamTasks from './CreateTeamTasks';
import { FiPlus, FiUsers} from 'react-icons/fi';
import './css/TeamTasks.css';

const TeamTasks = () => {
  const { teamTasks, getTeamTasks, deleteTeamTask } = useContext(TeamTaskContext);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
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
  }, [getTeamTasks]);

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this team task?')) {
      try {
        await deleteTeamTask(taskId);
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

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
          {teamTasks.length === 0 ? (
            <div className="empty-team-state">
              <img 
                src="/images/team-empty.svg" 
                alt="No team tasks" 
                className="empty-team-illustration" 
              />
              <p className="empty-team-text">No team tasks found. Create one to get started!</p>
            </div>
          ) : (
            teamTasks.map((task) => (
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
        <div className="team-modal-backdrop">
          <div className="team-modal-content">
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