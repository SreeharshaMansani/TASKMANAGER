// Deadlines use calendar days, as in the task creation route. Compare copies so
// validation does not change the Date objects that Mongoose will save.
function calendarDay(value) {
  const date = new Date(value);
  return date.setHours(0, 0, 0, 0);
}

function validateTeamTaskDateChange(task, { startDate, dueDate }, now = new Date()) {
  // Completing or renaming an existing task must not revalidate old dates.
  if (startDate === undefined && dueDate === undefined) return null;

  const startValue = startDate !== undefined ? startDate : task.startDate;
  const dueValue = dueDate !== undefined ? dueDate : task.dueDate;
  const startDay = startValue == null ? null : calendarDay(startValue);
  const dueDay = dueValue == null ? NaN : calendarDay(dueValue);

  if (!Number.isFinite(dueDay) || (startDay !== null && !Number.isFinite(startDay))) {
    return 'Start and due dates must be valid dates';
  }
  if (startDay !== null && dueDay < startDay) {
    return 'Due date must be on or after the start date';
  }
  if (dueDate !== undefined && dueDay < calendarDay(now)) {
    return 'Due date must be today or in the future';
  }
  return null;
}

module.exports = { validateTeamTaskDateChange };
