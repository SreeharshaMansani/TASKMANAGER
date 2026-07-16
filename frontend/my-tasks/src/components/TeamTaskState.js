import React, { useState } from 'react';
import TeamTaskContext from './TeamTaskContext'; 


const TeamTaskState = (props) => {
  const host = process.env.REACT_APP_API_URL || "http://localhost:5000"; 
  const [teamTasks, setTeamTasks] = useState([]);

  //get  team tasks
  const getTeamTasks = async () => {
    const response = await fetch(`${host}/api/teamtasks/fetchtasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
    const json = await response.json();
    setTeamTasks(json);
  };

  // Create a new team task
  const addTeamTask = async (task) => {
    try {
      const response = await fetch(`${host}/api/teamtasks/createtask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(task)
      });
  
      const result = await response.json();
  
      if (!result.success) {
        alert("Task creation failed: " + (result.error || "Unknown error"));
        console.error("Task creation error:", result.error || "No error message provided");
        return;
      }
      
      setTeamTasks([...teamTasks, result.task]);
      alert("Task created successfully!");
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Something went wrong. Please try again.");
    }
  };
  

  // Delete a team task
  const deleteTeamTask = async (id) => {
    await fetch(`${host}/api/teamtasks/deletetask/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
    const newTasks = teamTasks.filter((task) => task._id !== id);
    setTeamTasks(newTasks);
  };

  // Update a team task
  const updateTeamTask = async (id, updatedTask) => {
    try {
      const response = await fetch(`${host}/api/teamtasks/updatetask/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(updatedTask)
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update task');
      }
  
      // Replace the updated task in the list
      const updated = teamTasks.map(task =>
        task._id === id ? data.updatedTask : task
      );
  
      setTeamTasks(updated);
    } catch (error) {
      console.error("Update failed:", error.message);
      alert(error.message);
    }
  };
  

  return (
    <TeamTaskContext.Provider value={{ teamTasks, getTeamTasks, addTeamTask, deleteTeamTask, updateTeamTask }}>
      {props.children}
    </TeamTaskContext.Provider>
  );
};

export default TeamTaskState;
