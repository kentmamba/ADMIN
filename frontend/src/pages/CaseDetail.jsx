import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Mediation', 'Resolved'];

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Mediation: 'bg-purple-100 text-purple-700',
  Resolved: 'bg-green-100 text-green-700',
};

function formatDateTime(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export default function CaseDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = () => {
    api
      .get(`/complaints/${id}`)
      .then((res) => setComplaint(res.data))
      .catch(() => setError('Case not found.'));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const { data } = await api.put(`/complaints/${id}`, { status: newStatus });
      setComplaint(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleEscalationChange = async () => {
    setUpdating(true);
    setError('');
    try {
      const { data } = await api.put(`/complaints/${id}`, {
        needsEscalation: !complaint.needsEscalation,
      });
      setComplaint(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update escalation decision.');
    } finally {
      setUpdating(false);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!complaint) return <p className="text-slate-500">Loading case…</p>;

  const isFromPortal = !!complaint.filedByResidentId;

  return (
    <div className="max-w-4xl space-y-6">
      <Link to="/complaints" className="text-sm text-blue-600 hover:underline">
        ← Back to Complaints Record
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{complaint.category}</h1>
            {isFromPortal && (
              <span className="text-[11px] font-medium bg-sky-50 text-sky-600 px-2 py-0.5 rounded">
                Filed via Resident Portal
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Case ID: {complaint.id} · Filed by {complaint.resident} · {complaint.filingDate}
          </p>
        </div>
        <select
          value={complaint.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className={`text-sm font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 ${
            statusStyles[complaint.status] || 'bg-slate-100 text-slate-600'
          }`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt} className="bg-white text-slate-700">
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {complaint.narrative && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">Narrative</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {complaint.narrative}
              </p>
            </div>
          )}

          {!complaint.narrative && complaint.description && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">Description</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>
          )}

          {complaint.reliefSought && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">Relief Sought</h2>
              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                {complaint.reliefSought}
              </p>
            </div>
          )}

          {(complaint.respondent || complaint.respondentAddress) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">Respondent</h2>
              <p className="text-sm text-slate-700 font-medium">{complaint.respondent || '—'}</p>
              <p className="text-sm text-slate-500 mt-1">{complaint.respondentAddress || '—'}</p>
            </div>
          )}

          {complaint.attachmentUrl && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">Evidence / Attachment</h2>
              <a
                href={complaint.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block"
              >
                {/\.(jpe?g|png|gif|webp)$/i.test(complaint.attachmentUrl) ? (
                  <img
                    src={complaint.attachmentUrl}
                    alt="Evidence"
                    className="max-h-64 rounded-lg border border-slate-200"
                  />
                ) : (
                  <span className="text-sm text-blue-600 hover:underline">View attached file →</span>
                )}
              </a>
            </div>
          )}

          {complaint.attachmentUrl && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-slate-800 mb-3">AI Evidence Scan</h2>
              <p className={`text-sm font-semibold ${complaint.aiScanStatus === 'possibly_ai_generated' ? 'text-red-600' : complaint.aiScanStatus === 'likely_authentic' ? 'text-green-600' : 'text-amber-600'}`}>
                {complaint.aiScanStatus === 'possibly_ai_generated'
                  ? 'Possibly AI-generated'
                  : complaint.aiScanStatus === 'likely_authentic'
                    ? 'Likely authentic'
                    : complaint.aiScanStatus === 'not_configured'
                      ? 'AI scan not configured'
                      : complaint.aiScanStatus === 'provider_unavailable'
                        ? 'AI provider unavailable; manual review required'
                        : 'Manual review required'}
              </p>
              {complaint.aiScanScore !== null && complaint.aiScanScore !== undefined && (
                <p className="text-xs text-slate-500 mt-1">AI-generated confidence: {(Number(complaint.aiScanScore) * 100).toFixed(1)}%</p>
              )}
              <p className="text-xs text-slate-400 mt-2">This result is advisory and does not replace staff review.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-3 text-sm">Filing Details</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-xs text-slate-400">COMPLAINANT ADDRESS</p>
                <p className="text-slate-700">{complaint.complainantAddress || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">PRIORITY</p>
                <p className="text-slate-700">{complaint.priority}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ESCALATION DECISION</p>
                <p className={`mt-1 text-sm font-semibold ${complaint.needsEscalation ? 'text-red-600' : 'text-slate-500'}`}>
                  {complaint.needsEscalation ? 'Needs Escalation' : 'No Escalation Needed'}
                </p>
                <button
                  type="button"
                  onClick={handleEscalationChange}
                  disabled={updating}
                  className="mt-3 text-xs font-medium text-blue-600 hover:underline disabled:opacity-60"
                >
                  {complaint.needsEscalation ? 'Clear Escalation Flag' : 'Mark for Escalation'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-navy-900 text-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-sm mb-3">Timeline</h2>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-medium text-white">Submitted</p>
                <p className="text-slate-300">{formatDateTime(complaint.submittedAt) || '—'}</p>
              </div>
              <div>
                <p className={complaint.underReviewAt ? 'font-medium text-white' : 'text-slate-400'}>
                  Under Review
                </p>
                <p className="text-slate-300">{formatDateTime(complaint.underReviewAt) || 'Not yet'}</p>
              </div>
              <div>
                <p className={complaint.resolvedAt ? 'font-medium text-white' : 'text-slate-400'}>
                  Resolved
                </p>
                <p className="text-slate-300">{formatDateTime(complaint.resolvedAt) || 'Not yet'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
