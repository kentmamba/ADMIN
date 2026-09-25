import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [institutionalId, setInstitutionalId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(institutionalId, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-6">
        <div className="bg-navy-900 rounded-2xl p-10 flex flex-col items-center justify-center text-center text-white shadow-xl shadow-navy-900/20">
          <div className="h-24 w-24 rounded-full bg-white/10 border-4 border-white/20 mb-6 flex items-center justify-center text-4xl">
            🏛️
          </div>
          <h1 className="text-lg font-bold leading-snug">
            Welcome to Smart Profiling and Complaint Management System for Barangay Poblacion
          </h1>
        </div>

        <div className="bg-white rounded-2xl p-10 shadow-xl shadow-slate-300/40 border border-slate-100">
          <div className="flex flex-col items-center mb-6">
            <div className="h-14 w-14 rounded-xl bg-blue-700 flex items-center justify-center text-2xl text-white mb-3">
              🏦
            </div>
            <h2 className="font-bold tracking-wide text-slate-800">INTERNAL ACCESS</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold tracking-wide text-slate-600">
                INSTITUTIONAL ID
              </label>
              <input
                type="text"
                value={institutionalId}
                onChange={(e) => setInstitutionalId(e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CL-8848-00X"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-wide text-slate-600">PASSWORD</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium rounded-lg px-4 py-3 transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Secure Login →'}
            </button>

            <p className="text-center text-xs text-slate-500 pt-2">
              New system administrator?{' '}
              <Link to="/request-access" className="font-semibold text-slate-700 hover:underline">
                Request Account Access
              </Link>
            </p>
          </form>

          <p className="mt-6 text-center text-[11px] text-slate-400">
            Demo credentials — ID: <span className="font-mono">CL-8848-00X</span> · Password:{' '}
            <span className="font-mono">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
