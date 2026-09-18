import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';

export default function LetterIssued() {
  const { id } = useParams();
  const { state } = useLocation();
  const escalation = state?.escalation;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-navy-900 text-white rounded-xl p-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold bg-white/10 px-2 py-1 rounded">PROCESS COMPLETE</span>
          <h1 className="text-xl font-bold mt-2">Letter Issued Successfully</h1>
          <p className="text-sm text-slate-300 mt-1">
            The official escalation letter has been recorded in the civic ledger and dispatched to the
            respective department.
          </p>
        </div>
        <span className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">✓</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-slate-400">OFFICIAL REFERENCE</p>
          <p className="font-semibold text-slate-800">{escalation?.toDepartment || 'Recipient Department'}</p>
          <p className="text-sm text-slate-500 mt-3">SUBJECT LINE</p>
          <p className="text-sm text-slate-700">
            {id} · {escalation?.subject || 'Escalation Letter'}
          </p>
          <p className="text-xs text-slate-400 mt-3">
            REFERENCE NUMBER: {escalation?.id || id} · ISSUE DATE: {escalation?.escalated || '—'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-400">DIGITAL LEDGER</p>
            <p className="text-sm text-green-600 font-medium">✓ Verified</p>
          </div>
          <div className="border border-slate-100 rounded-lg p-3">
            <p className="text-xs text-slate-400">DEPARTMENTAL EMAIL</p>
            <p className="text-sm text-green-600 font-medium">Delivered</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Link to="/escalation" className="text-sm text-blue-600 hover:underline">
          ← Return to Escalation Queue
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium rounded-lg px-4 py-2.5"
        >
          Print Confirmation
        </button>
      </div>
    </div>
  );
}
