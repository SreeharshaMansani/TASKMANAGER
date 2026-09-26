import React, { useContext, useEffect } from 'react';
import { act, render, screen } from '@testing-library/react';
import TeamTaskState from '../context/TeamTaskState';
import TeamTaskContext from '../context/TeamTaskContext';

function TeamConsumer() {
  const { teamTasks, getTeamTasks } = useContext(TeamTaskContext);
  useEffect(() => { getTeamTasks(); }, [getTeamTasks]);
  return teamTasks.map(task => <p key={task._id}>{task.title}</p>);
}

beforeEach(() => { localStorage.setItem('token', 'test-token'); });
afterEach(() => { localStorage.clear(); jest.restoreAllMocks(); });

test('team task refresh updates the view without triggering a fetch loop', async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [{ _id: 'task-1', title: 'Updated team task' }] });
  render(<TeamTaskState><TeamConsumer /></TeamTaskState>);
  await screen.findByText('Updated team task');
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('an old account refresh cannot populate team tasks after token changes', async () => {
  let finishRequest;
  global.fetch = jest.fn(() => new Promise(resolve => { finishRequest = resolve; }));
  render(<TeamTaskState><TeamConsumer /></TeamTaskState>);
  localStorage.setItem('token', 'different-token');
  await act(async () => finishRequest({ ok: true, json: async () => [{ _id: 'private-1', title: 'Old private team task' }] }));
  expect(screen.queryByText('Old private team task')).not.toBeInTheDocument();
});
