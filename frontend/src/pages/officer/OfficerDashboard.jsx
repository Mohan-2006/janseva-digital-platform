import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const STATUS_BADGE = {
  submitted: 'status-pending',
  under_review: 'status-pending',
  approved: 'status-approved',
  rejected: 'status-rejected',
};

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/officer/applications${params}`);
      setApplications(res.data.applications || []);
      setStats(res.data.stats || { pending: 0, approved: 0, rejected: 0, total: 0 });
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await api.put(`/officer/applications/${selected.id}`, {
        status: action,
        remarks,
      });
      setSelected(null);
      setRemarks('');
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">जनसेवा Officer Portal</h1>
          <p className="text-blue-200 text-sm">{user?.district} District</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.full_name}</span>
          <button onClick={logout} className="text-blue-200 hover:text-white text-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-900' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-50 text-yellow-900' },
            { label: 'Approved', value: stats.approved, color: 'bg-green-50 text-green-900' },
            { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-900' },
          ].map(s => (
            <div key={s.label} className={`card ${s.color} text-center`}>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['all', 'submitted', 'under_review', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f ? 'bg-blue-900 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Applications Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No applications found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">App ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Applicant</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Service</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">District</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-700">{app.application_id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{app.applicant_name}</p>
                        <p className="text-gray-500 text-xs">{app.mobile}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{app.service_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3">{app.district}</td>
                      <td className="px-4 py-3">{formatDate(app.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`${STATUS_BADGE[app.status]} capitalize`}>
                          {app.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setSelected(app); setRemarks(app.remarks || ''); }}
                          className="text-blue-700 hover:underline text-xs font-medium"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Review Application</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Application ID</span>
                  <span className="font-mono font-medium">{selected.application_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Applicant</span>
                  <span className="font-medium">{selected.applicant_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service</span>
                  <span className="capitalize">{selected.service_type?.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mobile</span>
                  <span>{selected.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">District</span>
                  <span>{selected.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted</span>
                  <span>{formatDate(selected.created_at)}</span>
                </div>
              </div>

              {selected.purpose && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Purpose</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selected.purpose}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks / टिप्पणी
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  className="input-field"
                  placeholder="Add remarks for this application..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('under_review')}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-4 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() => handleAction('approved')}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={actionLoading}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
