import { DollarSign, CheckCircle } from 'lucide-react'

export function UserPaymentTab() {
  // TODO: Implement payment history fetching when payment system is ready
  // For now, show placeholder

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100">
      <div className="p-12 text-center">
        <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">결제 시스템 준비 중</h3>
        <p className="text-gray-500 mb-6">
          결제 내역 기능은 Phase 3에서 구현 예정입니다
        </p>

        {/* Mock Payment History UI */}
        <div className="max-w-2xl mx-auto mt-8 text-left">
          <h4 className="text-sm font-medium text-gray-700 mb-4">구현 예정 기능:</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>구독 결제 내역 조회</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>결제 수단 관리 (카드, 계좌이체)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>영수증 다운로드</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>환불 처리</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>구독 플랜 변경 이력</span>
            </div>
          </div>
        </div>

        {/* Mock Table Preview */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    결제일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    플랜
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    금액
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    영수증
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">2025-10-01</td>
                  <td className="px-4 py-3 text-gray-900">Premium (월간)</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">₩9,900</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      완료
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">
                      다운로드
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">2025-09-01</td>
                  <td className="px-4 py-3 text-gray-900">Premium (월간)</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">₩9,900</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      완료
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">
                      다운로드
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">2025-08-15</td>
                  <td className="px-4 py-3 text-gray-900">Free → Premium</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">₩9,900</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      완료
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-xs">
                      다운로드
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">
            * 위 데이터는 샘플입니다. 실제 결제 시스템 연동 후 실제 데이터가 표시됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
