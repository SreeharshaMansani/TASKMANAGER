import React, { useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { TaskAssistantWidget } from '@task-assistant/widget';
import '@task-assistant/widget/styles.css';
import PersonalTaskContext from '../context/PersonalTaskContext';
import TeamTaskContext from '../context/TeamTaskContext';

// This file is copied into the host's src/integrations directory. The host owns
// session discovery and task refresh; all chat UI comes from the installed package.
const auth = {
  getToken: () => localStorage.getItem('token'),
  subscribe(listener) {
    const events = ['storage', 'focus', 'taskmanager:auth-changed'];
    events.forEach(event => window.addEventListener(event, listener));
    return () => events.forEach(event => window.removeEventListener(event, listener));
  },
};

export default function TaskAssistant({ apiUrl = process.env.REACT_APP_CHATBOT_URL || 'http://localhost:3001', onTasksChanged, availabilityCheck = true }) {
  const { getTasks } = useContext(PersonalTaskContext) || {};
  const { getTeamTasks } = useContext(TeamTaskContext) || {};
  useLocation(); // Also recheck the host session when its router navigates.
  const refreshTasks = useCallback(async executions => {
    const refreshes = [];
    if (executions.some(({ tool }) => tool.includes('_personal_')) && getTasks) {
      refreshes.push(Promise.resolve().then(() => getTasks()));
    }
    if (executions.some(({ tool }) => tool.includes('_team_')) && getTeamTasks) {
      refreshes.push(Promise.resolve().then(() => getTeamTasks()));
    }
    if (onTasksChanged) refreshes.push(Promise.resolve().then(() => onTasksChanged(executions)));
    await Promise.allSettled(refreshes);
  }, [getTasks, getTeamTasks, onTasksChanged]);
  return <TaskAssistantWidget apiUrl={apiUrl} auth={auth} onTasksChanged={refreshTasks} availabilityCheck={availabilityCheck} />;
}
