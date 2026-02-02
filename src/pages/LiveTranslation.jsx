
import { useState, useEffect, useRef } from 'react';


export default function LiveTranslation() {
  const [meetingId, setMeetingId] = useState('');
  const [meetingData, setMeetingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  

  const fetchMeetingData = async (isAutoPoll = false) => {
    if (!meetingId.trim()) {
      setError('Vui lòng nhập ID meeting');
      return;
    }

    if (!isAutoPoll) {
      setLoading(true);
    }
    setError('');
    
    try {
      const response = await fetch(`${backendUrl}/extension_script/${meetingId}`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, ngrok-skip-browser-warning'
        },
        mode: 'cors'
      })

      if (!response.ok) {
        throw new Error(`API failed: ${response.status}`)
      }

      const result = await response.json()
      // Normalize to the structure currently used by the UI
      // API response example provided by user already matches: { ok, meetId, count, last, items }
      setMeetingData(result)
    } catch (error) {
      console.error('API Error:', error);
      
      if (!isAutoPoll) {
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          if (status === 404) {
            setError('Không tìm thấy meeting với ID này');
          } else if (status >= 500) {
            setError('Lỗi server. Vui lòng thử lại sau');
          } else {
            setError(`Lỗi ${status}: ${error.response.data?.message || 'Có lỗi xảy ra'}`);
          }
        } else if (error.request) {
          // Network error
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng');
        } else {
          // Other error
          setError(error.message || 'Có lỗi xảy ra');
        }
        
        setMeetingData(null);
      }
    } finally {
      if (!isAutoPoll) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMeetingData();
  };

  const startPolling = () => {
    if (!meetingId.trim()) {
      setError('Vui lòng nhập ID meeting trước khi bắt đầu polling');
      return;
    }
    
    setIsPolling(true);
    // Fetch immediately
    fetchMeetingData(true);
    // Then set up interval
    intervalRef.current = setInterval(() => {
      fetchMeetingData(true);
    }, 3000);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Live Translation</h1>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            placeholder="Nhập ID meeting..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPolling}
          />
          <button
            type="submit"
            disabled={loading || isPolling}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang tải...' : 'Tải dữ liệu'}
          </button>
        </div>
      </form>

      {/* Polling controls */}
      <div className="mb-6 flex gap-4 items-center">
        {!isPolling ? (
          <button
            onClick={startPolling}
            disabled={!meetingId.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bắt đầu Live Polling (3s)
          </button>
        ) : (
          <button
            onClick={stopPolling}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Dừng Polling
          </button>
        )}
        
        {isPolling && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Đang cập nhật tự động...</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Meeting data display */}
      {meetingData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Thông tin Meeting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Meeting ID:</span>
                <span className="ml-2 text-gray-800">{meetingData.meetId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Thời gian:</span>
                <span className="ml-2 text-gray-800">
                  {new Date(meetingData.at).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcript</h3>
            <div className="space-y-4">
              {meetingData.items.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="font-medium text-blue-600 mb-1">{item.speaker}</div>
                  <div className="text-gray-700 leading-relaxed">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
