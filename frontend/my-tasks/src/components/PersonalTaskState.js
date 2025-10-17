import React, { useState, useEffect } from 'react';
import PersonalTaskContext from './PersonalTaskContext'; 

const PersonalTaskState = (props) => {
  const host = "http://localhost:5000";
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(''); 

  // Fetch tasks
  const getTasks = async () => {
    const url = `http://localhost:5000/api/personaltasks/fetchtasks`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token'),
        },
      });
  
      const json = await response.json();
      console.log(json);
      return json; // Return fetched tasks to be handled outside
    } catch (error) {
      console.error('Failed to fetch tasks:', error.message);
      return []; // Return empty array in case of error
    }
  };
  
  
  // Add a new task
  const addTask = async (title, description, startDate, dueDate) => {
    const url = `http://localhost:5000/api/personaltasks/createtask`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ title, description, startDate, dueDate }),
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const newTask = await response.json();
      setTasks([...tasks, newTask]); // Add the new task to the state
    } catch (error) {
      console.error('Failed to add task:', error.message);
    }
  };

  // Update a task
  const updateTask = async (id, title, description, dueDate) => {
    const url = `http://localhost:5000/api/personaltasks/updatetask/${id}`;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ title, description, dueDate }),
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    } catch (error) {
      console.error('Failed to update task:', error.message);
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
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

      setTasks(tasks.filter((task) => task._id !== id)); // Remove the deleted task from the state
    } catch (error) {
      console.error('Failed to delete task:', error.message);
    }
  };

  // Get user details
  const getuser = async () => {
    const url = `${host}/api/auth/getuser`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData.name);
    } catch (error) {
      console.error('Failed to fetch user:', error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getTasks();
      getuser();
    }
  }, []); 

  return (
    <PersonalTaskContext.Provider value={{ tasks, setTasks, addTask, updateTask, deleteTask, getTasks, getuser, user }}>
      {props.children}
    </PersonalTaskContext.Provider>
  );
};

export default PersonalTaskState;
