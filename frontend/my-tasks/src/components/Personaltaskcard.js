import React, { useState, useContext } from 'react';
import './css/Personalcard.css';
import PersonalTaskContext from './PersonalTaskContext';

const PersonalTaskCard = ({ task }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '');

  const { updateTask, deleteTask,getTasks } = useContext(PersonalTaskContext);

  const start = task.startDate ? new Date(task.startDate).getTime() : null;
  const due = task.dueDate ? new Date(task.dueDate).getTime() : null;
  const now = Date.now();

  let progress = 0;
  if (start && due && due > start) {
    const totalDuration = due - start;
    const elapsed = now - start;
    progress = (elapsed / totalDuration) * 100;
    progress = Math.min(Math.max(progress, 0), 100);
  }

  const formattedDueDate = due ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date';

  const withStopPropagation = (fn) => (e) => {
    e.stopPropagation();
    fn(e);
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const handleUpdateClick = () => {
    setShowEditPopup(true);
    setShowOptions(false);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    await updateTask(task._id, editedTitle, editedDescription, editedDueDate);
    setShowEditPopup(false);
    getTasks();
  };
  const handledelete = async (e) => {
    e.preventDefault();
    await deleteTask(task._id);
    setShowEditPopup(false);
  };
  return (
    <>
      <div className="card">
        <div className="card__title">{task.title}</div>
        <div className="card__subtitle">{task.description}</div>

        <div className="card__progress">
          {start && due ? (
            <>
              <progress
                max="100"
                value={progress}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={progress}
              ></progress>
              <div className="card__progress-text">{Math.round(progress)}%</div>
            </>
          ) : (
            <span className="card__progress-text">No progress info</span>
          )}
        </div>

        <div className="card__indicator">Due Date: {formattedDueDate}</div>

        <div className="card__menu" onClick={handleMenuClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="4" viewBox="0 0 4 20" height="20" fill="none">
            <g fill="#000">
              <path d="m2 4c1.10457 0 2-.89543 2-2s-.89543-2-2-2-2 .89543-2 2 .89543 2 2 2z"></path>
              <path d="m2 12c1.10457 0 2-.8954 2-2 0-1.10457-.89543-2-2-2s-2 .89543-2 2c0 1.1046.89543 2 2 2z"></path>
              <path d="m2 20c1.10457 0 2-.8954 2-2s-.89543-2-2-2-2 .8954-2 2 .89543 2 2 2z"></path>
            </g>
          </svg>
        </div>

        {showOptions && (
          <div className="card__menu-options">
            <button className="btn btn-dark" onClick={withStopPropagation(handleUpdateClick)}>Update</button>
            <button className="btn btn-dark" onClick={withStopPropagation(handledelete)}>Delete</button>
          </div>
        )}
      </div>

      {showEditPopup && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h3>Edit Task</h3>
            <form onSubmit={handleUpdateSubmit}>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Title"
                required
              />
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Description"
                required
              />
              <label style={{ marginTop: '10px', display: 'block' }}>Finish By Date:</label>
              <input
                type="date"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-dark">Save</button>
                <button type="button" onClick={() => setShowEditPopup(false)} className="btn btn-light">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalTaskCard;
