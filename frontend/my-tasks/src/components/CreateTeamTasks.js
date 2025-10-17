import React, { useState, useContext } from 'react';
import TeamTaskContext from './TeamTaskContext';
import './css/Create.css';

const CreateTeamTask = ({ onClose }) => {
    const { addTeamTask } = useContext(TeamTaskContext);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        dueDate: '',
        
    });

    const [emailInput, setEmailInput] = useState('');
    const [emailList, setEmailList] = useState([]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const taskData = {
            ...formData,
            assignedTo: emailList,
        };

        addTeamTask(taskData);
        onClose();
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <p className="title">New Team Task</p>

            <label>
                <input
                    required
                    type="text"
                    name="title"
                    className="input"
                    value={formData.title}
                    onChange={handleChange}
                />
                <span>Title</span>
            </label>

            <label>
                <textarea
                    required
                    rows="4"
                    cols="5"
                    name="description"
                    className="input"
                    value={formData.description}
                    onChange={handleChange}
                ></textarea>
                <span>Description</span>
            </label>

            <div className="date-picker">
                <label className="date-label">Start Date</label>
                <input
                    required
                    type="date"
                    name="startDate"
                    className="input-date"
                    value={formData.startDate}
                    onChange={handleChange}
                />
            </div>

            <div className="date-picker">
                <label className="date-label">Finish By</label>
                <input
                    required
                    type="date"
                    name="dueDate"
                    className="input-date"
                    value={formData.dueDate}
                    onChange={handleChange}
                />
            </div>

            <div className="email-container">
                <label>Team Members</label>
                <div className="email-input-wrapper">
                    {emailList.map((email, index) => (
                        <span key={index} className="email-chip">
                            {email}
                            <button type="button" onClick={() => removeEmail(email)}>×</button>
                        </span>
                    ))}
                    <input
                        type="text"
                        placeholder="Enter email and press Enter"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={handleEmailKeyDown}
                        className="email-input"
                    />
                </div>
            </div>

            <button type="submit" className="submit">Submit</button>
        </form>
    );
};

export default CreateTeamTask;
