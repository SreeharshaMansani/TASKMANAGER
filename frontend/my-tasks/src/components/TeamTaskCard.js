import React, { useState, useContext } from 'react';
import TeamTaskContext from './TeamTaskContext';

const TeamTaskCard = ({ task }) => {
  const { getTeamTasks,updateTeamTask, deleteTeamTask } = useContext(TeamTaskContext);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedDueDate, setEditedDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );

  const [members, setMembers] = useState(task.assignedTo || []);
  const [newEmails, setNewEmails] = useState('');

  const handleDelete = async () => {
    await deleteTeamTask(task._id);
    alert('Task deleted!');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    await updateTeamTask(task._id, {
      title: editedTitle,
      description: editedDescription,
      dueDate: editedDueDate,
    });
    setShowEditPopup(false);
    alert("Task updated!");
    getTeamTasks();
  };

  const handleMemberUpdate = async (e) => {
    e.preventDefault();

    const newEmailList = newEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (newEmailList.length === 0) return alert("No valid emails entered");

    await updateTeamTask(task._id, {
      addUsers: newEmailList
    });

    const updatedList = [...new Set([...members.map(m => m.email), ...newEmailList])];
    setMembers(updatedList.map(email => ({ email })));
    setNewEmails('');
    setShowModal(false);
    alert("Team members updated!");
    getTeamTasks();
  };

  const removeMember = async (email) => {
    await updateTeamTask(task._id, {
      removeUsers: [email]
    });

    const updated = members.filter(member => member.email !== email);
    setMembers(updated);
  };

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5>{task.title}</h5>
          <p>{task.description}</p>
          <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
          <p><strong>Owner:</strong> {task.createdBy ? task.createdBy.name : 'N/A'}</p>
          <p><strong>Assigned To:</strong> {task.assignedTo?.map(user => user.name).join(', ') || 'N/A'}</p>

          <button className="btn btn-sm btn-outline-primary" onClick={() => setShowModal(true)}>
            Edit Team Members
          </button>

          <div className="card__menu" onClick={() => setShowOptions(!showOptions)}>
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
              <button className="btn btn-dark" onClick={() => setShowEditPopup(true)}>Update</button>
              <button className="btn btn-dark" onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal for editing team members */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content form">
            <h4 className="title">Edit Team Members</h4>
            
            <label>Current Members:</label>
            <ul>
              {members.map((member, index) => (
                <li key={index} className='m-1'>
                  {member.email}
                  <button
                    type="button"
                    className="btn btn-sm btn-danger ms-2"
                    onClick={() => removeMember(member.email)}
                    style={{ marginLeft: '10px' }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>

            <form onSubmit={handleMemberUpdate}>
              <label>
                <span>Add Users (comma-separated emails):</span>
                <input
                  type="text"
                  className="input"
                  placeholder="add emails"
                  value={newEmails}
                  onChange={(e) => setNewEmails(e.target.value)}
                />
              </label>

              <div className="flex mt-2">
                <button type="submit" className="submit">Update</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup for editing task details */}
      {showEditPopup && (
        <div className="popup-overlay">
          <div className="popup-form form">
            <h3 className="title">Edit Task</h3>
            <form onSubmit={handleUpdateSubmit}>
              <label>
                <input
                  type="text"
                  className="input"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </label>

              <label>
                <textarea
                  className="input"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />
              </label>

              <label>
                <input
                  type="date"
                  className="input"
                  value={editedDueDate}
                  onChange={(e) => setEditedDueDate(e.target.value)}
                />
              </label>

              <div className="flex m-2">
                <button type="submit" className="submit">Save</button>
                <button type="button" onClick={() => setShowEditPopup(false)} className="btn btn-light">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamTaskCard;
