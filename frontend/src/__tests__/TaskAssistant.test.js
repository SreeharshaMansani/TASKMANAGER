import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import ChatWidget from '../integrations/TaskAssistant';
import PersonalTaskContext from '../context/PersonalTaskContext';
import TeamTaskContext from '../context/TeamTaskContext';

function renderChat({ open = true, personal = {}, team = {}, availabilityCheck = false, ...props } = {}) {
  const result = render(
    <MemoryRouter>
      <PersonalTaskContext.Provider value={{ user: 'Test user', ...personal }}>
        <TeamTaskContext.Provider value={team}>
          <Link to="/team">Go to team tasks</Link>
          <Routes><Route path="/" element={<p>Personal page</p>} /><Route path="/team" element={<p>Team page</p>} /></Routes>
          <ChatWidget availabilityCheck={availabilityCheck} {...props} />
        </TeamTaskContext.Provider>
      </PersonalTaskContext.Provider>
    </MemoryRouter>
  );
  if (open && localStorage.getItem('token')) fireEvent.click(screen.getByRole('button', { name: 'Open task assistant' }));
  return result;
}

function send(message) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Message the task assistant' }), { target: { value: message } });
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
}

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('token', 'test-token');
  global.fetch = jest.fn();
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

test('hides the widget for signed-out users without a separate login screen', () => {
  localStorage.removeItem('token');
  renderChat();
  expect(screen.queryByRole('button', { name: 'Open task assistant' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Sign in/ })).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

test('sends authenticated messages, continues the session, and shows the tool trace', async () => {
  fetch.mockResolvedValueOnce(response({
    sessionId: 'session-1',
    reply: 'You have two pending tasks.',
    retrieval: { mode: 'vector', candidates: [{ name: 'list_personal_tasks', score: 0.86 }] },
    toolExecutions: [{ tool: 'list_personal_tasks', success: true }],
  }));
  fetch.mockResolvedValueOnce(response({ sessionId: 'session-1', reply: 'The first task is Review project.' }));
  renderChat();
  send('Show my pending tasks');
  expect(await screen.findByText('You have two pending tasks.')).toBeInTheDocument();
  const firstRequest = fetch.mock.calls[0][1];
  expect(firstRequest.headers.Authorization).toBe('Bearer test-token');
  expect(JSON.parse(firstRequest.body)).toEqual({ message: 'Show my pending tasks', timeZone: expect.any(String) });
  expect(screen.getByText('score 0.860')).toBeInTheDocument();
  expect(screen.getByText('Succeeded')).toBeInTheDocument();

  send('What is the first one?');
  await screen.findByText('The first task is Review project.');
  expect(JSON.parse(fetch.mock.calls[1][1].body).sessionId).toBe('session-1');
  expect(localStorage.length).toBe(1);
});

test('prevents duplicate requests and resets the session only after a reply', async () => {
  let finishRequest;
  fetch.mockImplementationOnce(() => new Promise((resolve) => { finishRequest = resolve; }));
  renderChat();
  send('List my tasks');
  expect(screen.getByRole('button', { name: /New chat/ })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  expect(fetch).toHaveBeenCalledTimes(1);
  await act(async () => finishRequest(response({ sessionId: 'old-session', reply: 'Here are your tasks.' })));
  fireEvent.click(screen.getByRole('button', { name: /New chat/ }));
  expect(screen.queryByText('Here are your tasks.')).not.toBeInTheDocument();

  fetch.mockResolvedValueOnce(response({ sessionId: 'new-session', reply: 'Starting fresh.' }));
  send('Hello');
  await screen.findByText('Starting fresh.');
  expect(JSON.parse(fetch.mock.calls[1][1].body)).not.toHaveProperty('sessionId');
});

test('uses TaskManager session guidance on expired token without a separate login', async () => {
  fetch.mockResolvedValueOnce(response({ error: 'Invalid token' }, 401));
  renderChat();
  send('Complete my task');
  expect(await screen.findByRole('alert')).toHaveTextContent('Sign in to your application again');
  expect(screen.queryByRole('link', { name: /Sign in/ })).not.toBeInTheDocument();
  expect(screen.queryByText('Succeeded')).not.toBeInTheDocument();
});

test('explains an unavailable server and does not automatically retry an action', async () => {
  fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
  renderChat();
  send('Create a task');
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the chatbot');
  expect(screen.getByRole('alert')).toHaveTextContent('check your task list before sending it again');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('textbox')).toHaveValue('Create a task');
});

test('disables input while the chatbot API is offline and reconnects on demand', async () => {
  fetch
    .mockRejectedValueOnce(new TypeError('Failed to fetch'))
    .mockResolvedValueOnce(response({ status: 'ok' }));
  renderChat({ availabilityCheck: true });
  expect(await screen.findByText('Task Assistant is unavailable. Start the chatbot server to send messages.')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await waitFor(() => expect(screen.getByRole('textbox')).toBeEnabled());
  expect(fetch.mock.calls.map(([url]) => url)).toEqual([
    'http://localhost:3001/health',
    'http://localhost:3001/health',
  ]);
});

test('expired conversation offers explicit recovery, retaining the draft without resubmission', async () => {
  fetch.mockResolvedValueOnce(response({ sessionId: 'expired-session', reply: 'Hello!' }));
  renderChat();
  send('Hi');
  await screen.findByText('Hello!');
  fetch.mockResolvedValueOnce(response({ code: 'SESSION_EXPIRED', error: 'This conversation has expired.' }, 404));
  send('Show my tasks');
  const recovery = await screen.findByRole('button', { name: 'Start a new chat with this draft' });
  expect(screen.getByRole('textbox')).toHaveValue('Show my tasks');
  fireEvent.click(recovery);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveValue('Show my tasks');
  expect(fetch).toHaveBeenCalledTimes(2);
  fetch.mockResolvedValueOnce(response({ sessionId: 'fresh-session', reply: 'Your tasks.' }));
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
  await screen.findByText('Your tasks.');
  expect(JSON.parse(fetch.mock.calls[2][1].body)).not.toHaveProperty('sessionId');
});

test('does not suggest checking task changes when retrieval failed before an action', async () => {
  fetch.mockResolvedValueOnce(response({ error: 'Embedding request failed.', code: 'EMBEDDING_PROVIDER_ERROR', uncertain: false }, 502));
  renderChat();
  send('Create a task');
  expect(await screen.findByRole('alert')).toHaveTextContent('Embedding request failed.');
  expect(screen.getByRole('alert')).toHaveTextContent('No task changes were made.');
  expect(screen.getByRole('alert')).not.toHaveTextContent('check your task list before sending it again');
  expect(fetch).toHaveBeenCalledTimes(1);
});

test.each([true, undefined])('keeps the retry warning for server failures with uncertain=%s', async (uncertain) => {
  fetch.mockResolvedValueOnce(response({ error: 'The request could not be completed.', ...(uncertain === undefined ? {} : { uncertain }) }, 502));
  renderChat();
  send('Create a task');
  expect(await screen.findByRole('alert')).toHaveTextContent('check your task list before sending it again');
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('clears conversation and ignores a late response when the account changes', async () => {
  let finishRequest;
  fetch.mockImplementationOnce(() => new Promise((resolve) => { finishRequest = resolve; }));
  renderChat();
  send('Show private tasks');
  const signal = fetch.mock.calls[0][1].signal;
  act(() => {
    localStorage.setItem('token', 'different-account-token');
    window.dispatchEvent(new Event('storage'));
  });
  await waitFor(() => expect(screen.queryByText('Show private tasks')).not.toBeInTheDocument());
  expect(signal.aborted).toBe(true);
  await act(async () => finishRequest(response({ sessionId: 'private-session', reply: 'Private task details' })));
  expect(screen.queryByText('Private task details')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Open task assistant' }));
  expect(screen.getByRole('button', { name: /New chat/ })).toBeEnabled();
});

test('starts collapsed, focuses the composer, and Escape returns focus to the launcher', () => {
  renderChat({ open: false });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const launcher = screen.getByRole('button', { name: 'Open task assistant' });
  expect(launcher).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(launcher);
  const composer = screen.getByRole('textbox');
  expect(composer).toHaveFocus();
  fireEvent.change(composer, { target: { value: 'Draft to keep' } });
  fireEvent.keyDown(composer, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(launcher).toHaveFocus();
  fireEvent.click(launcher);
  expect(screen.getByRole('textbox')).toHaveValue('Draft to keep');
});

test('keeps an in-flight request and session across minimizing and route changes', async () => {
  let finishRequest;
  fetch.mockImplementationOnce(() => new Promise((resolve) => { finishRequest = resolve; }));
  renderChat({ apiUrl: 'https://assistant.example.com/' });
  send('Show my tasks');
  const signal = fetch.mock.calls[0][1].signal;
  expect(fetch.mock.calls[0][0]).toBe('https://assistant.example.com/api/chat');
  fireEvent.click(screen.getByRole('button', { name: 'Close task assistant' }));
  fireEvent.click(screen.getByRole('link', { name: 'Go to team tasks' }));
  expect(screen.getByText('Team page')).toBeInTheDocument();
  expect(signal.aborted).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Open task assistant' }));
  expect(screen.getByRole('status')).toHaveTextContent('Working on your request');
  expect(screen.getByRole('button', { name: 'New chat' })).toBeDisabled();
  expect(fetch).toHaveBeenCalledTimes(1);
  await act(async () => finishRequest(response({ sessionId: 'persistent-session', reply: 'Still here.' })));
  fetch.mockResolvedValueOnce(response({ sessionId: 'persistent-session', reply: 'Next answer.' }));
  send('What next?');
  await screen.findByText('Next answer.');
  expect(JSON.parse(fetch.mock.calls[1][1].body).sessionId).toBe('persistent-session');
});

test('logout aborts a pending request and removes conversation before another login', async () => {
  let finishRequest;
  fetch.mockImplementationOnce(() => new Promise((resolve) => { finishRequest = resolve; }));
  renderChat();
  send('Show sensitive tasks');
  const signal = fetch.mock.calls[0][1].signal;
  act(() => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('taskmanager:auth-changed'));
  });
  expect(signal.aborted).toBe(true);
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  await act(async () => finishRequest(response({ sessionId: 'private-session', reply: 'Sensitive answer' })));
  act(() => {
    localStorage.setItem('token', 'new-token');
    window.dispatchEvent(new Event('taskmanager:auth-changed'));
  });
  fireEvent.click(screen.getByRole('button', { name: 'Open task assistant' }));
  expect(screen.queryByText('Sensitive answer')).not.toBeInTheDocument();
  expect(screen.queryByText('Show sensitive tasks')).not.toBeInTheDocument();
});

test('refreshes affected task contexts after successful mutations including completion', async () => {
  const getTasks = jest.fn().mockResolvedValue([]);
  const getTeamTasks = jest.fn().mockResolvedValue([]);
  const onTasksChanged = jest.fn().mockRejectedValue(new Error('Host refresh unavailable'));
  const toolExecutions = [
    { tool: 'complete_personal_task', success: true },
    { tool: 'update_team_task', success: true },
    { tool: 'delete_personal_task', success: false },
  ];
  fetch.mockResolvedValueOnce(response({ sessionId: 'session-1', reply: 'Tasks updated.', toolExecutions }));
  renderChat({ personal: { getTasks }, team: { getTeamTasks }, onTasksChanged });
  send('Complete my task and update the team task');
  await screen.findByText('Tasks updated.');
  await waitFor(() => expect(onTasksChanged).toHaveBeenCalledWith(toolExecutions.slice(0, 2)));
  expect(getTasks).toHaveBeenCalledTimes(1);
  expect(getTeamTasks).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('does not refresh task lists for read-only tools or failed mutations', async () => {
  const getTasks = jest.fn();
  const getTeamTasks = jest.fn();
  fetch.mockResolvedValueOnce(response({ sessionId: 'session-1', reply: 'The update was not permitted.', toolExecutions: [
    { tool: 'list_personal_tasks', success: true }, { tool: 'update_team_task', success: false },
  ] }));
  renderChat({ personal: { getTasks }, team: { getTeamTasks } });
  send('Find and update my task');
  await screen.findByText('The update was not permitted.');
  expect(getTasks).not.toHaveBeenCalled();
  expect(getTeamTasks).not.toHaveBeenCalled();
});
