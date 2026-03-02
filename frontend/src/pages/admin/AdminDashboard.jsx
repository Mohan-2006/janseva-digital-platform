import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_applications: 0,
    total_users: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/applications/recent'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setRecentApplications(appsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      await api.put(`/admin/users/${userId}`, { action });
      fetchDashboardData();
      setShowUserModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '-';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">जनसेवा Admin Portal</h1>
          <p className="text-blue-200 text-sm">System Administration</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">{user?.full_name}</span>
          <button onClick={logout} className="text-blue-200 hover:text-white text-sm">
            Logout
          </button>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total_users, icon: '👥', color: 'bg-purple-50 text-purple-900' },
            { label: 'Applications', value: stats.total_applications, icon: '📄', color: 'bg-blue-50 text-blue-900' },
            { label: 'Pending', value: stats.pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-900' },
            { label: 'Approved', value: stats.approved, icon: '✓', color: 'bg-green-50 text-green-900' },
            { label: 'Rejected', value: stats.rejected, icon: '✗', color: 'bg-red-50 text-red-900' },
          ].map(s => (
            <div key={s.label} className={`card ${s.color} text-center`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-3xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        <div className="card mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Applications</h2>
          {recentApplications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent applications</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">ID</th>
                    <th className="text-left px-4 py-2 font-semibold">Applicant</th>
                    <th className="text-left px-4 py-2 font-semibold">Service</th>
                    <th className="text-left px-4 py-2 font-semibold">District</th>
                    <th className="text-left px-4 py-2 font-semibold">Status</th>
                    <th className="text-left px-4 py-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentApplications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-xs text-blue-700">{app.application_id}</td>
                      <td className="px-4 py-2">{app.applicant_name}</td>
                      <td className="px-4 py-2 capitalize">{app.service_type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2">{app.district}</td>
                      <td className="px-4 py-2 capitalize">{app.status?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2">{formatDate(app.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">User Management</h2>
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Name</th>
                    <th className="text-left px-4 py-2 font-semibold">Mobile</th>
                    <th className="text-left px-4 py-2 font-semibold">Role</th>
                    <th className="text-left px-4 py-2 font-semibold">District</th>
                    <th className="text-left px-4 py-2 font-semibold">Status</th>
                    <th className="text-left px-4 py-2 font-semibold">Joined</th>
                    <th className="text-left px-4 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{u.full_name}</td>
                      <td className="px-4 py-2">{u.mobile}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'officer' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">{u.district || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => { setSelectedUser(u); setShowUserModal(true); }}
                          className="text-blue-700 hover:underline text-xs font-medium"
                        >
                          Manage
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

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Manage User</h2>
                <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">{selectedUser.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mobile</span>
                  <span>{selectedUser.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span className="capitalize">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">District</span>
                  <span>{selectedUser.district || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="capitalize">{selectedUser.status}</span>
                </div>
              </div>

              <div className="flex gap-3">
                {selectedUser.status === 'active' ? (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'deactivate')}
                    className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  >
                    Deactivate User
                  </button>
                ) : (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'activate')}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                  >
                    Activate User
                  </button>
                )}
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
