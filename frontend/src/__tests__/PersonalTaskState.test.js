import React, { useContext, useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import PersonalTaskState from '../context/PersonalTaskState';
import PersonalTaskContext from '../context/PersonalTaskContext';

function TaskConsumer() {
  const { tasks, getTasks, user, setUser } = useContext(PersonalTaskContext);
  // PersonalTasks uses the same dependency to refresh its list on mount.
  useEffect(() => { getTasks(); }, [getTasks]);
  return (
    <>
      <p>Signed in as {user}</p>
      {tasks.map(task => <p key={task._id}>{task.title}</p>)}
      <button onClick={() => setUser('Updated learner')}>Update display name</button>
    </>
  );
}

test('task and profile results do not trigger repeated fetching through consumer effects', async () => {
  const originalFetch = global.fetch;
  const requests = [];
  localStorage.setItem('token', 'test-token');
  jest.spyOn(console, 'log').mockImplementation(() => {});
  global.fetch = jest.fn(url => new Promise(resolve => requests.push({ url, resolve })));

  try {
    await act(async () => { render(<PersonalTaskState><TaskConsumer /></PersonalTaskState>); });
    // The provider and page share their simultaneous initial list request.
    expect(requests.filter(request => request.url.endsWith('/fetchtasks'))).toHaveLength(1);
    expect(requests.filter(request => request.url.endsWith('/getuser'))).toHaveLength(1);

    await act(async () => {
      for (const request of [...requests]) {
        request.resolve({ ok: true, json: async () => request.url.endsWith('/getuser')
          ? { name: 'Learner' }
          : [{ _id: 'task-1', title: 'Review tools' }] });
      }
    });
    expect(screen.getByText('Review tools')).toBeInTheDocument();
    expect(screen.getByText('Signed in as Learner')).toBeInTheDocument();
    expect(requests).toHaveLength(2);

    fireEvent.click(screen.getByRole('button', { name: 'Update display name' }));
    expect(screen.getByText('Signed in as Updated learner')).toBeInTheDocument();
    expect(requests).toHaveLength(2);
  } finally {
    global.fetch = originalFetch;
    localStorage.clear();
    jest.restoreAllMocks();
  }
});
