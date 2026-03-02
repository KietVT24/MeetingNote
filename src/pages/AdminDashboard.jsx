import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Users, Clock, CheckCircle, XCircle, Shield, Crown, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [pendingRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/pending-payments`, { headers }),
        axios.get(`${API_URL}/api/admin/users`, { headers })
      ]);

      setPendingUsers(pendingRes.data.users || []);
      setAllUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      if (err.response?.status === 403) {
        navigate('/meetings');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/meetings');
      return;
    }
    fetchData();
  }, [user]);

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/admin/approve-payment/${userId}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      await fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Lỗi duyệt thanh toán');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/admin/reject-payment/${userId}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      await fetchData();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Lỗi từ chối thanh toán');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (paymentStatus, isPremium) => {
    if (isPremium) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          <Crown size={12} /> Premium
        </span>
      );
    }
    if (paymentStatus === 'pending_approval') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
          <Clock size={12} /> Chờ duyệt
        </span>
      );
    }
    if (paymentStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <XCircle size={12} /> Từ chối
        </span>
      );
    }
    if (paymentStatus === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle size={12} /> Đã duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        Free
      </span>
    );
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
          <Shield size={12} /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        User
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield size={24} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Quản lý người dùng & thanh toán</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
              title="Làm mới"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => navigate('/meetings')}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{allUsers.length}</p>
                <p className="text-xs text-slate-500">Tổng người dùng</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{pendingUsers.length}</p>
                <p className="text-xs text-slate-500">Chờ duyệt</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Crown size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {allUsers.filter(u => u.is_premium).length}
                </p>
                <p className="text-xs text-slate-500">Premium</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-cyan-800 font-medium">{message}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Chờ duyệt {pendingUsers.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/30">{pendingUsers.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả người dùng
          </button>
        </div>

        {/* Pending Payments Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-3">
            {pendingUsers.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Không có yêu cầu nào đang chờ duyệt</p>
              </div>
            ) : (
              pendingUsers.map((u) => (
                <div key={u.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-amber-300 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Đăng ký: {formatDate(u.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(u.id)}
                        disabled={actionLoading === u.id}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
                      >
                        {actionLoading === u.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(u.id)}
                        disabled={actionLoading === u.id}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold transition-colors flex items-center gap-1.5"
                      >
                        {actionLoading === u.id ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* All Users Tab */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Người dùng</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lượt dùng thử</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{getRoleBadge(u.role)}</td>
                      <td className="px-5 py-4">{getStatusBadge(u.payment_status, u.is_premium)}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700 font-mono">{u.trial_count}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-500">{formatDate(u.created_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
