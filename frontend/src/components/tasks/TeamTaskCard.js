import React, { useState, useContext } from 'react';
import TeamTaskContext from '../../context/TeamTaskContext';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash, FiCalendar, FiClock, FiUsers } from 'react-icons/fi';
import '../../styles/Personalcard.css';
import '../../styles/Create.css'; // Reuse personal card style for visual parity
import useTaskDialog from '../../hooks/useTaskDialog';
import { notify } from '../../utils/notifications';

const TeamTaskCard = ({ task }) => {
  const { getTeamTasks, updateTeamTask, deleteTeamTask } = useContext(TeamTaskContext);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const membersDialogRef = useTaskDialog(showModal, () => setShowModal(false));
  const editDialogRef = useTaskDialog(showEditPopup, () => setShowEditPopup(false));

  // Edit fields state
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedDueDate, setEditedDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [editedPriority, setEditedPriority] = useState(task.priority || 'Medium');
  const [editedCategory, setEditedCategory] = useState(task.category || 'Personal');
  const [editedStatus, setEditedStatus] = useState(task.status || 'Pending');
  const [editedSections, setEditedSections] = useState(task.sections || []);
  const [editedSteps, setEditedSteps] = useState(task.steps || []);

  const [members, setMembers] = useState(task.assignedTo || []);
  const [newEmails, setNewEmails] = useState('');

  const formattedDueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date';

  // Calculate remaining time
  const getRemainingTimeText = (dueDate, status) => {
    if (status === 'Completed') return { text: 'Completed', type: 'completed' };
    if (!dueDate) return { text: 'No due date', type: 'none' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Due Today', type: 'today' };
    if (diffDays === 1) return { text: '1 day left', type: 'warning' };
    if (diffDays > 1) return { text: `${diffDays} days left`, type: 'future' };
    if (diffDays === -1) return { text: 'Overdue by 1 day', type: 'critical' };
    return { text: `Overdue by ${Math.abs(diffDays)} days`, type: 'critical' };
  };

  const remainingInfo = getRemainingTimeText(task.dueDate, task.status);

  // Checklist progress computation
  const totalSteps = task.steps ? task.steps.length : 0;
  const completedSteps = task.steps ? task.steps.filter(s => s.completed).length : 0;

  let progressPercent = 0;
  if (totalSteps > 0) {
    progressPercent = Math.round((completedSteps / totalSteps) * 100);
  } else {
    if (task.status === 'Completed') progressPercent = 100;
    else if (task.status === 'In Progress') progressPercent = 50;
    else progressPercent = 0;
  }

  const handleDelete = async (e) => {
    e.stopPropagation();
    await deleteTeamTask(task._id);
    notify.success('Task deleted');
  };

  const handleStepToggle = async (stepIndex) => {
    const updatedSteps = task.steps.map((step, idx) => {
      if (idx === stepIndex) {
        return { ...step, completed: !step.completed };
      }
      return step;
    });

    let updatedStatus = task.status;
    const allCompleted = updatedSteps.every(s => s.completed);
    const hasAnyCompleted = updatedSteps.some(s => s.completed);

    if (allCompleted) {
      updatedStatus = 'Completed';
    } else if (hasAnyCompleted) {
      updatedStatus = 'In Progress';
    } else {
      updatedStatus = 'Pending';
    }

    await updateTeamTask(task._id, { steps: updatedSteps, status: updatedStatus });
    getTeamTasks();
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const updated = await updateTeamTask(task._id, {
      title: editedTitle,
      description: editedDescription,
      dueDate: editedDueDate,
      priority: editedPriority,
      category: editedCategory,
      status: editedStatus,
      sections: editedSections,
      steps: editedSteps
    });
    if (updated === false) return;
    setShowEditPopup(false);
    notify.success('Task updated');
    getTeamTasks();
  };

  const handleMemberUpdate = async (e) => {
    e.preventDefault();

    const newEmailList = newEmails
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (newEmailList.length === 0) return notify.error('Enter at least one email address.');

    const updated = await updateTeamTask(task._id, {
      addUsers: newEmailList
    });
    if (updated === false) return;

    const updatedList = [...new Set([...members.map(m => m.email), ...newEmailList])];
    setMembers(updatedList.map(email => ({ email })));
    setNewEmails('');
    setShowModal(false);
    notify.success('Team members updated');
    getTeamTasks();
  };

  const removeMember = async (email) => {
    await updateTeamTask(task._id, {
      removeUsers: [email]
    });

    const updated = members.filter(member => member.email !== email);
    setMembers(updated);
    getTeamTasks();
  };

  const handleEditAddSection = () => {
    setEditedSections([...editedSections, { title: '', description: '' }]);
  };

  const handleEditRemoveSection = (idx) => {
    setEditedSections(editedSections.filter((_, i) => i !== idx));
  };

  const handleEditSectionChange = (idx, field, val) => {
    setEditedSections(editedSections.map((sec, i) => i === idx ? { ...sec, [field]: val } : sec));
  };

  const handleEditAddStep = () => {
    setEditedSteps([...editedSteps, { text: '', completed: false }]);
  };

  const handleEditRemoveStep = (idx) => {
    setEditedSteps(editedSteps.filter((_, i) => i !== idx));
  };

  const handleEditStepChange = (idx, val) => {
    setEditedSteps(editedSteps.map((st, i) => i === idx ? { ...st, text: val } : st));
  };

  const withStopPropagation = (fn) => (e) => {
    e.stopPropagation();
    fn(e);
  };

  return (
    <>
      <div className="task-card" onClick={() => setShowDetails(!showDetails)}>
        {/* Badges Row */}
        <div className="card__badges">
          <span className={`badge priority-${(task.priority || 'Medium').toLowerCase()}`}>
            {task.priority || 'Medium'}
          </span>
          <span className="badge category-badge">
            {task.category || 'Personal'}
          </span>
          <span className={`badge status-${(task.status || 'Pending').toLowerCase().replace(' ', '-')}`}>
            {task.status || 'Pending'}
          </span>
        </div>

        <div className="card__title">{task.title}</div>
        <div className="card__subtitle">{task.description}</div>

        {/* Team specific info */}
        <div className="card__team-info" onClick={(e) => e.stopPropagation()}>
          <div className="info-row">
            <strong>Owner:</strong> {task.createdBy ? task.createdBy.name : 'N/A'}
          </div>
          <div className="info-row">
            <strong>Assigned To:</strong> {task.assignedTo?.map(user => user.name).join(', ') || 'N/A'}
          </div>
          <button
            className="btn-edit-members"
            onClick={withStopPropagation(() => setShowModal(true))}
            style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <FiUsers /> Edit Members
          </button>
        </div>

        {/* Dynamic Checklist Steps */}
        {totalSteps > 0 && (
          <div className="card__checklist" onClick={(e) => e.stopPropagation()}>
            <span className="checklist-heading">Checklist ({completedSteps}/{totalSteps})</span>
            <div className="checklist-items">
              {task.steps.map((step, idx) => (
                <label key={idx} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={step.completed}
                    onChange={() => handleStepToggle(idx)}
                  />
                  <span className={step.completed ? 'completed-text' : ''}>{step.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="card__progress">
          <div className="card__progress-bar-container">
            <div className="card__progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div className="card__progress-text">{progressPercent}%</div>
        </div>

        {/* Date and Time Remaining Info */}
        <div className="card__footer">
          <div className="footer-item">
            <FiCalendar /> {formattedDueDate}
          </div>
          <div className={`footer-item remaining-time ${remainingInfo.type}`}>
            <FiClock /> {remainingInfo.text}
          </div>
        </div>

        <button type="button" className="card__menu" aria-label={`Actions for ${task.title}`} aria-expanded={showOptions} onClick={withStopPropagation((e) => setShowOptions(!showOptions))}>
          <svg xmlns="http://www.w3.org/2000/svg" width="4" viewBox="0 0 4 20" height="20" fill="none">
            <g fill="#000">
              <path d="m2 4c1.10457 0 2-.89543 2-2s-.89543-2-2-2-2 .89543-2 2 .89543 2 2 2z"></path>
              <path d="m2 12c1.10457 0 2-.8954 2-2 0-1.10457-.89543-2-2-2s-2 .89543-2 2c0 1.1046.89543 2 2 2z"></path>
              <path d="m2 20c1.10457 0 2-.8954 2-2s-.89543-2-2-2-2 .8954-2 2 .89543 2 2 2z"></path>
            </g>
          </svg>
        </button>

        {showOptions && (
          <div className="card__menu-options">
            <button className="btn btn-dark" onClick={withStopPropagation(() => setShowEditPopup(true))}>Update</button>
            <button className="btn btn-dark" onClick={handleDelete}>Delete</button>
          </div>
        )}

        {/* Accordion Expand/Collapse Indicator */}
        {((task.sections && task.sections.length > 0) || totalSteps > 0) && (
          <button type="button" className="accordion-toggle" aria-expanded={showDetails} onClick={withStopPropagation(() => setShowDetails(!showDetails))}>
            {showDetails ? (
              <span>Hide Details <FiChevronUp /></span>
            ) : (
              <span>Show Details <FiChevronDown /></span>
            )}
          </button>
        )}

        {/* Expandable Accordion Panel */}
        {showDetails && (task.sections && task.sections.length > 0) && (
          <div className="card__accordion-content" onClick={(e) => e.stopPropagation()}>
            {task.sections.map((section, idx) => (
              <div key={idx} className="card__section-item">
                <h4 className="section-title">{section.title}</h4>
                <p className="section-desc">{section.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for editing team members */}
      {showModal && (
        <div className="task-edit-backdrop" onClick={() => setShowModal(false)}>
          <div className="task-edit-dialog task-form" ref={membersDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Edit team members" onClick={(e) => e.stopPropagation()}>
            <h4 className="title">Edit Team Members</h4>

            <span>Current Members:</span>
            <div className="members-edit-list">
              {members.map((member, index) => (
                <div key={index} className="member-edit-chip">
                  <span>{member.email}</span>
                  <button
                    type="button"
                    className="btn-remove-member" aria-label={`Remove ${member.email}`}
                    onClick={() => removeMember(member.email)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleMemberUpdate} style={{ marginTop: '1rem' }}>
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

              <div className="task-form-actions">
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
        <div className="task-edit-backdrop" onClick={() => setShowEditPopup(false)}>
          <div className="task-edit-dialog" ref={editDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Edit task" onClick={(e) => e.stopPropagation()}>
            <h3 className="title">Edit Task</h3>
            <form className="task-form" onSubmit={handleUpdateSubmit}>
              <label>
              <span>Title</span>
              <input
                type="text"
                className="input"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                required
              />
              </label>

              <label>
              <span>Description</span>
              <textarea
                className="input"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                required
              />
              </label>

              <div className="edit-form-row">
                <div className="edit-form-col">
                  <label htmlFor={`team-edit-${task._id}-due`}>Finish By Date</label>
                  <input
                    id={`team-edit-${task._id}-due`}
                    type="date"
                    className="input"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                  />
                </div>
                <div className="edit-form-col">
                  <label htmlFor={`team-edit-${task._id}-priority`}>Priority</label>
                  <select id={`team-edit-${task._id}-priority`} value={editedPriority} onChange={(e) => setEditedPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="edit-form-row">
                <div className="edit-form-col">
                  <label htmlFor={`team-edit-${task._id}-category`}>Category</label>
                  <select id={`team-edit-${task._id}-category`} value={editedCategory} onChange={(e) => setEditedCategory(e.target.value)}>
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                  </select>
                </div>
                <div className="edit-form-col">
                  <label htmlFor={`team-edit-${task._id}-status`}>Status</label>
                  <select id={`team-edit-${task._id}-status`} value={editedStatus} onChange={(e) => setEditedStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Edit Custom Sections */}
              <div className="edit-sub-section">
                <div className="sub-section-header">
                  <span>Sections</span>
                  <button type="button" className="btn-add-sub" onClick={handleEditAddSection}>
                    <FiPlus /> Add
                  </button>
                </div>
                {editedSections.map((sec, idx) => (
                  <div key={idx} className="sub-item-card">
                    <div className="sub-item-inputs">
                      <label>
                        <span>Section {idx + 1} title</span>
                      <input className="input"
                        required
                        type="text"
                        placeholder="Section Title"
                        value={sec.title}
                        onChange={(e) => handleEditSectionChange(idx, 'title', e.target.value)}
                      />
                      </label>
                      <label>
                        <span>Section {idx + 1} description (optional)</span>
                      <textarea
                        placeholder="Section Description"
                        rows="2"
                        value={sec.description}
                        onChange={(e) => handleEditSectionChange(idx, 'description', e.target.value)}
                      />
                      </label>
                    </div>
                    <button type="button" className="btn-remove-sub" aria-label={`Remove section ${idx + 1}`} onClick={() => handleEditRemoveSection(idx)}>
                      <FiTrash />
                    </button>
                  </div>
                ))}
              </div>

              {/* Edit Checklist Steps */}
              <div className="edit-sub-section">
                <div className="sub-section-header">
                  <span>Checklist Steps</span>
                  <button type="button" className="btn-add-sub" onClick={handleEditAddStep}>
                    <FiPlus /> Add
                  </button>
                </div>
                {editedSteps.map((st, idx) => (
                  <div key={idx} className="sub-item-card">
                    <label className="sub-item-inputs">
                      <span>Step {idx + 1} description</span>
                      <input className="input"
                        required
                        type="text"
                        placeholder={`Step #${idx + 1}`}
                        value={st.text}
                        onChange={(e) => handleEditStepChange(idx, e.target.value)}
                      />
                    </label>
                    <button type="button" className="btn-remove-sub" aria-label={`Remove step ${idx + 1}`} onClick={() => handleEditRemoveStep(idx)}>
                      <FiTrash />
                    </button>
                  </div>
                ))}
              </div>

              <div className="task-form-actions">
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

export default React.memo(TeamTaskCard);
