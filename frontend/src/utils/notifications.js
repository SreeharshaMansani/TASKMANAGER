const show = (message, type) => {
  window.dispatchEvent(new CustomEvent('taskmanager:notification', {
    detail: { message: String(message || 'Something went wrong. Please try again.'), type },
  }));
};

export const notify = {
  success: message => show(message, 'success'),
  error: message => show(message, 'error'),
};
