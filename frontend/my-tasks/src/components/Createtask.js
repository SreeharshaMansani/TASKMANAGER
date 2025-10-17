import React, { useState, useContext} from 'react';
import PersonalTaskContext from './PersonalTaskContext';
import './css/Create.css';


const CreateTask = ({ onClose }) => {
    const { addTask } = useContext(PersonalTaskContext);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        dueDate: '',
    });

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        addTask(
            formData.title,
            formData.description,
            formData.startDate,
            formData.dueDate
        );
        onClose();
    };


    return (
        <form className="form" onSubmit={handleSubmit}>
            <p className="title">New Task</p>

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
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    name="startDate"
                    className="input-date"
                />
            </div>

            <div className="date-picker">
                <label className="date-label">Finish By</label>
                <input
                    type="date"
                    value={formData.dueDate}
                    onChange={handleChange}
                    name="dueDate"
                    className="input-date"
                />
            </div>

            <button type="submit" className="submit">
                Submit
            </button>
        </form>
    );
};

export default CreateTask;
