import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function RequestAccess() {
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    sex: '',
    contactNo: '',
    email: '',
    department: 'Internal Oversight',
    employeeId: '',
    password: '',
  });
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }
    setError('');
    setIdPhoto(file);
    setIdPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setIdPhoto(null);
    setIdPhotoPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!form.lastName.trim()) {
      setError('Last name is required.');
      return;
    }
    if (!form.sex) {
      setError('Please select your sex.');
      return;
    }
    if (!form.contactNo.trim()) {
      setError('Contact number is required.');
      return;
    }
    if (!idPhoto) {
      setError('Please upload your photo for your ID verification.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Security Protocols before submitting.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName.trim());
      formData.append('middleName', form.middleName.trim());
      formData.append('lastName', form.lastName.trim());
      formData.append('sex', form.sex);
      formData.append('contactNo', form.contactNo.trim());
      formData.append('email', form.email.trim());
      formData.append('department', form.department);
      formData.append('employeeId', form.employeeId.trim());
      formData.append('password', form.password);
      formData.append('idPhoto', idPhoto);

      const { data } = await api.post('/auth/request-access', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(data.message);
      setForm({
        firstName: '',
        middleName: '',
        lastName: '',
        sex: '',
        contactNo: '',
        email: '',
        department: 'Internal Oversight',
        employeeId: '',
        password: '',
      });
      setIdPhoto(null);
      setIdPhotoPreview('');
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
      <div className="admin-request-shell max-w-6xl mx-auto grid md:grid-cols-2 gap-10 px-8 py-10">
        <div>
          <span className="inline-block text-[11px] font-semibold tracking-wide bg-orange-100 text-orange-600 px-2 py-1 rounded">
            ACCESS PROTOCOL
          </span>
          <h1 className="text-4xl font-extrabold mt-4 leading-tight text-slate-900">
            Administrative Authority Enrollment.
          </h1>
          <p className="text-slate-500 mt-4 leading-relaxed">
            Secure the integrity of regional governance. Request access to the Civic Ledger portal to
            manage institutional records and oversight.
          </p>

          <div className="mt-8 space-y-6">
            <div className="flex gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-semibold text-slate-800">Identity Verification</p>
                <p className="text-sm text-slate-500">
                  Official ID photo validation and departmental credential checks are required for all
                  administrative tiers.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🔒</span>
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
          <h2 className="font-bold text-xl text-slate-900">Request Admin Credentials</h2>
          <p className="text-sm text-slate-500 mb-6">Please provide your official institutional details.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Breakdown: First, Middle, Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  FIRST NAME <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.firstName}
                  onChange={update('firstName')}
                  placeholder="e.g. Julian"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  MIDDLE NAME
                </label>
                <input
                  value={form.middleName}
                  onChange={update('middleName')}
                  placeholder="e.g. Cruz (Optional)"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  LAST NAME <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.lastName}
                  onChange={update('lastName')}
                  placeholder="e.g. Montgomery"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Sex & Contact No */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  SEX <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.sex}
                  onChange={update('sex')}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  CONTACT NO. <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.contactNo}
                  onChange={update('contactNo')}
                  placeholder="e.g. 0917 123 4567"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Photo in your ID Upload */}
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                PHOTO IN YOUR ID / VALID ID PHOTO <span className="text-red-500">*</span>
              </label>
              {idPhotoPreview ? (
                <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xs border border-slate-200 rounded-lg">
                  <img
                    src={idPhotoPreview}
                    alt="ID Preview"
                    className="w-16 h-16 rounded-md object-cover border border-slate-300 shadow-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{idPhoto?.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {(idPhoto?.size / (1024 * 1024)).toFixed(2)} MB • Photo Attached
                    </p>
                    <div className="mt-1 flex gap-2">
                      <label className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-lg p-4 bg-white/60 hover:bg-white/80 transition-colors cursor-pointer text-center group">
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🪪</span>
                  <span className="text-xs font-semibold text-slate-700">
                    Click to upload your photo or ID card
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG, or WebP up to 5MB (Clear front-facing photo or ID)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            {/* Email Address & Employee ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  EMAIL ADDRESS <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="you@example.com"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  EMPLOYEE ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.employeeId}
                  onChange={update('employeeId')}
                  placeholder="CL-8848-00X"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Department & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">
                  DEPARTMENT <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.department}
                  onChange={update('department')}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Internal Oversight</option>
                  <option>Urban Infrastructure & Planning</option>
                  <option>Community Health</option>
                  <option>Peace & Order</option>
                </select>
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
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={8}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 -mt-2">
              Password must be at least 8 characters.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg p-3">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium rounded-lg px-4 py-3 disabled:opacity-60 transition-colors shadow-sm"
            >
              {loading ? 'Submitting Request…' : 'REQUEST ACCESS →'}
            </button>

            <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>
                I agree to the <span className="text-blue-600 underline">Security Protocols</span>
              </span>
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
