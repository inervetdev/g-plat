function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관은 G-Plat(이하 "회사")이 제공하는 모바일 명함 서비스(이하 "서비스")의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제2조 (용어의 정의)</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>서비스</strong>: 회사가 제공하는 모바일 명함 제작, 공유 및 관리 서비스</li>
              <li><strong>회원</strong>: 서비스에 가입하여 이용계약을 체결한 자</li>
              <li><strong>모바일 명함</strong>: 디지털 형태의 전자 명함</li>
              <li><strong>콜백 서비스</strong>: 통화 후 자동으로 명함 링크를 전송하는 서비스</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제3조 (서비스의 제공)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">회사는 다음과 같은 서비스를 제공합니다:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>모바일 명함 제작 및 관리</li>
              <li>한국형 도메인(.한국) 제공</li>
              <li>방문자 통계 및 분석</li>
              <li>사이드 비즈니스 카드 관리</li>
              <li>콜백 SMS 자동 발송</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제4조 (회원가입)</h2>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700">
              <li>회원가입은 이용자가 본 약관에 동의하고 회원정보를 입력한 후 회사가 승인함으로써 완료됩니다.</li>
              <li>회원은 가입 시 정확한 정보를 제공해야 하며, 변경사항이 있을 경우 즉시 수정해야 합니다.</li>
              <li>만 14세 미만의 아동은 회원가입을 할 수 없습니다.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제5조 (요금정책)</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">플랜</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">월 요금</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">주요 기능</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">무료</td>
                    <td className="border border-gray-200 px-4 py-2">0원</td>
                    <td className="border border-gray-200 px-4 py-2">기본 명함 1개</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">프리미엄</td>
                    <td className="border border-gray-200 px-4 py-2">9,900원</td>
                    <td className="border border-gray-200 px-4 py-2">명함 3개, 방문자 분석</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">비즈니스</td>
                    <td className="border border-gray-200 px-4 py-2">29,900원</td>
                    <td className="border border-gray-200 px-4 py-2">무제한 명함, 콜백 서비스</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제6조 (서비스 이용제한)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">다음의 경우 서비스 이용이 제한될 수 있습니다:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>타인의 정보를 도용한 경우</li>
              <li>서비스를 악용하여 스팸을 발송한 경우</li>
              <li>법령 또는 공서양속에 반하는 내용을 게시한 경우</li>
              <li>서비스의 정상적인 운영을 방해한 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제7조 (개인정보보호)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 회원의 개인정보를 보호하기 위하여 개인정보보호법 등 관련 법령을 준수하며,
              자세한 사항은 개인정보처리방침에 따릅니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제8조 (면책사항)</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>천재지변 또는 이에 준하는 불가항력으로 인한 서비스 제공 불가</li>
              <li>회원의 귀책사유로 인한 서비스 이용 장애</li>
              <li>회원이 게시한 정보의 정확성, 신뢰성에 대한 책임</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제9조 (약관의 변경)</h2>
            <p className="text-gray-700 leading-relaxed">
              회사는 필요시 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해
              공지한 후 7일이 경과한 날부터 효력이 발생합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">제10조 (분쟁해결)</h2>
            <p className="text-gray-700 leading-relaxed">
              본 약관과 관련하여 발생한 분쟁은 대한민국 법령에 따르며,
              관할 법원은 서울중앙지방법원으로 합니다.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-600">
            <p>시행일: 2024년 1월 1일</p>
            <p>최종 수정일: 2024년 1월 1일</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default TermsPage