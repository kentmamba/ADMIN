import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import StatCard from '../components/StatCard.jsx';

const priorityStyles = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-orange-100 text-orange-700',
  Medium: 'bg-blue-100 text-blue-700',
};

const STATUS_OPTIONS = ['Under Review', 'Mediation', 'Resolved'];

export default function Escalation() {
  const [escalations, setEscalations] = useState([]);
  const [stats, setStats] = useState({ total: 0, highUrgency: 0, resolutionRate: 0, avgResponseHours: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const fetchEscalations = () => {
    setLoading(true);
    api.get('/escalations').then((res) => {
      setEscalations(res.data.escalations);
      setStats(res.data.stats);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setError('');
    setUpdatingId(id);
    try {
      await api.put(`/escalations/${id}`, { status: newStatus });
      fetchEscalations();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Escalation Management</h1>
          <p className="text-sm text-slate-500">
            Manage critical administrative escalations and judicial requests requiring higher-level
            oversight and formal mediation.
          </p>
        </div>
        <Link
          to="/escalation/new"
          className="bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium rounded-lg px-4 py-2.5 whitespace-nowrap"
        >
          Create Escalation Letter
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Escalations" value={stats.total} accent="blue" />
        <StatCard label="High Urgency" value={stats.highUrgency} accent="red" />
        <StatCard label="Resolution Rate" value={`${stats.resolutionRate}%`} accent="green" />
        <StatCard label="Avg. Response Time" value={`${stats.avgResponseHours}h`} accent="orange" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Active Escalation Queue</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">CASE ID</th>
              <th className="px-5 py-3 font-medium">CATEGORY</th>
              <th className="px-5 py-3 font-medium">REASON</th>
              <th className="px-5 py-3 font-medium">PRIORITY</th>
              <th className="px-5 py-3 font-medium">OVERSEER</th>
              <th className="px-5 py-3 font-medium">STATUS</th>
              <th className="px-5 py-3 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-6 text-center text-slate-400">
                  Loading escalations…
                </td>
              </tr>
            )}
            {escalations.map((e) => (
              <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-blue-600">{e.id}</td>
                <td className="px-5 py-3 text-slate-700">{e.category}</td>
                <td className="px-5 py-3 text-slate-500">{e.reason}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${priorityStyles[e.priority] || 'bg-slate-100 text-slate-600'}`}>
                    {e.priority}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500">{e.overseer}</td>
                <td className="px-5 py-3">
                  <select
                    value={e.status}
                    onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                    disabled={updatingId === e.id}
                    className="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">
                  <span className="text-blue-600 text-xs cursor-pointer hover:underline">Review Case</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
