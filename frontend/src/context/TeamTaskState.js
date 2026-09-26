import React, { useState, useCallback, useMemo } from 'react';
import TeamTaskContext from './TeamTaskContext';
import { notify } from '../utils/notifications';
import useAuthenticatedRead from '../hooks/useAuthenticatedRead';

const TeamTaskState = (props) => {
  const host = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [teamTasks, setTeamTasks] = useState([]);

  //get  team tasks
  const [getTeamTasks, invalidateTasks] = useAuthenticatedRead(useCallback(async (token, isCurrent) => {
    const response = await fetch(`${host}/api/teamtasks/fetchtasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token
      }
    });
    const json = await response.json();
    if (!isCurrent()) return;
    if (!response.ok || !Array.isArray(json)) throw new Error('Failed to refresh team tasks');
    setTeamTasks(json);
  }, [host]));

  // Create a new team task
  const addTeamTask = useCallback(async (task) => {
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
        notify.error('Task creation failed: ' + (result.error || 'Please try again.'));
        console.error("Task creation error:", result.error || "No error message provided");
        return;
      }

      invalidateTasks();
      setTeamTasks(current => [...current, result.task]);
      notify.success('Task created');
    } catch (err) {
      console.error("Fetch error:", err);
      notify.error('Something went wrong. Please try again.');
    }
  }, [host, invalidateTasks]);

  // Delete a team task
  const deleteTeamTask = useCallback(async (id) => {
    await fetch(`${host}/api/teamtasks/deletetask/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
    invalidateTasks();
    setTeamTasks(current => current.filter(task => task._id !== id));
  }, [host, invalidateTasks]);

  // Update a team task
  const updateTeamTask = useCallback(async (id, updatedTask) => {
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
      invalidateTasks();
      setTeamTasks(current => current.map(task => task._id === id ? data.updatedTask : task));
      return true;
    } catch (error) {
      console.error("Update failed:", error.message);
      notify.error(error.message);
      return false;
    }
  }, [host, invalidateTasks]);

  const value = useMemo(() => ({ teamTasks, getTeamTasks, addTeamTask, deleteTeamTask, updateTeamTask }),
    [teamTasks, getTeamTasks, addTeamTask, deleteTeamTask, updateTeamTask]);

  return (
    <TeamTaskContext.Provider value={value}>
      {props.children}
    </TeamTaskContext.Provider>
  );
};

export default TeamTaskState;
