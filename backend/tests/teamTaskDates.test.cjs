const test = require('node:test');
const assert = require('node:assert/strict');
const { validateTeamTaskDateChange } = require('../src/utils/teamTaskDates');

// Use explicit local calendar dates so these tests work in any server time zone.
const today = new Date(2026, 8, 11, 14, 30);
const yesterday = new Date(2026, 8, 10);
const tomorrow = new Date(2026, 8, 12);
const dueTodayTask = { startDate: new Date(2026, 8, 11, 10), dueDate: new Date(2026, 8, 11) };

test('can complete or rename a task created today with a midnight due date', () => {
  assert.equal(validateTeamTaskDateChange(dueTodayTask, { status: 'Completed' }, today), null);
  assert.equal(validateTeamTaskDateChange(dueTodayTask, { title: 'New title' }, today), null);
});

test('can complete overdue tasks without changing their deadlines', () => {
  const overdue = { startDate: new Date(2026, 8, 9), dueDate: yesterday };
  assert.equal(validateTeamTaskDateChange(overdue, { status: 'Completed' }, today), null);
});

test('a changed deadline can be today even after midnight or the task start time', () => {
  assert.equal(validateTeamTaskDateChange(dueTodayTask, { dueDate: new Date(2026, 8, 11) }, today), null);
});

test('compares Date objects and ISO timestamps consistently', () => {
  const changed = { startDate: today.toISOString(), dueDate: tomorrow.toISOString() };
  assert.equal(validateTeamTaskDateChange(dueTodayTask, changed, today), null);
  assert.match(validateTeamTaskDateChange(dueTodayTask, { startDate: tomorrow.toISOString() }, today), /on or after/);
});

test('rejects a changed due date before the start day', () => {
  assert.match(validateTeamTaskDateChange(dueTodayTask, { dueDate: yesterday }, today), /on or after/);
});

test('rejects a changed deadline before today, even if it follows the start date', () => {
  const task = { startDate: new Date(2026, 8, 9), dueDate: tomorrow };
  assert.match(validateTeamTaskDateChange(task, { dueDate: yesterday }, today), /today or in the future/);
});

test('rejects invalid changed dates', () => {
  assert.match(validateTeamTaskDateChange(dueTodayTask, { dueDate: 'not a date' }, today), /valid dates/);
  assert.match(validateTeamTaskDateChange(dueTodayTask, { startDate: new Date(NaN) }, today), /valid dates/);
});

test('validation leaves original date objects unchanged', () => {
  const startTime = dueTodayTask.startDate.getTime();
  const dueTime = dueTodayTask.dueDate.getTime();
  const nowTime = today.getTime();
  validateTeamTaskDateChange(dueTodayTask, { dueDate: tomorrow }, today);
  assert.equal(dueTodayTask.startDate.getTime(), startTime);
  assert.equal(dueTodayTask.dueDate.getTime(), dueTime);
  assert.equal(today.getTime(), nowTime);
});
