import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function RequestAccess() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    department: 'Internal Oversight',
    employeeId: '',
    password: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!agreed) {
      setError('You must agree to the Security Protocols before submitting.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/request-access', form);
      setMessage(data.message);
      setForm({ fullName: '', email: '', department: 'Internal Oversight', employeeId: '', password: '' });
      setAgreed(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-scene admin-request-scene min-h-screen">
      <div className="admin-request-header px-8 py-4 text-xs font-semibold tracking-wide text-slate-500">
        SMART PROFILING AND COMPLAINT MANAGEMENT SYSTEM FOR BARANGAY POBLACION
      </div>
      <div className="admin-request-shell max-w-6xl mx-auto grid md:grid-cols-2 gap-10 px-8 py-12">
        <div>
          <span className="inline-block text-[11px] font-semibold tracking-wide bg-orange-100 text-orange-600 px-2 py-1 rounded">
            ACCESS PROTOCOL
          </span>
          <h1 className="text-4xl font-extrabold mt-4 leading-tight text-slate-900">
            Administrative Authority Enrollment.
          </h1>
          <p className="text-slate-500 mt-4">
            Secure the integrity of regional governance. Request access to the Civic Ledger portal to
            manage institutional records and oversight.
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex gap-3">
              <span className="text-blue-600">🛡️</span>
              <div>
                <p className="font-semibold text-slate-800">Identity Verification</p>
                <p className="text-sm text-slate-500">
                  Multi-factor authentication and cross-departmental ID validation are required for all
                  administrative tiers.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-blue-600">🔒</span>
              <div>
                <p className="font-semibold text-slate-800">Encrypted Ledger</p>
                <p className="text-sm text-slate-500">
                  All institutional interactions are logged on an immutable, AES-256 encrypted framework.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-request-panel p-8">
          <h2 className="font-bold text-lg text-slate-900">Request Admin Credentials</h2>
          <p className="text-sm text-slate-500 mb-6">Please provide your official institutional details.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  FULL NAME <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.fullName}
                  onChange={update('fullName')}
                  placeholder="e.g. Julian Montgomery"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  EMAIL ADDRESS <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">DEPARTMENT</label>
                <select
                  value={form.department}
                  onChange={update('department')}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Internal Oversight</option>
                  <option>Urban Infrastructure & Planning</option>
                  <option>Community Health</option>
                  <option>Peace & Order</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  EMPLOYEE ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.employeeId}
                  onChange={update('employeeId')}
                  placeholder="CL-8848-00X"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">
                PASSWORD <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                placeholder="••••••••••••"
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Must include 12 characters, 1 uppercase, and a symbol.
              </p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-600">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium rounded-lg px-4 py-3 disabled:opacity-60"
            >
              {loading ? 'Submitting…' : 'REQUEST ACCESS →'}
            </button>

            <label className="flex items-center gap-2 text-xs text-slate-500">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              I agree to the <span className="text-blue-600 underline">Security Protocols</span>
            </label>

            <p className="text-xs text-slate-500 text-right">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-slate-800 hover:underline">
                Log in
              </Link>
            </p>
          </form>

          <div className="mt-6 bg-red-50 text-red-700 text-xs rounded-lg p-3 flex gap-2">
            <span>⚠️</span>
            <p>
              Note: all registrations are reviewed manually by the Institutional Board. Verification can
              take 24–48 business hours. You will receive an encrypted notification upon approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
