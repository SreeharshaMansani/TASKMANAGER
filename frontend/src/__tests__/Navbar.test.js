import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import PersonalTaskContext from '../context/PersonalTaskContext';

function CurrentRoute() {
  const { pathname } = useLocation();
  return <p data-testid="current-route">{pathname}</p>;
}

function renderNavbar(setUser = jest.fn()) {
  return render(
    <MemoryRouter>
      <PersonalTaskContext.Provider value={{ user: 'Learner', setUser, getuser: jest.fn() }}>
        <Navbar />
        <CurrentRoute />
      </PersonalTaskContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => { localStorage.setItem('token', 'test-token'); });
afterEach(() => { localStorage.clear(); });

test('navigation disclosure closes with Escape, outside interaction and route selection', () => {
  renderNavbar();
  const toggle = screen.getByRole('button', { name: 'Toggle navigation' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');

  const teamLink = screen.getByRole('link', { name: 'Team Tasks' });
  teamLink.focus();
  fireEvent.keyDown(teamLink, { key: 'Escape' });
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();

  fireEvent.click(toggle);
  fireEvent.pointerDown(document.body);
  expect(toggle).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(toggle);
  fireEvent.click(teamLink);
  expect(screen.getByTestId('current-route')).toHaveTextContent('/team');
  expect(teamLink).toHaveAttribute('aria-current', 'page');
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('logout keeps authentication notification, state reset and login navigation', () => {
  const setUser = jest.fn();
  const onAuthChanged = jest.fn();
  window.addEventListener('taskmanager:auth-changed', onAuthChanged);
  try {
    renderNavbar(setUser);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(onAuthChanged).toHaveBeenCalledTimes(1);
    expect(setUser).toHaveBeenCalledWith('');
    expect(screen.getByTestId('current-route')).toHaveTextContent('/login');
  } finally {
    window.removeEventListener('taskmanager:auth-changed', onAuthChanged);
  }
});
