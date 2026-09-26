import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import TeamTasks from './pages/TeamTasks';
import PersonalTasks from './pages/PersonalTasks';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import PersonalTaskState from './context/PersonalTaskState';
import Createtask from './components/tasks/CreatePersonalTask';
import TeamTaskState from './context/TeamTaskState';
import Dashboard from './pages/Dashboard';
import TaskAssistant from './integrations/TaskAssistant';
import Toast from './components/feedback/Toast';

function App() {
  return (
    <Router>
      <Toast />
      <PersonalTaskState>
      <TeamTaskState>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/personal" element={<PersonalTasks />} />
        <Route path="/team" element={<TeamTasks />} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/createtask" element={<main className="task-create-page"><Createtask/></main>}/>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <TaskAssistant />
      </TeamTaskState>
      </PersonalTaskState>
    </Router>
  );
}

export default  App;
