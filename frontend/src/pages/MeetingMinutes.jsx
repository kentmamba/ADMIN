import React, { useEffect, useState } from 'react';
import api from '../api';

export default function MeetingMinutes() {
  const [meetings, setMeetings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/meetings').then((res) => {
      setMeetings(res.data);
      setSelected(res.data[0] || null);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-slate-500">Loading meeting minutes…</p>;
  if (!selected) return <p className="text-slate-500">No meetings recorded yet.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Meeting Minutes & Resolutions</h1>
        <p className="text-sm text-slate-500">Barangay Poblacion MS</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">{selected.title}</h2>
            <p className="text-sm text-slate-500">
              {selected.date} · {selected.time} · {selected.location}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">AGENDA</p>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              {selected.agenda.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ol>

            <p className="text-xs font-semibold text-slate-400 mt-6 mb-2">ATTENDEES</p>
            <div className="flex flex-wrap gap-2">
              {selected.attendees.map((name) => (
                <span key={name} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">MINUTES OF THE MEETING</p>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-4 leading-relaxed">
              {selected.minutes || 'No minutes recorded yet.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Resolutions & Actions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="py-2 font-medium">RESOLUTION ID</th>
              <th className="py-2 font-medium">DESCRIPTION</th>
              <th className="py-2 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {selected.resolutions.map((r) => (
              <tr key={r.id} className="border-b border-slate-50">
                <td className="py-3 font-medium text-slate-700">{r.id}</td>
                <td className="py-3 text-slate-600">{r.title}</td>
                <td className="py-3">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      r.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
