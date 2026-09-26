import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Toast from '../components/feedback/Toast';
import { notify } from '../utils/notifications';
import Login from '../pages/Login';
import PersonalTaskContext from '../context/PersonalTaskContext';

afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); localStorage.clear(); });

test('login redirects without an alert and keeps the success notification across routes', async () => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  const originalFetch = global.fetch;
  global.fetch = jest.fn().mockResolvedValue({ json: async () => ({ success: true, authtoken: 'fixture-token' }) });
  try {
    render(<MemoryRouter initialEntries={['/login']}>
      <Toast />
      <PersonalTaskContext.Provider value={{ getuser: jest.fn().mockResolvedValue(), getTasks: jest.fn() }}>
        <Routes><Route path="/login" element={<Login />} /><Route path="/" element={<p>Home page</p>} /></Routes>
      </PersonalTaskContext.Provider>
    </MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByText('Home page')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Signed in');
    expect(window.alert).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBe('fixture-token');
  } finally { global.fetch = originalFetch; }
});

test('notifications expire, pause while hovered, and can be dismissed without moving focus', () => {
  jest.useFakeTimers();
  render(<><button>Continue working</button><Toast /></>);
  const working = screen.getByRole('button', { name: 'Continue working' });
  working.focus();
  act(() => notify.success('Saved'));
  expect(working).toHaveFocus();
  act(() => jest.advanceTimersByTime(4000));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  act(() => notify.error('Unable to save'));
  fireEvent.mouseEnter(screen.getByRole('alert'));
  act(() => jest.advanceTimersByTime(10000));
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to save');
  fireEvent.mouseLeave(screen.getByRole('alert'));
  act(() => jest.advanceTimersByTime(6000));
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  act(() => notify.success('Saved again'));
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
