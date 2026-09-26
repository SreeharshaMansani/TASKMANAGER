import { useCallback, useRef } from 'react';

// Share only an active read, never cache completed responses or share accounts.
export default function useAuthenticatedRead(load) {
  const pending = useRef(null);
  const invalidate = useCallback(() => { pending.current = null; }, []);
  const read = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve([]);
    if (pending.current?.token === token && pending.current.load === load) {
      return pending.current.promise;
    }
    const request = { token, load };
    pending.current = request;
    const isCurrent = () => pending.current === request && localStorage.getItem('token') === token;
    request.promise = (async () => load(token, isCurrent))().finally(() => {
      if (pending.current === request) pending.current = null;
    });
    return request.promise;
  }, [load]);
  return [read, invalidate];
}
