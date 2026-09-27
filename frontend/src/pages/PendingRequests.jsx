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
  const [previewDoc, setPreviewDoc] = useState(null);

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
              <th className="px-5 py-3 font-medium">SEX</th>
              <th className="px-5 py-3 font-medium">CONTACT</th>
              <th className="px-5 py-3 font-medium">EMAIL</th>
              <th className="px-5 py-3 font-medium">DEPARTMENT</th>
              <th className="px-5 py-3 font-medium">EMPLOYEE ID</th>
              <th className="px-5 py-3 font-medium">ID DOCUMENT</th>
              <th className="px-5 py-3 font-medium">REQUESTED</th>
              <th className="px-5 py-3 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-5 py-6 text-center text-slate-400">
                  Loading requests…
                </td>
              </tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={9} className="px-5 py-6 text-center text-slate-400">
                  No pending requests.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">
                  <div>{r.fullName}</div>
                  {(r.firstName || r.lastName) && (
                    <div className="text-[11px] text-slate-400">
                      {[r.firstName, r.middleName, r.lastName].filter(Boolean).join(' ')}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-600">{r.sex || '—'}</td>
                <td className="px-5 py-3 text-slate-600">{r.contactNo || '—'}</td>
                <td className="px-5 py-3 text-slate-500">{r.email}</td>
                <td className="px-5 py-3 text-slate-500">{r.department}</td>
                <td className="px-5 py-3 text-slate-500">{r.employeeId}</td>
                <td className="px-5 py-3">
                  {r.idDocumentUrl ? (
                    <div className="flex items-center gap-2">
                      {r.idDocumentUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i) && (
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ url: r.idDocumentUrl, name: r.fullName })}
                          className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 transition flex-shrink-0 cursor-pointer shadow-xs bg-slate-100"
                          title="Click to preview ID"
                        >
                          <img
                            src={r.idDocumentUrl}
                            alt={r.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                            🔍
                          </div>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPreviewDoc({ url: r.idDocumentUrl, name: r.fullName })}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        <span>🪪</span>
                        <span>View ID</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </td>
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

      {previewDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Identity Verification Document</h3>
                <p className="text-xs text-slate-500">Applicant: {previewDoc.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 max-h-[65vh] flex items-center justify-center overflow-auto rounded-xl bg-slate-900/5 p-2">
              {previewDoc.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                <img
                  src={previewDoc.url}
                  alt="ID Document"
                  className="max-h-[60vh] w-auto object-contain rounded-lg shadow-sm"
                />
              ) : (
                <iframe
                  src={previewDoc.url}
                  title="ID Document PDF"
                  className="w-full h-[60vh] rounded-lg border-0"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={previewDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
              >
                ↗ Open in new tab / download original
              </a>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
