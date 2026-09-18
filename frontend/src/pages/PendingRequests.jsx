import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioningId, setActioningId] = useState(null);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/auth/access-requests').then((res) => res.data),
      api.get('/residents/pending-registrations').then((res) => res.data),
    ])
      .then(([accessRequests, pendingResidents]) => {
        setRequests(accessRequests);
        setRegistrations(pendingResidents);
      })
      .catch(() => setError('Unable to load pending requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    setActioningId(id);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post(`/auth/access-requests/${id}/approve`);
      setMessage(data.message);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve this request.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (id) => {
    setActioningId(id);
    setError('');
    setMessage('');
    try {
      const { data } = await api.post(`/auth/access-requests/${id}/reject`);
      setMessage(data.message);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reject this request.');
    } finally {
      setActioningId(null);
    }
  };

  const handleApproveResident = async (id, fullName) => {
    setActioningId(id);
    setError('');
    setMessage('');
    try {
      await api.post(`/residents/${id}/approve`);
      setMessage(`${fullName} has been approved and can now sign in to the Residents Portal.`);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to approve this registration.');
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectResident = async (id, fullName) => {
    setActioningId(id);
    setError('');
    setMessage('');
    try {
      await api.post(`/residents/${id}/reject`);
      setMessage(`Registration from ${fullName} has been rejected.`);
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reject this registration.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pending Requests</h1>
        <p className="text-sm text-slate-500">
          Review and approve or reject requests for administrative access, and household registrations
          submitted through the Residents Portal.
        </p>
      </div>

      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Resident Registrations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Self-registered through the Residents Portal — not yet visible in Resident Records until approved.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">FULL NAME</th>
              <th className="px-5 py-3 font-medium">EMAIL</th>
              <th className="px-5 py-3 font-medium">ZONE</th>
              <th className="px-5 py-3 font-medium">CONTACT</th>
              <th className="px-5 py-3 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  Loading registrations…
                </td>
              </tr>
            )}
            {!loading && registrations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400">
                  No pending registrations.
                </td>
              </tr>
            )}
            {registrations.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">
                  <Link to={`/residents/${r.id}`} className="hover:underline">{r.fullName}</Link>
                </td>
                <td className="px-5 py-3 text-slate-500">{r.email}</td>
                <td className="px-5 py-3 text-slate-500">{r.zone}</td>
                <td className="px-5 py-3 text-slate-500">{r.contact}</td>
                <td className="px-5 py-3 space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => handleApproveResident(r.id, r.fullName)}
                    disabled={actioningId === r.id}
                    className="text-xs font-medium bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectResident(r.id, r.fullName)}
                    disabled={actioningId === r.id}
                    className="text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg disabled:opacity-60"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Staff Access Requests</h2>
          <p className="text-xs text-slate-500 mt-0.5">Requests for administrative access to the Civic Ledger portal.</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3 font-medium">FULL NAME</th>
              <th className="px-5 py-3 font-medium">EMAIL</th>
              <th className="px-5 py-3 font-medium">DEPARTMENT</th>
              <th className="px-5 py-3 font-medium">EMPLOYEE ID</th>
              <th className="px-5 py-3 font-medium">REQUESTED</th>
              <th className="px-5 py-3 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  Loading requests…
                </td>
              </tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  No pending requests.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{r.fullName}</td>
                <td className="px-5 py-3 text-slate-500">{r.email}</td>
                <td className="px-5 py-3 text-slate-500">{r.department}</td>
                <td className="px-5 py-3 text-slate-500">{r.employeeId}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">
                  {new Date(r.requestedAt).toLocaleString()}
                </td>
                <td className="px-5 py-3 space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => handleApprove(r.id)}
                    disabled={actioningId === r.id}
                    className="text-xs font-medium bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(r.id)}
                    disabled={actioningId === r.id}
                    className="text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg disabled:opacity-60"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
