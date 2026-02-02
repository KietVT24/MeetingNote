export default function Price(){
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-cyan-200/60 bg-white p-6">
          <h1 className="text-2xl font-semibold text-cyan-900 mb-2">Nâng cấp gói sử dụng</h1>
          <p className="text-cyan-800/80 mb-6">Bạn đã sử dụng Live Transcript Meeting vượt quá 60 phút. Hãy nâng cấp để tiếp tục trải nghiệm không giới hạn.</p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-cyan-100 p-4">
              <div className="text-sm font-semibold text-cyan-900 mb-1">Basic</div>
              <div className="text-2xl font-bold text-cyan-900 mb-2">$0</div>
              <ul className="text-sm text-cyan-800/80 space-y-1">
                <li>• 60 phút Live Transcript/tháng</li>
                <li>• Tóm tắt, highlights cơ bản</li>
              </ul>
            </div>

            <div className="rounded-xl border border-cyan-100 p-4 bg-cyan-50">
              <div className="text-sm font-semibold text-cyan-900 mb-1">Pro</div>
              <div className="text-2xl font-bold text-cyan-900 mb-2">$9</div>
              <ul className="text-sm text-cyan-800/80 space-y-1 mb-3">
                <li>• Không giới hạn Live Transcript</li>
                <li>• Dashboard người tham gia</li>
                <li>• Xuất DOCX/PDF</li>
              </ul>
              <button className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white py-2">Nâng cấp ngay</button>
            </div>

            <div className="rounded-xl border border-cyan-100 p-4">
              <div className="text-sm font-semibold text-cyan-900 mb-1">Business</div>
              <div className="text-2xl font-bold text-cyan-900 mb-2">Liên hệ</div>
              <ul className="text-sm text-cyan-800/80 space-y-1">
                <li>• SSO, SLA</li>
                <li>• Tích hợp API</li>
                <li>• Hỗ trợ ưu tiên</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


