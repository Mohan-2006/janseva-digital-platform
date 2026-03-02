import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', labelMr: 'सादर केले' },
  { key: 'under_review', label: 'Under Review', labelMr: 'तपासणी अंतर्गत' },
  { key: 'approved', label: 'Approved', labelMr: 'मंजूर' },
  { key: 'rejected', label: 'Rejected', labelMr: 'नाकारलेले' },
];

const STATUS_COLORS = {
  submitted: 'text-blue-600 bg-blue-50 border-blue-200',
  under_review: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  approved: 'text-green-700 bg-green-50 border-green-200',
  rejected: 'text-red-700 bg-red-50 border-red-200',
};

export default function ApplicationStatus() {
  const navigate = useNavigate();
  const [applicationId, setApplicationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [application, setApplication] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!applicationId.trim()) return;
    setError('');
    setLoading(true);
    setApplication(null);
    try {
      const res = await api.get(`/citizen/applications/${applicationId.trim()}`);
      setApplication(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Application not found. Please check the ID.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => STATUS_STEPS.findIndex(s => s.key === status);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Track Application</h1>
          <p className="text-gray-600 mt-1">अर्ज स्थिती तपासा</p>
        </div>

        {/* Search Form */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={applicationId}
              onChange={e => setApplicationId(e.target.value)}
              className="input-field flex-1"
              placeholder="Enter Application ID / अर्ज क्रमांक टाका"
            />
            <button type="submit" disabled={loading} className="btn-primary px-8">
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
          {error && (
            <p className="mt-3 text-red-600 text-sm">{error}</p>
          )}
        </div>

        {/* Result */}
        {application && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`card border-2 ${STATUS_COLORS[application.status] || 'text-gray-700 bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide opacity-70">Application ID</p>
                  <p className="text-lg font-bold font-mono">{application.application_id}</p>
                  <p className="mt-2 text-2xl font-bold capitalize">
                    {STATUS_STEPS.find(s => s.key === application.status)?.label || application.status}
                  </p>
                  <p className="text-sm">
                    {STATUS_STEPS.find(s => s.key === application.status)?.labelMr}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-70">Service</p>
                  <p className="font-semibold capitalize">{application.service_type?.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Progress Steps */}
              {application.status !== 'rejected' && (
                <div className="mt-6">
                  <div className="flex items-center">
                    {STATUS_STEPS.filter(s => s.key !== 'rejected').map((step, idx, arr) => {
                      const current = getStepIndex(application.status);
                      const stepIdx = getStepIndex(step.key);
                      const done = stepIdx <= current && application.status !== 'rejected';
                      return (
                        <div key={step.key} className="flex items-center flex-1 last:flex-none">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                            done ? 'bg-current border-current text-white' : 'bg-white border-gray-300 text-gray-400'
                          }`}>
                            {done ? '✓' : idx + 1}
                          </div>
                          <p className="text-xs ml-1 hidden sm:block">{step.label}</p>
                          {idx < arr.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 rounded ${
                              done && stepIdx < current ? 'bg-current' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Application Details */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details / अर्ज तपशील</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Applicant Name</p>
                  <p className="font-medium">{application.applicant_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mobile</p>
                  <p className="font-medium">{application.mobile}</p>
                </div>
                <div>
                  <p className="text-gray-500">District</p>
                  <p className="font-medium">{application.district}</p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted On</p>
                  <p className="font-medium">{formatDate(application.created_at)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(application.updated_at)}</p>
                </div>
                {application.officer_name && (
                  <div>
                    <p className="text-gray-500">Assigned Officer</p>
                    <p className="font-medium">{application.officer_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Remarks */}
            {application.remarks && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Officer Remarks / अधिकारी टिप्पणी</h2>
                <p className="text-gray-700">{application.remarks}</p>
              </div>
            )}

            {/* Timeline */}
            {application.timeline && application.timeline.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
                <div className="space-y-3">
                  {application.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{event.action}</p>
                        <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                        {event.note && <p className="text-sm text-gray-600">{event.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={() => navigate('/citizen/apply')} className="btn-primary">
            New Application
          </button>
          <button onClick={() => navigate('/citizen/dashboard')} className="btn-secondary">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
