import React, { useState, useContext } from 'react';
import TeamTaskContext from '../../context/TeamTaskContext';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import '../../styles/Create.css';

const CreateTeamTask = ({ onClose }) => {
    const { addTeamTask } = useContext(TeamTaskContext);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        dueDate: '',
        priority: 'Medium',
        category: 'Work',
        status: 'Pending',
    });

    const [emailInput, setEmailInput] = useState('');
    const [emailList, setEmailList] = useState([]);
    const [sections, setSections] = useState([]);
    const [steps, setSteps] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEmailKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && emailInput.trim()) {
            e.preventDefault();
            const email = emailInput.trim();
            if (email && !emailList.includes(email)) {
                setEmailList([...emailList, email]);
                setEmailInput('');
            }
        }
    };

    const removeEmail = (emailToRemove) => {
        setEmailList(emailList.filter((email) => email !== emailToRemove));
    };

    // Sections logic
    const handleAddSection = () => {
        setSections([...sections, { title: '', description: '' }]);
    };

    const handleSectionChange = (index, field, value) => {
        const updated = [...sections];
        updated[index][field] = value;
        setSections(updated);
    };

    const handleRemoveSection = (index) => {
        setSections(sections.filter((_, i) => i !== index));
    };

    // Steps logic
    const handleAddStep = () => {
        setSteps([...steps, { text: '', completed: false }]);
    };

    const handleStepChange = (index, value) => {
        const updated = [...steps];
        updated[index].text = value;
        setSteps(updated);
    };

    const handleRemoveStep = (index) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const taskData = {
            ...formData,
            startDate: formData.startDate || new Date().toISOString().split('T')[0],
            assignedTo: emailList,
            sections: sections.filter(s => s.title.trim()),
            steps: steps.filter(s => s.text.trim())
        };

        addTeamTask(taskData);
        onClose();
    };

    return (
        <form className="task-form" onSubmit={handleSubmit}>
            <p className="title">New Team Task</p>

            <label>
                <span>Title</span>
                <input
                    required
                    type="text"
                    name="title"
                    className="input"
                    value={formData.title}
                    onChange={handleChange}
                />
            </label>

            <label>
                <span>Description</span>
                <textarea
                    required
                    rows="3"
                    name="description"
                    className="input"
                    value={formData.description}
                    onChange={handleChange}
                ></textarea>
            </label>

            <div className="task-form-row">
                <div className="date-picker" style={{ flex: 1 }}>
                    <label className="date-label" htmlFor="team-create-start">Start Date</label>
                    <input
                        type="date"
                        id="team-create-start" name="startDate"
                        className="input-date"
                        value={formData.startDate}
                        onChange={handleChange}
                    />
                </div>

                <div className="date-picker" style={{ flex: 1 }}>
                    <label className="date-label" htmlFor="team-create-due">Finish By</label>
                    <input
                        required
                        type="date"
                        id="team-create-due" name="dueDate"
                        className="input-date"
                        value={formData.dueDate}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="task-form-row">
                <label style={{ flex: 1 }}>
                    <span>Priority</span>
                    <select
                        name="priority"
                        className="input"
                        value={formData.priority}
                        onChange={handleChange}

                    >
                        <option value="High">🔴 High</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Low">🟢 Low</option>
                    </select>
                </label>

                <label style={{ flex: 1 }}>
                    <span>Category</span>
                    <select
                        name="category"
                        className="input"
                        value={formData.category}
                        onChange={handleChange}

                    >
                        <option value="Personal">🏡 Personal</option>
                        <option value="Work">💼 Work</option>
                        <option value="Study">📚 Study</option>
                    </select>
                </label>

                <label style={{ flex: 1 }}>
                    <span>Status</span>
                    <select
                        name="status"
                        className="input"
                        value={formData.status}
                        onChange={handleChange}

                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                </label>
            </div>

            <div className="email-container" style={{ marginTop: '0.5rem' }}>
                <label htmlFor="team-create-members">Team Members (Assigned To)</label>
                <div className="email-input-wrapper">
                    {emailList.map((email, index) => (
                        <span key={index} className="email-chip">
                            <span>{email}</span>
                            <button type="button" aria-label={`Remove ${email}`} onClick={() => removeEmail(email)}>×</button>
                        </span>
                    ))}
                    <input
                        type="text"
                        placeholder="Enter email and press Enter"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={handleEmailKeyDown}
                        className="email-input" id="team-create-members"
                    />
                </div>
            </div>

            {/* Checklist Steps Section */}
            <div className="form-sub-section">
                <div className="sub-section-header">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Checklist Steps</span>
                    <button type="button" onClick={handleAddStep} className="btn-add-sub">
                        <FiPlus /> Add Step
                    </button>
                </div>
                {steps.map((step, index) => (
                    <div key={index} className="task-step-editor">
                        <label className="sub-item-inputs">
                            <span>Step {index + 1} description</span>
                        <input
                            required
                            type="text"
                            placeholder="Step description..."
                            className="input"
                            value={step.text}
                            onChange={(e) => handleStepChange(index, e.target.value)}
                            style={{ flex: 1 }}
                        />
                        </label>
                        <button type="button" onClick={() => handleRemoveStep(index)} className="btn-remove-sub" aria-label={`Remove step ${index + 1}`}>
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Sections Sub-form */}
            <div className="form-sub-section">
                <div className="sub-section-header">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Custom Sections</span>
                    <button type="button" onClick={handleAddSection} className="btn-add-sub">
                        <FiPlus /> Add Section
                    </button>
                </div>
                {sections.map((section, index) => (
                    <div key={index} className="sub-item-card">
                        <div className="sub-item-inputs">
                            <label>
                                <span>Section {index + 1} title</span>
                            <input
                                required
                                type="text"
                                placeholder="Section Title"
                                className="input"
                                value={section.title}
                                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                            />
                            </label>
                            <label>
                                <span>Section {index + 1} description (optional)</span>
                            <textarea
                                placeholder="Section Description (optional)"
                                className="input"
                                rows="2"
                                value={section.description}
                                onChange={(e) => handleSectionChange(index, 'description', e.target.value)}
                            />
                            </label>
                        </div>
                        <button type="button" onClick={() => handleRemoveSection(index)} className="btn-remove-sub" aria-label={`Remove section ${index + 1}`}>
                            <FiTrash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <button type="submit" className="submit">Create Team Task</button>
        </form>
    );
};

export default CreateTeamTask;
