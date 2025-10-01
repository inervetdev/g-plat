function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>

        <div className="prose prose-gray max-w-none">
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-gray-700">
            <p className="font-semibold">
              G-Plat(이하 "회사")은 이용자의 개인정보를 중요시하며, 개인정보보호법을 준수하고 있습니다.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. 개인정보의 수집 및 이용목적</h2>
            <p className="text-gray-700 leading-relaxed mb-4">회사는 다음의 목적으로 개인정보를 수집 및 이용합니다:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>서비스 제공</strong>: 모바일 명함 제작, 관리, 공유 서비스 제공</li>
              <li><strong>회원관리</strong>: 회원제 서비스 이용에 따른 본인 확인, 개인식별</li>
              <li><strong>마케팅</strong>: 신규 서비스 개발 및 맞춤 서비스 제공, 이벤트 정보 안내</li>
              <li><strong>고객지원</strong>: 고객 상담, 민원 처리, 공지사항 전달</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. 수집하는 개인정보 항목</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">구분</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">필수 항목</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">선택 항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">회원가입</td>
                    <td className="border border-gray-200 px-4 py-2">이메일, 비밀번호, 이름</td>
                    <td className="border border-gray-200 px-4 py-2">전화번호, 회사명, 직책</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">명함 생성</td>
                    <td className="border border-gray-200 px-4 py-2">-</td>
                    <td className="border border-gray-200 px-4 py-2">주소, SNS 정보, 프로필 사진</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">결제</td>
                    <td className="border border-gray-200 px-4 py-2">결제 정보</td>
                    <td className="border border-gray-200 px-4 py-2">-</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">자동 수집</td>
                    <td className="border border-gray-200 px-4 py-2">IP 주소, 접속 기록</td>
                    <td className="border border-gray-200 px-4 py-2">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. 개인정보의 보유 및 이용기간</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>회원 정보</strong>: 회원 탈퇴 시까지</li>
              <li><strong>결제 정보</strong>: 전자상거래법에 따라 5년</li>
              <li><strong>접속 기록</strong>: 통신비밀보호법에 따라 3개월</li>
              <li><strong>고객 상담 기록</strong>: 소비자보호법에 따라 3년</li>
            </ul>
            <p className="text-gray-700 mt-4 text-sm">
              ※ 단, 관련 법령에 의하여 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의하거나 수사기관의 요구가 있는 경우</li>
              <li>콜백 SMS 서비스 제공을 위한 통신사 연동 (전화번호만 제공)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. 개인정보의 파기</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>파기 절차</strong>: 파기 사유 발생 → 개인정보보호 담당자 확인 → 파기</li>
              <li><strong>파기 방법</strong>: 전자적 파일은 복구 불가능한 방법으로 삭제, 종이 문서는 분쇄 또는 소각</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. 이용자의 권리와 행사방법</h2>
            <p className="text-gray-700 leading-relaxed mb-4">이용자는 다음의 권리를 행사할 수 있습니다:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>개인정보 열람 요구</li>
              <li>오류 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="text-gray-700 mt-4">
              권리 행사는 회사에 서면, 이메일로 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. 개인정보 보호를 위한 기술적 조치</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>암호화</strong>: 비밀번호는 단방향 암호화되어 저장 및 관리</li>
              <li><strong>SSL 인증서</strong>: 데이터 전송 시 SSL/TLS 암호화 통신</li>
              <li><strong>접근 제한</strong>: 개인정보 처리 직원 최소화 및 교육 실시</li>
              <li><strong>보안 프로그램</strong>: 정기적인 보안 업데이트 및 점검</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. 쿠키(Cookie)의 운영</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 쿠키를 사용합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>쿠키란?</strong> 웹사이트 방문 시 브라우저에 저장되는 작은 텍스트 파일</li>
              <li><strong>사용 목적</strong>: 로그인 유지, 이용 패턴 분석, 맞춤 서비스 제공</li>
              <li><strong>거부 방법</strong>: 브라우저 설정에서 쿠키 저장을 거부할 수 있음</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. 개인정보보호 책임자</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 font-semibold mb-2">개인정보보호 책임자</p>
              <ul className="space-y-1 text-gray-700">
                <li>성명: 홍길동</li>
                <li>직책: 개인정보보호팀장</li>
                <li>이메일: privacy@gplat.co.kr</li>
                <li>전화: 02-1234-5678</li>
              </ul>
            </div>
            <p className="text-gray-700 mt-4 text-sm">
              기타 개인정보침해에 대한 신고나 상담이 필요하신 경우 아래 기관에 문의하시기 바랍니다:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600 mt-2">
              <li>개인정보침해신고센터 (kisa.or.kr / 118)</li>
              <li>개인정보보호위원회 (pipc.kisa.or.kr / 1833-6972)</li>
              <li>대검찰청 사이버수사과 (spo.go.kr / 1301)</li>
              <li>경찰청 사이버수사국 (ecrm.cyber.go.kr / 182)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. 개정 이력</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 px-4 py-2 text-left">버전</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">시행일</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">주요 변경사항</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 px-4 py-2">v1.0</td>
                    <td className="border border-gray-200 px-4 py-2">2024.01.01</td>
                    <td className="border border-gray-200 px-4 py-2">최초 제정</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 text-sm text-gray-600">
            <p>공고일: 2024년 1월 1일</p>
            <p>시행일: 2024년 1월 1일</p>
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

export default PrivacyPage