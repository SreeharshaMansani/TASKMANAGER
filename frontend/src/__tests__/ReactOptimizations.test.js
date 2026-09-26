import React, { useContext } from 'react';
import { act, render, renderHook } from '@testing-library/react';
import useAuthenticatedRead from '../hooks/useAuthenticatedRead';
import PersonalTaskState from '../context/PersonalTaskState';
import PersonalTaskContext from '../context/PersonalTaskContext';
import TeamTaskState from '../context/TeamTaskState';
import TeamTaskContext from '../context/TeamTaskContext';

const originalFetch = global.fetch;
beforeEach(() => localStorage.setItem('token', 'account-a'));
afterEach(() => { localStorage.clear(); global.fetch = originalFetch; });

test('simultaneous reads share a request but later refreshes still fetch', async () => {
  let finish;
  const load = jest.fn(() => new Promise(resolve => { finish = resolve; }));
  const { result } = renderHook(() => useAuthenticatedRead(load));
  const first = result.current[0]();
  expect(result.current[0]()).toBe(first);
  await act(async () => {});
  expect(load).toHaveBeenCalledTimes(1);
  await act(async () => { finish([]); await first; });
  const next = result.current[0]();
  expect(next).not.toBe(first);
  await act(async () => {});
  expect(load).toHaveBeenCalledTimes(2);
  await act(async () => { finish([]); await next; });
});

test('a mutation invalidates a pending read so it cannot overwrite newer task state', async () => {
  let finish;
  let isCurrent;
  const load = (token, current) => { isCurrent = current; return new Promise(resolve => { finish = resolve; }); };
  const { result } = renderHook(() => useAuthenticatedRead(load));
  const request = result.current[0]();
  await act(async () => {});
  expect(isCurrent()).toBe(true);
  result.current[1]();
  expect(isCurrent()).toBe(false);
  await act(async () => { finish([]); await request; });
});

test('reads are isolated across accounts and rejected requests can be retried', async () => {
  const contexts = [];
  const load = jest.fn((token, isCurrent) => {
    contexts.push({ token, isCurrent });
    return token === 'account-a' ? Promise.reject(new Error('offline')) : Promise.resolve([]);
  });
  const { result } = renderHook(() => useAuthenticatedRead(load));
  await expect(result.current[0]()).rejects.toThrow('offline');
  localStorage.setItem('token', 'account-b');
  await result.current[0]();
  expect(contexts.map(context => context.token)).toEqual(['account-a', 'account-b']);
  expect(contexts[0].isCurrent()).toBe(false);
  expect(load).toHaveBeenCalledTimes(2);
});

test.each([
  ['personal', PersonalTaskState, PersonalTaskContext, 'addTask', 'tasks'],
  ['team', TeamTaskState, TeamTaskContext, 'addTeamTask', 'teamTasks'],
])('concurrent %s task creations preserve both results', async (scope, Provider, Context, action, list) => {
  let state;
  const writes = [];
  global.fetch = jest.fn((url, options = {}) => {
    if (options.method === 'POST') return new Promise(resolve => writes.push(resolve));
    return Promise.resolve({ ok: true, json: async () => url.endsWith('/getuser') ? { name: 'Learner' } : [] });
  });
  function Probe() { state = useContext(Context); return null; }
  await act(async () => { render(<Provider><Probe /></Provider>); });
  const stableAction = state[action];
  const first = state[action](scope === 'team' ? { title: 'First' } : 'First');
  const second = state[action](scope === 'team' ? { title: 'Second' } : 'Second');
  const response = task => ({ ok: true, json: async () => scope === 'team' ? { success: true, task } : task });
  await act(async () => { writes[1](response({ _id: '2', title: 'Second' })); await second; });
  await act(async () => { writes[0](response({ _id: '1', title: 'First' })); await first; });
  expect(state[list].map(task => task.title)).toEqual(['Second', 'First']);
  expect(state[action]).toBe(stableAction);
});
