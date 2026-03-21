import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, History, CheckCircle, Clock, Zap, Crown, XCircle, Minus, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';
const PRICE_PER_SESSION = 5000; // VND
const PREMIUM_PRICE = 49000;    // VND / tháng

export default function Payment() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Tab: 'sessions' | 'premium'
  const [tab, setTab] = useState('sessions');

  // Custom session pack
  const [sessions, setSessions] = useState(5);
  const amount = sessions * PRICE_PER_SESSION;

  // UI state
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { fetchHistory(); }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/payments/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPaymentHistory(res.data.payments || []);
    } catch (err) {
      console.error('Failed to fetch payment history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('token');
      const payload = tab === 'premium'
        ? { packageType: 'premium' }
        : { packageType: 'custom_pack', sessions };

      const res = await axios.post(
        `${API_URL}/api/payments/submit-payment`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setSuccessMsg(res.data.message);
      await refreshProfile();
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi yêu cầu thất bại');
    } finally {
      setSubmitLoading(false);
    }
  };

  const changeSessions = (delta) => {
    setSessions(prev => Math.min(500, Math.max(1, prev + delta)));
    setError(''); setSuccessMsg('');
  };

  const isPremium = user?.isPremium;
  const hasPendingPremium = user?.paymentStatus === 'pending_approval';

  // Format premium expiry
  const premiumExpiresAt = user?.premiumExpiresAt
    ? new Date(user.premiumExpiresAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-indigo-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Nâng cấp tài khoản</h1>
          <p className="text-slate-500">Chọn gói phù hợp với nhu cầu của bạn</p>
        </div>

        {/* User status bar */}
        {user && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-0.5">Lượt dùng</p>
                <p className="text-2xl font-bold text-cyan-600">{user.sessionCount ?? 0}</p>
              </div>
              {isPremium && (
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold shadow">
                    <Crown size={16} /> Premium
                  </span>
                  {premiumExpiresAt && (
                    <p className="text-xs text-amber-600 mt-1">Hết hạn: {premiumExpiresAt}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab selector */}
        <div className="flex gap-1 mb-8 bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit mx-auto">
          {[
            { key: 'sessions', label: '⚡ Mua lượt dùng', grad: 'bg-cyan-600 text-white' },
            { key: 'premium',  label: '👑 Premium tháng', grad: 'bg-amber-500 text-white' },
          ].map(({ key, label, grad }) => (
            <button key={key} onClick={() => { setTab(key); setError(''); setSuccessMsg(''); }}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === key ? grad + ' shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── TAB: SESSION PACK ────────────────────────────────────────────── */}
        {tab === 'sessions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">Mua lượt dùng tùy ý</h2>
            <p className="text-sm text-slate-500 text-center mb-8">
              Giá <span className="font-semibold text-cyan-600">5,000 VND / lượt</span> — không hết hạn, dùng khi cần
            </p>

            {/* Session counter */}
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-5">
                  <button onClick={() => changeSessions(-5)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-lg font-bold transition-colors active:scale-95">
                    −5
                  </button>
                  <button onClick={() => changeSessions(-1)}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95">
                    <Minus size={18} />
                  </button>
                  <div className="text-center">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={sessions}
                      onChange={e => setSessions(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
                      className="w-24 text-5xl font-extrabold text-slate-900 text-center border-b-4 border-cyan-500 bg-transparent focus:outline-none pb-1"
                    />
                    <p className="text-sm text-slate-500 mt-1">lượt</p>
                  </div>
                  <button onClick={() => changeSessions(1)}
                    className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors active:scale-95">
                    <Plus size={18} />
                  </button>
                  <button onClick={() => changeSessions(5)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-lg font-bold transition-colors active:scale-95">
                    +5
                  </button>
                </div>

                {/* Quick presets */}
                <div className="flex gap-2 flex-wrap justify-center">
                  {[5, 10, 20, 50, 100].map(n => (
                    <button key={n} onClick={() => { setSessions(n); setError(''); setSuccessMsg(''); }}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${sessions === n ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-600'}`}>
                      {n} lượt
                    </button>
                  ))}
                </div>
              </div>

              {/* Price summary */}
              <div className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-5 text-white text-center shadow-lg">
                <p className="text-sm opacity-80 mb-1">Số tiền cần chuyển</p>
                <p className="text-4xl font-extrabold">{amount.toLocaleString('vi-VN')} VND</p>
                <p className="text-xs opacity-70 mt-1">{sessions} lượt × 5,000 VND/lượt</p>
              </div>

              {/* QR Card */}
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-center">
                  <p className="text-xs tracking-widest uppercase text-slate-400 mb-1">Người nhận</p>
                  <h3 className="text-xl font-bold text-slate-900">PHAN THANH DUY</h3>
                </div>
                <div className="flex justify-center px-6 py-6">
                  <img src="/qr.jpg" alt="QR Code thanh toán" className="w-56 h-56 object-contain" />
                </div>
                <div className="border-t border-slate-200 px-6 py-4 text-center space-y-1">
                  <p className="text-sm text-slate-700">Tài khoản: <span className="font-bold font-mono text-slate-900">100878022719</span></p>
                  <p className="text-xs text-slate-500">VietinBank – CN Bình Định – PGD Vũ Bảo</p>
                </div>
              </div>

              <div className="w-full max-w-sm bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
                <p className="text-sm text-indigo-800">
                  Nội dung gửi tiền: <span className="font-bold text-indigo-950">{user?.name || user?.email} mua {sessions} lượt</span>
                </p>
              </div>

              <p className="text-xs text-slate-500 text-center">Sử dụng app ngân hàng hoặc VNPay, MoMo để quét mã</p>

              {/* Messages */}
              {successMsg && (
                <div className="w-full max-w-sm bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
                  <p className="text-green-800 font-medium text-sm">{successMsg}</p>
                  <p className="text-xs text-green-700 mt-1">Admin sẽ xét duyệt và cộng lượt sớm nhất có thể.</p>
                </div>
              )}
              {error && (
                <div className="w-full max-w-sm bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Submit button */}
              {!successMsg && (
                <button onClick={handleSubmit} disabled={submitLoading}
                  className="w-full max-w-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg flex items-center justify-center gap-2">
                  {submitLoading
                    ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    : <Zap size={20} />}
                  {submitLoading ? 'Đang gửi...' : `Tôi đã chuyển khoản ${amount.toLocaleString('vi-VN')} VND`}
                </button>
              )}

              <p className="text-center text-xs text-slate-500 flex items-center gap-1">
                <Lock size={12} /> Thanh toán an toàn và bảo mật
              </p>
            </div>
          </div>
        )}

        {/* ── TAB: PREMIUM ─────────────────────────────────────────────────── */}
        {tab === 'premium' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
            {/* Premium already */}
            {isPremium ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 text-center">
                <Crown size={40} className="text-amber-500 mx-auto mb-3" />
                <p className="text-xl font-bold text-amber-900 mb-1">Bạn đang là thành viên Premium ✨</p>
                {premiumExpiresAt
                  ? <p className="text-sm text-amber-700">Gói của bạn hết hạn vào <strong>{premiumExpiresAt}</strong></p>
                  : <p className="text-sm text-amber-700">Tận hưởng sử dụng không giới hạn!</p>
                }
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-900 mb-1 text-center">Premium — 1 tháng</h2>
                <p className="text-sm text-slate-500 text-center mb-8">
                  Không giới hạn lượt · AI phân tích · Bot ghi âm tự động
                </p>

                <div className="flex flex-col items-center gap-6">
                  {/* Features */}
                  <div className="w-full max-w-sm bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow">
                        <Crown size={24} color="white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Premium</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-amber-600">{PREMIUM_PRICE.toLocaleString('vi-VN')}</span>
                          <span className="text-sm text-slate-500">VND / tháng</span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {[
                        'Sử dụng không giới hạn lượt',
                        'Bot ghi âm cuộc họp tự động',
                        'AI phân tích thông minh',
                        'Chat với transcript',
                        'Hỗ trợ ưu tiên',
                        'Gia hạn mỗi tháng',
                      ].map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Amount */}
                  <div className="w-full max-w-sm bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-5 text-white text-center shadow-lg">
                    <p className="text-sm opacity-80 mb-1">Số tiền cần chuyển</p>
                    <p className="text-4xl font-extrabold">{PREMIUM_PRICE.toLocaleString('vi-VN')} VND</p>
                    <p className="text-xs opacity-70 mt-1">Hiệu lực 1 tháng kể từ ngày admin duyệt</p>
                  </div>

                  {/* QR Card */}
                  <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-center">
                      <p className="text-xs tracking-widest uppercase text-slate-400 mb-1">Người nhận</p>
                      <h3 className="text-xl font-bold text-slate-900">PHAN THANH DUY</h3>
                    </div>
                    <div className="flex justify-center px-6 py-6">
                      <img src="/qr.jpg" alt="QR Code thanh toán" className="w-56 h-56 object-contain" />
                    </div>
                    <div className="border-t border-slate-200 px-6 py-4 text-center space-y-1">
                      <p className="text-sm text-slate-700">Tài khoản: <span className="font-bold font-mono text-slate-900">100878022719</span></p>
                      <p className="text-xs text-slate-500">VietinBank – CN Bình Định – PGD Vũ Bảo</p>
                    </div>
                  </div>

                  <div className="w-full max-w-sm bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-indigo-800">
                      Nội dung gửi tiền: <span className="font-bold text-indigo-950">{user?.name || user?.email} thanh toán premium</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 text-center">Sử dụng app ngân hàng hoặc VNPay, MoMo để quét mã</p>

                  {/* Pending banner */}
                  {hasPendingPremium && (
                    <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock size={18} className="text-amber-600" />
                        <p className="font-semibold text-amber-800">Đang chờ admin xác nhận</p>
                      </div>
                      <p className="text-sm text-amber-700">Yêu cầu nâng cấp Premium đã được gửi.</p>
                    </div>
                  )}

                  {successMsg && (
                    <div className="w-full max-w-sm bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <CheckCircle size={20} className="text-green-500 mx-auto mb-1" />
                      <p className="text-green-800 font-medium text-sm">{successMsg}</p>
                    </div>
                  )}
                  {error && (
                    <div className="w-full max-w-sm bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}

                  {!hasPendingPremium && !successMsg && (
                    <button onClick={handleSubmit} disabled={submitLoading}
                      className="w-full max-w-sm bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-90 disabled:opacity-60 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg flex items-center justify-center gap-2">
                      {submitLoading
                        ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        : <Crown size={20} />}
                      {submitLoading ? 'Đang gửi...' : `Tôi đã chuyển khoản ${PREMIUM_PRICE.toLocaleString('vi-VN')} VND`}
                    </button>
                  )}

                  <p className="text-center text-xs text-slate-500 flex items-center gap-1">
                    <Lock size={12} /> Thanh toán an toàn và bảo mật
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Back button */}
        <div className="text-center mt-4 mb-8">
          <button onClick={() => navigate('/meetings')} className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
            ← Quay lại trang chủ
          </button>
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-5 flex items-center gap-3 text-white">
              <History size={22} />
              <h2 className="text-xl font-bold">Lịch sử thanh toán</h2>
            </div>
            <div className="p-6">
              {historyLoading ? (
                <div className="text-center py-6">
                  <div className="inline-block w-7 h-7 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => {
                    const isCustomPack = payment.package_type === 'custom_pack';
                    const packLabel = isCustomPack
                      ? `⚡ ${payment.sessions_requested ?? '?'} lượt`
                      : payment.package_type === 'premium'
                        ? '👑 Premium (1 tháng)'
                        : payment.package_type || '—';

                    const statusInfo = {
                      succeeded:        { label: '✓ Thành công',       cls: 'bg-green-100 text-green-700' },
                      pending_approval: { label: '⏳ Chờ duyệt Premium', cls: 'bg-amber-100 text-amber-700' },
                      pending_pack:     { label: '⏳ Chờ cộng lượt',    cls: 'bg-blue-100 text-blue-700' },
                      rejected:         { label: '✗ Từ chối',           cls: 'bg-red-100 text-red-700' },
                    }[payment.status] || { label: payment.status, cls: 'bg-slate-100 text-slate-600' };

                    return (
                      <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/20 transition-all flex-wrap gap-3">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${payment.status === 'succeeded' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                            {payment.status === 'succeeded' ? <CheckCircle size={22} /> : <Clock size={22} />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{packLabel}</p>
                            <p className="text-sm text-slate-600">{payment.amount.toLocaleString('vi-VN')} VND</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {new Date(payment.created_at).toLocaleDateString('vi-VN', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
