import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import '../../styles/Toast.css';

export default function Toast() {
  const [notice, setNotice] = useState(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const receive = event => setNotice(event.detail);
    window.addEventListener('taskmanager:notification', receive);
    return () => window.removeEventListener('taskmanager:notification', receive);
  }, []);
  useEffect(() => {
    if (!notice || paused) return undefined;
    const timer = window.setTimeout(() => setNotice(null), notice.type === 'error' ? 6000 : 4000);
    return () => window.clearTimeout(timer);
  }, [notice, paused]);

  return <div className="toast-region" aria-label="Notifications">
    {notice && <div className={`app-toast app-toast-${notice.type}`}
      role={notice.type === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      {notice.type === 'error' ? <FiAlertCircle aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}
      <span>{notice.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={() => { setNotice(null); setPaused(false); }}><FiX aria-hidden="true" /></button>
    </div>}
  </div>;
}
