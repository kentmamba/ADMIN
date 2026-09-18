import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/', label: 'Overview', icon: '▦', end: true },
  { to: '/residents', label: 'Resident Records', icon: '🧑‍🤝‍🧑' },
  { to: '/complaints', label: 'Complaints Record', icon: '📋' },
  { to: '/meetings', label: 'Meeting Minutes', icon: '🗓️' },
  { to: '/escalation', label: 'Escalation', icon: '📈' },
  { to: '/complaints/new', label: 'Case Filing', icon: '📝' },
  { to: '/pending-requests', label: 'Pending Requests', icon: '🛂' },
  { to: '/announcements', label: 'Announcements', icon: '📣' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = admin?.fullName ? admin.fullName.slice(0, 2).toUpperCase() : 'AD';

  return (
    <aside className="w-64 shrink-0 bg-navy-950 text-slate-200 min-h-screen flex flex-col">
      <div className="px-5 py-6 flex items-center gap-3 border-b border-white/10">
        <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          BP
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white leading-tight truncate">Barangay Poblacion</p>
          <p className="text-[11px] text-slate-400 tracking-wide">LOCAL GOVERNMENT UNIT</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
          Menu
        </p>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-900/40'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span aria-hidden className="text-base leading-none">
              {link.icon}
            </span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 pt-2 border-t border-white/10 space-y-1">
        <NavLink
          to="/residents/enroll"
          className="block text-center bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg px-3 py-2.5 transition-colors shadow-sm shadow-blue-900/40"
        >
          + Enroll Resident
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
              isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <span aria-hidden>⚙️</span>
          <span>Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <span aria-hidden>⎋</span>
          <span>Logout</span>
        </button>

        {admin && (
          <div className="flex items-center gap-2.5 px-3 pt-3 mt-1 border-t border-white/10">
            {admin.photoUrl ? (
              <img
                src={admin.photoUrl}
                alt={admin.fullName}
                className="h-7 w-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-semibold text-white shrink-0">
                {initials}
              </div>
            )}
            <p className="text-[11px] text-slate-400 truncate">{admin.fullName}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
