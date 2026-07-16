import React, { useState, useContext } from 'react';
import './css/Personalcard.css';
import PersonalTaskContext from './PersonalTaskContext';
import { FiChevronDown, FiChevronUp, FiPlus, FiTrash2 } from 'react-icons/fi';

const PersonalTaskCard = ({ task }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showSections, setShowSections] = useState(false);

  // Edit fields
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : '');
  const [editedPriority, setEditedPriority] = useState(task.priority || 'Medium');
  const [editedCategory, setEditedCategory] = useState(task.category || 'Personal');
  const [editedStatus, setEditedStatus] = useState(task.status || 'Pending');
  const [editedSections, setEditedSections] = useState(task.sections || []);
  const [editedSteps, setEditedSteps] = useState(task.steps || []);

  const { updateTask, deleteTask, getTasks } = useContext(PersonalTaskContext);

  const start = task.startDate ? new Date(task.startDate).getTime() : null;
  const due = task.dueDate ? new Date(task.dueDate).getTime() : null;

  // Progress Calculation
  let progress = 0;
  if (task.status === 'Completed') {
    progress = 100;
  } else if (task.steps && task.steps.length > 0) {
    const completed = task.steps.filter(s => s.completed).length;
    progress = (completed / task.steps.length) * 100;
  } else if (start && due && due > start) {
    const totalDuration = due - start;
    const elapsed = Date.now() - start;
    progress = (elapsed / totalDuration) * 100;
    progress = Math.min(Math.max(progress, 0), 100);
  } else {
    progress = task.status === 'In Progress' ? 50 : 0;
  }

  const formattedDueDate = due ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date';

  // Calculate Time Left
  const calculateTimeLeft = () => {
    if (!task.dueDate) return '';
    const dueTime = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(dueTime);
    checkDate.setHours(23, 59, 59, 999);
    const diff = checkDate.getTime() - new Date().getTime();
    if (diff < 0) {
      const days = Math.floor(Math.abs(diff) / (1000 * 60 * 60 * 24));
      return days === 0 ? '🔴 Overdue today' : `🔴 Overdue by ${days} day${days > 1 ? 's' : ''}`;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '🟡 Due today';
    if (days === 1) return '🟡 1 day left';
    return `🟢 ${days} days left`;
  };

  const timeLeftText = calculateTimeLeft();

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

  // Step toggle handler
  const handleStepToggle = async (stepIndex) => {
    const updatedSteps = task.steps.map((step, index) => {
      if (index === stepIndex) {
        return { ...step, completed: !step.completed };
      }
      return step;
    });

    const allCompleted = updatedSteps.length > 0 && updatedSteps.every(s => s.completed);
    const newStatus = allCompleted ? 'Completed' : (task.status === 'Completed' ? 'In Progress' : task.status);

    await updateTask(task._id, {
      steps: updatedSteps,
      status: newStatus
    });
    getTasks();
  };

  // Edit Sections handlers
  const handleAddSection = () => {
    setEditedSections([...editedSections, { title: '', description: '' }]);
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...editedSections];
    updated[index][field] = value;
    setEditedSections(updated);
  };

  const handleRemoveSection = (index) => {
    setEditedSections(editedSections.filter((_, i) => i !== index));
  };

  // Edit Steps handlers
  const handleAddStep = () => {
    setEditedSteps([...editedSteps, { text: '', completed: false }]);
  };

  const handleStepChange = (index, value) => {
    const updated = [...editedSteps];
    updated[index].text = value;
    setEditedSteps(updated);
  };

  const handleRemoveStep = (index) => {
    setEditedSteps(editedSteps.filter((_, i) => i !== index));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    await updateTask(task._id, {
      title: editedTitle,
      description: editedDescription,
      dueDate: editedDueDate,
      priority: editedPriority,
      category: editedCategory,
      status: editedStatus,
      sections: editedSections.filter(s => s.title.trim()),
      steps: editedSteps.filter(s => s.text.trim())
    });
    setShowEditPopup(false);
    getTasks();
  };

  const handledelete = async (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(task._id);
      setShowEditPopup(false);
      getTasks();
    }
  };

  return (
    <>
      <div className="card" onClick={() => setShowOptions(false)}>
        {/* Badges */}
        <div className="badge-group">
          <span className={`badge priority-${(task.priority || 'Medium').toLowerCase()}`}>
            {task.priority === 'High' ? '🔴 High' : task.priority === 'Low' ? '🟢 Low' : '🟡 Medium'}
          </span>
          <span className={`badge category-${(task.category || 'Personal').toLowerCase()}`}>
            {task.category === 'Work' ? '💼 Work' : task.category === 'Study' ? '📚 Study' : '🏡 Personal'}
          </span>
          <span className={`badge status-${(task.status || 'Pending').toLowerCase().replace(' ', '')}`}>
            {task.status || 'Pending'}
          </span>
        </div>

        <div className="card__title" style={{ marginTop: '0.25rem' }}>{task.title}</div>
        <div className="card__subtitle">{task.description}</div>

        {/* Progress Bar */}
        <div className="card__progress">
          <progress
            max="100"
            value={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
          ></progress>
          <div className="card__progress-text">{Math.round(progress)}%</div>
        </div>

        {/* Checklist Steps (if any) */}
        {task.steps && task.steps.length > 0 && (
          <div className="card-steps">
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Checklist:</span>
            {task.steps.map((step, idx) => (
              <div key={idx} className="step-item">
                <input
                  type="checkbox"
                  className="step-checkbox"
                  checked={step.completed}
                  onChange={() => handleStepToggle(idx)}
                />
                <span style={{ textDecoration: step.completed ? 'line-through' : 'none', opacity: step.completed ? 0.6 : 1 }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Time Left & Due Date */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          <span className="card__indicator">Due: {formattedDueDate}</span>
          {timeLeftText && <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{timeLeftText}</span>}
        </div>

        {/* Sections Toggle */}
        {task.sections && task.sections.length > 0 && (
          <div>
            <button className="card-sections-toggle" onClick={withStopPropagation(() => setShowSections(!showSections))}>
              {showSections ? <FiChevronUp /> : <FiChevronDown />} Sections ({task.sections.length})
            </button>
            {showSections && (
              <div className="card-sections-list">
                {task.sections.map((section, idx) => (
                  <div key={idx} className="card-section-item">
                    <div className="card-section-title">{section.title}</div>
                    {section.description && <div className="card-section-desc">{section.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Float Menu */}
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
              <label>
                <span>Title</span>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Title"
                  required
                />
              </label>

              <label style={{ display: 'block', marginTop: '10px' }}>
                <span>Description</span>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Description"
                  required
                  rows="3"
                />
              </label>

              <div className="flex" style={{ display: 'flex', gap: '1rem', marginTop: '10px' }}>
                <label style={{ flex: 1 }}>
                  <span>Finish By Date</span>
                  <input
                    type="date"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="flex" style={{ display: 'flex', gap: '1rem', marginTop: '10px' }}>
                <label style={{ flex: 1 }}>
                  <span>Priority</span>
                  <select
                    className="input"
                    value={editedPriority}
                    onChange={(e) => setEditedPriority(e.target.value)}
                    style={{ height: '42px', padding: '10px 14px', width: '100%', marginTop: '5px' }}
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </label>

                <label style={{ flex: 1 }}>
                  <span>Category</span>
                  <select
                    className="input"
                    value={editedCategory}
                    onChange={(e) => setEditedCategory(e.target.value)}
                    style={{ height: '42px', padding: '10px 14px', width: '100%', marginTop: '5px' }}
                  >
                    <option value="Personal">🏡 Personal</option>
                    <option value="Work">💼 Work</option>
                    <option value="Study">📚 Study</option>
                  </select>
                </label>

                <label style={{ flex: 1 }}>
                  <span>Status</span>
                  <select
                    className="input"
                    value={editedStatus}
                    onChange={(e) => setEditedStatus(e.target.value)}
                    style={{ height: '42px', padding: '10px 14px', width: '100%', marginTop: '5px' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
              </div>

              {/* Edit Checklist Steps */}
              <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Checklist Steps</span>
                  <button type="button" onClick={handleAddStep} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                    <FiPlus /> Add Step
                  </button>
                </div>
                {editedSteps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={(e) => {
                        const updated = [...editedSteps];
                        updated[idx].completed = e.target.checked;
                        setEditedSteps(updated);
                      }}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', marginTop: '0' }}
                    />
                    <input
                      type="text"
                      placeholder="Step text..."
                      value={step.text}
                      onChange={(e) => handleStepChange(idx, e.target.value)}
                      required
                      style={{ flex: 1, padding: '6px 10px', marginTop: '0' }}
                    />
                    <button type="button" onClick={() => handleRemoveStep(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Edit Custom Sections */}
              <div style={{ marginTop: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Custom Sections</span>
                  <button type="button" onClick={handleAddSection} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                    <FiPlus /> Add Section
                  </button>
                </div>
                {editedSections.map((sec, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', marginBottom: '8px', position: 'relative', backgroundColor: 'var(--bg-primary)' }}>
                    <button type="button" onClick={() => handleRemoveSection(idx)} style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                      <FiTrash2 size={15} />
                    </button>
                    <input
                      type="text"
                      placeholder="Section Title"
                      value={sec.title}
                      onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                      required
                      style={{ width: '85%', padding: '6px 10px', marginTop: '0', marginBottom: '6px' }}
                    />
                    <textarea
                      placeholder="Section Description"
                      value={sec.description}
                      onChange={(e) => handleSectionChange(idx, 'description', e.target.value)}
                      style={{ padding: '6px 10px', marginTop: '0', width: '100%' }}
                      rows="2"
                    />
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <button type="submit" className="btn btn-dark" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                <button type="button" onClick={() => setShowEditPopup(false)} className="btn btn-light" style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalTaskCard;
