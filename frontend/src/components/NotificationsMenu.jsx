import React, { useEffect, useRef, useState } from 'react';
import api from '../api';

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && items.length === 0) {
      setLoading(true);
      setError('');
      api
        .get('/dashboard/overview')
        .then((res) => setItems(res.data.recentActivity || []))
        .catch(() => setError('Unable to load notifications.'))
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="relative text-slate-400 hover:text-slate-600"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {items.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-slate-100 z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="font-semibold text-sm text-slate-800">Recent Activity</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && <p className="px-4 py-4 text-sm text-slate-400">Loading…</p>}
            {error && <p className="px-4 py-4 text-sm text-red-600">{error}</p>}
            {!loading && !error && items.length === 0 && (
              <p className="px-4 py-4 text-sm text-slate-400">No recent activity.</p>
            )}
            {!loading &&
              !error &&
              items.map((item, idx) => (
                <div key={idx} className="px-4 py-3 border-b border-slate-50 last:border-b-0">
                  <div className="flex justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">{item.title}</p>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">{item.when}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
