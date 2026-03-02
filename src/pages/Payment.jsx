import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Lock, TestTube, History, CheckCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

export default function Payment() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showMockButton, setShowMockButton] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Fetch payment history on mount
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user) return;
      
      setHistoryLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_URL}/api/payments/history`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data && response.data.payments) {
          setPaymentHistory(response.data.payments);
        }
      } catch (err) {
        console.error('Failed to fetch payment history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);

  const handleSubmitPayment = async () => {
    setMockLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/payments/submit-payment`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data) {
        setSuccess(true);
        await refreshProfile();
        
        // Refresh payment history
        const freshToken = localStorage.getItem('token');
        const historyResponse = await axios.get(
          `${API_URL}/api/payments/history`,
          {
            headers: {
              'Authorization': `Bearer ${freshToken}`
            }
          }
        );
        if (historyResponse.data && historyResponse.data.payments) {
          setPaymentHistory(historyResponse.data.payments);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Gửi yêu cầu thất bại');
    } finally {
      setMockLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate card number (basic)
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Số thẻ không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // TODO: Integrate with real Stripe payment
      // For now, show message that real payment is not implemented
      setError('Thanh toán thực chưa được tích hợp. Vui lòng sử dụng Mock Payment để test.');
      
      // Uncomment when Stripe is integrated:
      // const response = await axios.post(
      //   `${API_URL}/api/payments/create-payment-intent`,
      //   { amount: 99000 },
      //   { headers: { 'Authorization': `Bearer ${token}` } }
      // );
      // Handle Stripe payment flow...
      
    } catch (err) {
      setError(err.response?.data?.error || 'Thanh toán thất bại');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Nâng cấp lên Premium
          </h1>
          <p className="text-slate-600">
            Trải nghiệm không giới hạn với Note Pro Premium
          </p>
        </div>

        {/* User Status */}
        {user && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{user.name}</h3>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
              <div className="text-right">
                {user.isPremium ? (
                  <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-semibold">
                    ⭐ Premium
                  </span>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600">Lượt dùng thử còn lại</p>
                    <p className="text-3xl font-bold text-cyan-500">{user.trialCount}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">Premium Plan</h2>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold">49,000</span>
                <span className="text-2xl">VND</span>
              </div>
              <p className="mt-2 text-cyan-100">Thanh toán một lần, sử dụng trọn đời</p>
            </div>
          </div>

          <div className="p-8">
            {/* Features */}
            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Tính năng Premium
              </h3>
              
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">Sử dụng không giới hạn</p>
                  <p className="text-sm text-slate-600">Tạo và phân tích cuộc họp không giới hạn</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">Bot ghi âm tự động</p>
                  <p className="text-sm text-slate-600">Tham gia và ghi âm cuộc họp tự động</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">AI phân tích thông minh</p>
                  <p className="text-sm text-slate-600">Tóm tắt, highlights, todos tự động</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">Chat với transcript</p>
                  <p className="text-sm text-slate-600">Hỏi đáp thông minh về nội dung cuộc họp</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900">Hỗ trợ ưu tiên</p>
                  <p className="text-sm text-slate-600">Được hỗ trợ nhanh chóng khi cần</p>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            {user?.isPremium ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">
                  ✓ Bạn đã là thành viên Premium
                </p>
              </div>
            ) : (
              <div>
                {success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-4">
                    <p className="text-green-800 font-medium mb-2">
                      ✓ Yêu cầu đã được gửi thành công!
                    </p>
                    <p className="text-sm text-green-700">
                      Vui lòng chờ admin xác nhận thanh toán của bạn.
                    </p>
                  </div>
                ) : null}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center mb-4">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {/* Payment Form */}
                {/* <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Số thẻ
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 outline-none transition-all"
                        required
                      />
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tên chủ thẻ
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ngày hết hạn
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="123"
                          maxLength="3"
                          className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200/60 outline-none transition-all"
                          required
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : (
                      'Thanh toán 49,000 VND'
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Lock size={12} />
                    Thanh toán an toàn và bảo mật 
                  </p>
                </form> */}

                {/* Divider */}
                {/* <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">hoặc</span>
                  </div>
                </div> */}

                {/* Mock Payment Button - For Testing */}
                {/* <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <TestTube className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Chế độ Test - Mock Payment
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Sử dụng nút này để test chức năng thanh toán mà không cần thẻ thật
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleMockPayment}
                    disabled={mockLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {mockLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <TestTube size={18} />
                        Mock Payment - Test Nâng Cấp Premium
                      </>
                    )}
                  </button>
                </div> */}

                {/* QR Payment Section */}
                <div className="flex flex-col items-center gap-6">
                  {/* QR Card – bank-style minimal */}
                  <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 text-center">
                      <p className="text-xs tracking-widest uppercase text-slate-400 mb-1">Người nhận</p>
                      <h3 className="text-xl font-bold text-slate-900" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                        PHAN THANH DUY
                      </h3>
                    </div>

                    {/* QR Code – giữ nguyên, không chỉnh sửa */}
                    <div className="flex justify-center px-6 py-6">
                      <img
                        src="/qr.jpg"
                        alt="QR Code thanh toán Premium"
                        className="w-56 h-56 object-contain"
                      />
                    </div>

                    {/* Account Info */}
                    <div className="border-t border-slate-200 px-6 py-4 text-center space-y-1">
                      <p className="text-sm text-slate-700" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                        Tài khoản: <span className="font-bold font-mono text-slate-900 tracking-wide">100878022719</span>
                      </p>
                      <p className="text-xs text-slate-500" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                        VietinBank – CN Bình Định – PGD Vũ Bảo
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    Sử dụng app ngân hàng hoặc VNPay, MoMo để quét mã
                  </p>

                  {/* Payment Status Messages */}
                  {user?.paymentStatus === 'pending_approval' && (
                    <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock size={20} className="text-amber-600" />
                        <p className="font-semibold text-amber-800">Đang chờ admin xác nhận</p>
                      </div>
                      <p className="text-sm text-amber-700">
                        Yêu cầu thanh toán của bạn đã được gửi. Vui lòng chờ admin kiểm tra và phê duyệt.
                      </p>
                    </div>
                  )}

                  {user?.paymentStatus === 'rejected' && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                      <p className="font-semibold text-red-800 mb-1">❌ Yêu cầu thanh toán bị từ chối</p>
                      <p className="text-sm text-red-700">
                        Vui lòng kiểm tra lại thông tin chuyển khoản và thử lại.
                      </p>
                    </div>
                  )}

                  {/* Confirm button */}
                  {user?.paymentStatus !== 'pending_approval' && (
                    <button
                      type="button"
                      onClick={handleSubmitPayment}
                      disabled={mockLoading}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center gap-2"
                    >
                      {mockLoading ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Đang gửi yêu cầu...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} />
                          Tôi đã chuyển khoản xong
                        </>
                      )}
                    </button>
                  )}

                  <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                    <Lock size={12} />
                    Thanh toán an toàn và bảo mật
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/meetings')}
            className="text-slate-600 hover:text-slate-900 font-medium"
          >
            ← Quay lại trang chủ
          </button>
        </div>

        {/* Payment History */}
        {user && paymentHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mt-8">
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <History size={24} />
                <h2 className="text-2xl font-bold">Lịch sử thanh toán</h2>
              </div>
            </div>
            
            <div className="p-6">
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-slate-600">Đang tải...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          payment.status === 'succeeded' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {payment.status === 'succeeded' ? (
                            <CheckCircle size={24} />
                          ) : (
                            <CreditCard size={24} />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-semibold text-slate-900">
                            {payment.amount.toLocaleString('vi-VN')} {payment.currency.toUpperCase()}
                          </p>
                          <p className="text-sm text-slate-600">
                            {new Date(payment.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            ID: {payment.stripe_payment_intent_id}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          payment.status === 'succeeded'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'pending' || payment.status === 'pending_approval'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {payment.status === 'succeeded' ? '✓ Thành công' : 
                           (payment.status === 'pending' || payment.status === 'pending_approval') ? '⏳ Đang chờ duyệt' : 
                           '✗ Thất bại'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
