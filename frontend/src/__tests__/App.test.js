import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

test('keeps the assistant out of navigation and hidden while signed out', () => {
  localStorage.clear();
  render(<App />);
  expect(screen.queryByRole('link', { name: 'Task Assistant' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Open task assistant' })).not.toBeInTheDocument();
});

test('mounts the widget once for logged-in users across real task routes', async () => {
  const originalFetch = global.fetch;
  localStorage.setItem('token', 'test-token');
  global.fetch = jest.fn(url => Promise.resolve({ ok: true, json: async () => url.endsWith('/getuser') ? { name: 'Learner' } : [] }));
  try {
    render(<App />);
    await screen.findByText('Welcome, Learner');
    fireEvent.click(screen.getByRole('button', { name: 'Open task assistant' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Message the task assistant' }), { target: { value: 'Keep this draft' } });
    fireEvent.click(screen.getByRole('link', { name: 'Team Tasks' }));
    await screen.findByText('No team tasks matched your search/filters.');
    expect(screen.getByRole('textbox', { name: 'Message the task assistant' })).toHaveValue('Keep this draft');
    expect(screen.getAllByRole('dialog', { name: 'Task Assistant' })).toHaveLength(1);
  } finally {
    global.fetch = originalFetch;
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  }
});
