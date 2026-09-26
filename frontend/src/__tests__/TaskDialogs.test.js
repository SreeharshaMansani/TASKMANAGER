import React from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PersonalTaskContext from '../context/PersonalTaskContext';
import PersonalTasks from '../pages/PersonalTasks';

afterEach(() => localStorage.clear());

test('task dialog focuses fields, contains keyboard focus, and restores its trigger on Escape', async () => {
  localStorage.setItem('token', 'test-session');
  await act(async () => { render(<MemoryRouter><PersonalTaskContext.Provider value={{
    tasks: [], getTasks: jest.fn().mockResolvedValue(), addTask: jest.fn(),
  }}><PersonalTasks /></PersonalTaskContext.Provider></MemoryRouter>); });
  const trigger = screen.getByRole('button', { name: 'Create personal task' });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Create personal task' });
  const title = within(dialog).getByRole('textbox', { name: 'Title', exact: true });
  expect(title).toHaveFocus();
  fireEvent.change(title, { target: { value: 'Keep focus while typing' } });
  expect(title).toHaveFocus();

  const close = within(dialog).getByRole('button', { name: 'Close task form' });
  const submit = within(dialog).getByRole('button', { name: 'Create Task' });
  submit.focus();
  fireEvent.keyDown(submit, { key: 'Tab' });
  expect(close).toHaveFocus();
  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
  expect(submit).toHaveFocus();
  trigger.focus();
  expect(title).toHaveFocus();
  fireEvent.keyDown(title, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('added task steps and sections keep visible indexed labels after typing', async () => {
  localStorage.setItem('token', 'test-session');
  await act(async () => { render(<MemoryRouter><PersonalTaskContext.Provider value={{
    tasks: [], getTasks: jest.fn().mockResolvedValue(), addTask: jest.fn(),
  }}><PersonalTasks /></PersonalTaskContext.Provider></MemoryRouter>); });
  fireEvent.click(screen.getByRole('button', { name: 'Create personal task' }));
  fireEvent.click(screen.getByRole('button', { name: /Add Step/ }));
  fireEvent.click(screen.getByRole('button', { name: /Add Section/ }));
  const step = screen.getByLabelText('Step 1 description');
  fireEvent.change(step, { target: { value: 'Read the requirements' } });
  expect(step).toHaveAccessibleName('Step 1 description');
  expect(screen.getByLabelText('Section 1 title')).toBeInTheDocument();
  expect(screen.getByLabelText('Section 1 description (optional)')).toBeInTheDocument();
});
