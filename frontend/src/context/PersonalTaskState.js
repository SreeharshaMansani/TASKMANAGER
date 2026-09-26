import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PersonalTaskContext from './PersonalTaskContext';
import { notify } from '../utils/notifications';
import useAuthenticatedRead from '../hooks/useAuthenticatedRead';

const PersonalTaskState = (props) => {
  const host = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState('');

  // Fetch tasks
  const [getTasks, invalidateTasks] = useAuthenticatedRead(useCallback(async (token, isCurrent) => {
    const url = `${host}/api/personaltasks/fetchtasks`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token,
        },
      });

      const json = await response.json();
      if (!isCurrent()) return [];
      if (!response.ok || !Array.isArray(json)) throw new Error('Failed to refresh personal tasks');
      setTasks(json);
      return json; // Return fetched tasks to be handled outside
    } catch (error) {
      console.error('Failed to fetch tasks:', error.message);
      return []; // Return empty array in case of error
    }
  }, [host]));

  // Add a new task
  const addTask = useCallback(async (title, description, startDate, dueDate, extra = {}) => {
    const url = `${host}/api/personaltasks/createtask`;
    const payload = { title, description, startDate, dueDate, ...extra };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || resJson.errors?.join(', ') || `Response status: ${response.status}`);
      }

      invalidateTasks();
      setTasks(current => [...current, resJson]); // Add the new task to the state
      return resJson;
    } catch (error) {
      console.error('Failed to add task:', error.message);
      notify.error('Failed to add task: ' + error.message);
      return null;
    }
  }, [host, invalidateTasks]);

  // Update a task
  const updateTask = useCallback(async (id, payload) => {
    const url = `${host}/api/personaltasks/updatetask/${id}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || resJson.errors?.join(', ') || `Response status: ${response.status}`);
      }

      invalidateTasks();
      setTasks(current => current.map(task => task._id === id ? resJson : task));
      return resJson;
    } catch (error) {
      console.error('Failed to update task:', error.message);
      notify.error('Failed to update task: ' + error.message);
      return null;
    }
  }, [host, invalidateTasks]);

  // Delete a task
  const deleteTask = useCallback(async (id) => {
    const url = `${host}/api/personaltasks/deletetask/${id}`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      invalidateTasks();
      setTasks(current => current.filter(task => task._id !== id)); // Remove the deleted task from the state
    } catch (error) {
      console.error('Failed to delete task:', error.message);
    }
  }, [host, invalidateTasks]);

  // Get user details
  const [getuser] = useAuthenticatedRead(useCallback(async (token, isCurrent) => {
    const url = `${host}/api/auth/getuser`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      if (isCurrent()) setUser(userData.name);
    } catch (error) {
      console.error('Failed to fetch user:', error.message);
    }
  }, [host]));

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getTasks();
      getuser();
    }
  }, [getTasks, getuser]);

  const value = useMemo(() => ({ tasks, addTask, updateTask, deleteTask, getTasks, getuser, user, setUser }),
    [tasks, addTask, updateTask, deleteTask, getTasks, getuser, user]);

  return (
    <PersonalTaskContext.Provider value={value}>
      {props.children}
    </PersonalTaskContext.Provider>
  );
};

export default PersonalTaskState;
