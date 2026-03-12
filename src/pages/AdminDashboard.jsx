import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Clock, CheckCircle, XCircle, Shield, Crown, RefreshCw,
  AlertTriangle, Zap, ToggleLeft, ToggleRight, CalendarDays
} from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

// ── Confirmation Modal ────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, title, description, confirmLabel, confirmClass, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onCancel} disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
            Huỷ
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-60 ${confirmClass}`}>
            {loading ? <RefreshCw size={14} className="animate-spin" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AdminDashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingPacks, setPendingPacks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  // Role modal
  const [roleModal, setRoleModal] = useState({ isOpen: false, targetUser: null, newRole: null, loading: false });
  // Pack modal
  const [packModal, setPackModal] = useState({ isOpen: false, payment: null, action: null, loading: false });
  // Premium modal
  const [premiumModal, setPremiumModal] = useState({ isOpen: false, targetUser: null, enable: false, loading: false });

  const showMessage = (text, type = 'info') => { setMessage(text); setMessageType(type); };

  const authHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, packsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/pending-payments`, { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/users`, { headers: authHeaders() }),
        axios.get(`${API_URL}/api/admin/pending-packs`, { headers: authHeaders() }),
      ]);
      setPendingUsers(pendingRes.data.users || []);
      setAllUsers(usersRes.data.users || []);
      setPendingPacks(packsRes.data.payments || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      if (err.response?.status === 403) navigate('/meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/meetings'); return; }
    fetchData();
  }, [user]);

  // ── Premium (manual approve) actions ────────────────────────────────────
  const handleApprove = async (userId) => {
    setActionLoading(userId); showMessage('');
    try {
      const response = await axios.post(`${API_URL}/api/admin/approve-payment/${userId}`, {}, { headers: authHeaders() });
      showMessage(response.data.message, 'info');
      await fetchData();
    } catch (err) { showMessage(err.response?.data?.error || 'Lỗi duyệt thanh toán', 'error'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (userId) => {
    setActionLoading(userId); showMessage('');
    try {
      const response = await axios.post(`${API_URL}/api/admin/reject-payment/${userId}`, {}, { headers: authHeaders() });
      showMessage(response.data.message, 'info');
      await fetchData();
    } catch (err) { showMessage(err.response?.data?.error || 'Lỗi từ chối thanh toán', 'error'); }
    finally { setActionLoading(null); }
  };

  // ── Role actions ─────────────────────────────────────────────────────────
  const openRoleModal  = (targetUser, newRole) => setRoleModal({ isOpen: true, targetUser, newRole, loading: false });
  const closeRoleModal = () => { if (roleModal.loading) return; setRoleModal({ isOpen: false, targetUser: null, newRole: null, loading: false }); };

  const handleRoleChange = async () => {
    const { targetUser, newRole } = roleModal;
    setRoleModal(p => ({ ...p, loading: true })); showMessage('');
    try {
      const response = await axios.put(`${API_URL}/api/admin/update-role/${targetUser.id}`, { role: newRole }, { headers: authHeaders() });
      showMessage(response.data.message, 'info');
      setRoleModal({ isOpen: false, targetUser: null, newRole: null, loading: false });
      await fetchData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Lỗi cập nhật role', 'error');
      setRoleModal(p => ({ ...p, loading: false }));
    }
  };

  // ── Pack actions ──────────────────────────────────────────────────────────
  const openPackModal  = (payment, action) => setPackModal({ isOpen: true, payment, action, loading: false });
  const closePackModal = () => { if (packModal.loading) return; setPackModal({ isOpen: false, payment: null, action: null, loading: false }); };

  const handlePackAction = async () => {
    const { payment, action } = packModal;
    setPackModal(p => ({ ...p, loading: true })); showMessage('');
    try {
      const endpoint = action === 'approve'
        ? `${API_URL}/api/admin/approve-pack/${payment.id}`
        : `${API_URL}/api/admin/reject-pack/${payment.id}`;
      const response = await axios.post(endpoint, {}, { headers: authHeaders() });
      showMessage(response.data.message, 'info');
      setPackModal({ isOpen: false, payment: null, action: null, loading: false });
      await fetchData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Lỗi xử lý gói lượt', 'error');
      setPackModal(p => ({ ...p, loading: false }));
    }
  };

  // ── Premium toggle actions ────────────────────────────────────────────────
  const openPremiumModal  = (targetUser, enable) => setPremiumModal({ isOpen: true, targetUser, enable, loading: false });
  const closePremiumModal = () => { if (premiumModal.loading) return; setPremiumModal({ isOpen: false, targetUser: null, enable: false, loading: false }); };

  const handlePremiumToggle = async () => {
    const { targetUser, enable } = premiumModal;
    setPremiumModal(p => ({ ...p, loading: true })); showMessage('');
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/set-premium/${targetUser.id}`,
        { isPremium: enable, months: 1 },
        { headers: authHeaders() }
      );
      showMessage(response.data.message, 'info');
      setPremiumModal({ isOpen: false, targetUser: null, enable: false, loading: false });
      await fetchData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Lỗi cập nhật Premium', 'error');
      setPremiumModal(p => ({ ...p, loading: false }));
    }
  };

  // ── Display helpers ──────────────────────────────────────────────────────
  const formatDate = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  const formatDateShort = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: 'numeric', day: 'numeric' })
    : null;

  const isPremiumExpired = (u) => u.premium_expires_at && new Date(u.premium_expires_at) < new Date();

  const getStatusBadge = (paymentStatus, isPremium) => {
    if (isPremium) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"><Crown size={12} /> Premium</span>;
    if (paymentStatus === 'pending_approval') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock size={12} /> Chờ duyệt</span>;
    if (paymentStatus === 'rejected') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"><XCircle size={12} /> Từ chối</span>;
    if (paymentStatus === 'approved') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><CheckCircle size={12} /> Đã duyệt</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">Free</span>;
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><Shield size={12} /> Admin</span>;
    return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">User</span>;
  };

  // Role dropdown
  const RoleSelector = ({ u }) => {
    const isSelf = user?.id === u.id || user?.email === u.email;
    return (
      <div className="flex items-center gap-2">
        {getRoleBadge(u.role)}
        {!isSelf ? (
          <select value={u.role} onChange={(e) => openRoleModal(u, e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-600 bg-white hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer transition-colors">
            <option value="user">👤 User</option>
            <option value="admin">👑 Admin</option>
          </select>
        ) : (
          <span className="text-xs text-slate-400 italic">(bạn)</span>
        )}
      </div>
    );
  };

  // Premium toggle button
  const PremiumToggle = ({ u }) => {
    const isSelf = user?.id === u.id || user?.email === u.email;
    if (isSelf) return <span className="text-xs text-slate-400 italic">—</span>;
    const expired = isPremiumExpired(u);
    const active = u.is_premium && !expired;
    return (
      <button
        onClick={() => openPremiumModal(u, !active)}
        title={active ? 'Thu hồi Premium' : 'Cấp Premium 1 tháng'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
          active
            ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-green-50 hover:border-green-300 hover:text-green-700'
        }`}>
        {active ? <ToggleRight size={14} className="text-amber-500" /> : <ToggleLeft size={14} />}
        {active ? 'Có Premium' : 'Cấp Premium'}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Role confirm modal */}
      <ConfirmModal
        isOpen={roleModal.isOpen}
        title="Xác nhận thay đổi role"
        description={roleModal.targetUser && roleModal.newRole
          ? `Bạn sắp thay đổi role của ${roleModal.targetUser.name} (${roleModal.targetUser.email}) từ "${roleModal.targetUser.role}" thành "${roleModal.newRole}".`
          : ''}
        confirmLabel={roleModal.newRole === 'admin' ? 'Cấp Admin' : 'Đặt về User'}
        confirmClass={roleModal.newRole === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-800'}
        onConfirm={handleRoleChange}
        onCancel={closeRoleModal}
        loading={roleModal.loading}
      />

      {/* Pack confirm modal */}
      <ConfirmModal
        isOpen={packModal.isOpen}
        title={packModal.action === 'approve' ? 'Xác nhận duyệt lượt' : 'Xác nhận từ chối'}
        description={packModal.payment
          ? packModal.action === 'approve'
            ? `Duyệt và cộng ${packModal.payment.sessions_requested ?? '?'} lượt cho ${packModal.payment.user_name} (${packModal.payment.user_email}).`
            : `Từ chối yêu cầu mua ${packModal.payment.sessions_requested ?? '?'} lượt của ${packModal.payment.user_name}.`
          : ''}
        confirmLabel={packModal.action === 'approve' ? 'Duyệt & Cộng lượt' : 'Từ chối'}
        confirmClass={packModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
        onConfirm={handlePackAction}
        onCancel={closePackModal}
        loading={packModal.loading}
      />

      {/* Premium toggle modal */}
      <ConfirmModal
        isOpen={premiumModal.isOpen}
        title={premiumModal.enable ? 'Cấp Premium' : 'Thu hồi Premium'}
        description={premiumModal.targetUser
          ? premiumModal.enable
            ? `Cấp Premium 1 tháng cho ${premiumModal.targetUser.name} (${premiumModal.targetUser.email}). Hạn Premium sẽ được tính từ hôm nay.`
            : `Thu hồi Premium của ${premiumModal.targetUser.name} (${premiumModal.targetUser.email}). Tài khoản sẽ trở về Free.`
          : ''}
        confirmLabel={premiumModal.enable ? '👑 Cấp Premium' : '🚫 Thu hồi'}
        confirmClass={premiumModal.enable ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-600 hover:bg-red-700'}
        onConfirm={handlePremiumToggle}
        onCancel={closePremiumModal}
        loading={premiumModal.loading}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Shield size={24} color="white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                <p className="text-slate-500 text-sm">Quản lý người dùng · thanh toán · phân quyền</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchData} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm" title="Làm mới">
                <RefreshCw size={18} />
              </button>
              <button onClick={() => navigate('/meetings')} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium shadow-sm">
                ← Quay lại
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Tổng người dùng',    value: allUsers.length,                                      iconCls: 'text-blue-600',   bgCls: 'bg-blue-100',   Icon: Users },
              { label: 'Chờ duyệt Premium',  value: pendingUsers.length,                                  iconCls: 'text-amber-600',  bgCls: 'bg-amber-100',  valueCls: 'text-amber-600',  Icon: Clock },
              { label: 'Chờ cộng lượt',      value: pendingPacks.length,                                  iconCls: 'text-indigo-600', bgCls: 'bg-indigo-100', valueCls: 'text-indigo-600', Icon: Zap },
              { label: 'Đang Premium',        value: allUsers.filter(u => u.is_premium && !isPremiumExpired(u)).length, iconCls: 'text-yellow-600', bgCls: 'bg-yellow-100', valueCls: 'text-yellow-600', Icon: Crown },
            ].map(({ label, value, Icon, iconCls, bgCls, valueCls }) => (
              <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bgCls} flex items-center justify-center`}>
                    <Icon size={20} className={iconCls} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${valueCls || 'text-slate-900'}`}>{value}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message */}
          {message && (
            <div className={`rounded-xl p-4 mb-6 text-center border ${messageType === 'error' ? 'bg-red-50 border-red-200' : 'bg-cyan-50 border-cyan-200'}`}>
              <p className={`font-medium text-sm ${messageType === 'error' ? 'text-red-800' : 'text-cyan-800'}`}>{message}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit flex-wrap">
            {[
              { key: 'pending', label: 'Chờ duyệt Premium', count: pendingUsers.length, activeCls: 'bg-amber-500 text-white' },
              { key: 'packs',   label: 'Chờ cộng lượt',     count: pendingPacks.length, activeCls: 'bg-indigo-500 text-white' },
              { key: 'all',     label: 'Tất cả người dùng',  count: null,                activeCls: 'bg-slate-700 text-white' },
            ].map(({ key, label, count, activeCls }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === key ? activeCls + ' shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
                {label}
                {count != null && count > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/30">{count}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab: Pending Premium ───────────────────────────────── */}
          {activeTab === 'pending' && (
            <div className="space-y-3">
              {pendingUsers.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                  <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Không có yêu cầu Premium nào đang chờ duyệt</p>
                </div>
              ) : pendingUsers.map((u) => (
                <div key={u.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-amber-300 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Đăng ký: {formatDate(u.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleApprove(u.id)} disabled={actionLoading === u.id}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-semibold transition-colors flex items-center gap-1.5">
                        {actionLoading === u.id ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Duyệt Premium
                      </button>
                      <button onClick={() => handleReject(u.id)} disabled={actionLoading === u.id}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-semibold transition-colors flex items-center gap-1.5">
                        {actionLoading === u.id ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Pending Packs ─────────────────────────────────── */}
          {activeTab === 'packs' && (
            <div className="space-y-3">
              {pendingPacks.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                  <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">Không có yêu cầu mua lượt nào đang chờ duyệt</p>
                </div>
              ) : pendingPacks.map((payment) => (
                <div key={payment.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {payment.user_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{payment.user_name}</p>
                        <p className="text-sm text-slate-500">{payment.user_email}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                            <Zap size={11} />
                            +{payment.sessions_requested ?? '?'} lượt
                          </span>
                          <span className="text-xs text-slate-400">{(payment.amount || 0).toLocaleString('vi-VN')} VND</span>
                          <span className="text-xs text-slate-400">· {formatDate(payment.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openPackModal(payment, 'approve')}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors flex items-center gap-1.5">
                        <CheckCircle size={14} /> Duyệt & cộng lượt
                      </button>
                      <button onClick={() => openPackModal(payment, 'reject')}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center gap-1.5">
                        <XCircle size={14} /> Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: All Users ─────────────────────────────────────── */}
          {activeTab === 'all' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Người dùng</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Premium</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1"><CalendarDays size={12} /> Hết hạn</div>
                      </th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lượt dùng</th>
                      <th className="px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allUsers.map((u) => {
                      const expired = isPremiumExpired(u);
                      return (
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
                          <td className="px-4 py-4"><RoleSelector u={u} /></td>
                          <td className="px-4 py-4">{getStatusBadge(u.payment_status, u.is_premium && !expired)}</td>
                          <td className="px-4 py-4"><PremiumToggle u={u} /></td>
                          <td className="px-4 py-4">
                            {u.premium_expires_at ? (
                              <span className={`text-xs font-medium ${expired ? 'text-red-500' : 'text-green-600'}`}>
                                {formatDateShort(u.premium_expires_at)}
                                {expired && <span className="ml-1 text-red-400">(hết hạn)</span>}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded">
                              {u.session_count ?? 0}
                            </span>
                          </td>
                          <td className="px-4 py-4"><span className="text-xs text-slate-500">{formatDate(u.created_at)}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
