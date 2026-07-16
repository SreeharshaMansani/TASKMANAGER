import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TeamTasks from './components/TeamTasks';
import PersonalTasks from './components/PersonalTasks';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import PersonalTaskState from './components/PersonalTaskState';
import Createtask from './components/Createtask';
import TeamTaskState from './components/TeamTaskState';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <PersonalTaskState>
      <TeamTaskState>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/personal" element={<PersonalTasks />} />
        <Route path="/team" element={<TeamTasks />} />
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/createtask" element={<Createtask/>}/>
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      </TeamTaskState>
      </PersonalTaskState>
    </Router>
  );
}

export default  App;