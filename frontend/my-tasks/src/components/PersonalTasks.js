import React, { useContext, useEffect, useState } from 'react';
import PersonalTaskContext from './PersonalTaskContext';
import PersonalTaskCard from './Personaltaskcard';
import CreateTask from './Createtask';
import { FiPlus, FiCheckCircle } from 'react-icons/fi';
import './css/Personal.css';

const PersonalTasks = () => {
  const { getTasks, deleteTask } = useContext(PersonalTaskContext);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [getTasks]);

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    }
  };

  const handleTaskComplete = (taskId) => {
    setTasks(tasks.map(task => 
      task._id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

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
          {tasks.length === 0 ? (
            <div className="empty-state">
              <img src="C:\Users\Dell\OneDrive - gitam.in\Desktop\My_tasks\frontend\my-tasks\src\Images\undraw_to-do-list_eoia.png" alt="No tasks" className="empty-illustration" />
              <p className="empty-message">No tasks found. Start by creating one!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <PersonalTaskCard 
                key={task._id}
                task={task}
                onDelete={handleDelete}
                onEdit={() => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
                onComplete={handleTaskComplete}
              />
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="task-modal">
            <button className="modal-close" onClick={() => {
              setShowModal(false);
              setSelectedTask(null);
            }}>
              &times;
            </button>
            <CreateTask 
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

export default PersonalTasks;