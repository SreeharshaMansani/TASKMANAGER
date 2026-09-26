import { useEffect, useRef } from 'react';

const focusableSelector = 'a[href], button, input:not([type="hidden"]), textarea, select, [tabindex]';

function focusableElements(dialog) {
  return [...dialog.querySelectorAll(focusableSelector)].filter(element => {
    const style = window.getComputedStyle(element);
    return element.tabIndex >= 0 && !element.disabled && !element.closest('[hidden], [inert]')
      && style.display !== 'none' && style.visibility !== 'hidden';
  });
}

// Shared by create/edit dialogs. Callback changes while typing must not reset focus.
export default function useTaskDialog(isOpen, onClose, returnFocusRef) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const trigger = returnFocusRef?.current || document.activeElement;
    const focusFirst = () => {
      const controls = focusableElements(dialog);
      const firstField = controls.find(element => ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName));
      (firstField || controls[0] || dialog).focus({ preventScroll: true });
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
      } else if (event.key === 'Tab') {
        const controls = focusableElements(dialog);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) {
          event.preventDefault();
          dialog.focus({ preventScroll: true });
        } else if (!dialog.contains(document.activeElement) || document.activeElement === dialog) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const containFocus = event => {
      if (!dialog.contains(event.target)) focusFirst();
    };
    focusFirst();
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', containFocus);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', containFocus);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [isOpen, returnFocusRef]);

  return dialogRef;
}
