import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { test, status, message, time: new Date().toLocaleTimeString() }])
  }

  const runTests = async () => {
    setLoading(true)
    setTestResults([])

    // 1. 인증 상태 확인
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        addResult('인증 상태', 'success', `로그인됨: ${user.email} (ID: ${user.id})`)
      } else {
        addResult('인증 상태', 'error', `로그인 안됨: ${error?.message || '사용자 없음'}`)
      }
    } catch (e: any) {
      addResult('인증 상태', 'error', `에러: ${e.message}`)
    }

    // 2. business_cards 테이블 읽기 권한 확인
    try {
      const { data, error } = await supabase
        .from('business_cards')
        .select('id, name, created_at')
        .limit(1)

      if (error) {
        addResult('명함 읽기', 'error', `에러: ${error.message}`)
      } else {
        addResult('명함 읽기', 'success', `성공: ${data?.length || 0}개 명함 조회됨`)
      }
    } catch (e: any) {
      addResult('명함 읽기', 'error', `예외: ${e.message}`)
    }

    // 3. 테스트 명함 생성 시도
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        addResult('명함 생성', 'error', '로그인 필요')
      } else {
        const testData = {
          user_id: user.id,
          name: '테스트 명함',
          title: '테스트 직책',
          company: '테스트 회사',
          theme: 'trendy',
          custom_url: `test-${Date.now()}`,
          is_active: true,
          is_primary: false
        }

        const { data, error } = await supabase
          .from('business_cards')
          .insert(testData)
          .select()
          .single()

        if (error) {
          addResult('명함 생성', 'error', `실패: ${error.message}`)
          console.error('Insert error details:', error)
        } else {
          addResult('명함 생성', 'success', `성공: ID ${data.id} 생성됨`)

          // 생성된 명함 삭제 (테스트 데이터 정리)
          const { error: deleteError } = await supabase
            .from('business_cards')
            .delete()
            .eq('id', data.id)

          if (deleteError) {
            addResult('테스트 정리', 'error', `삭제 실패: ${deleteError.message}`)
          } else {
            addResult('테스트 정리', 'success', '테스트 명함 삭제됨')
          }
        }
      }
    } catch (e: any) {
      addResult('명함 생성', 'error', `예외: ${e.message}`)
    }

    // 4. RLS 정책 확인 (간접적)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 자신의 명함 조회
        const { data: myCards, error: myError } = await supabase
          .from('business_cards')
          .select('id, name')
          .eq('user_id', user.id)

        if (myError) {
          addResult('내 명함 조회', 'error', `실패: ${myError.message}`)
        } else {
          addResult('내 명함 조회', 'success', `${myCards?.length || 0}개 명함 보유`)
        }

        // 활성화된 공개 명함 조회
        const { data: publicCards, error: publicError } = await supabase
          .from('business_cards')
          .select('id, name, custom_url')
          .eq('is_active', true)

        if (publicError) {
          addResult('공개 명함 조회', 'error', `실패: ${publicError.message}`)
        } else {
          addResult('공개 명함 조회', 'success', `${publicCards?.length || 0}개 활성 명함`)
        }
      }
    } catch (e: any) {
      addResult('RLS 테스트', 'error', `예외: ${e.message}`)
    }

    setLoading(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">🧪 Supabase 연결 테스트</h1>

          <button
            onClick={runTests}
            disabled={loading}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '테스트 중...' : '테스트 다시 실행'}
          </button>

          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">
                    {result.status === 'success' ? '✅' : '❌'} {result.test}
                  </span>
                  <span className="text-sm text-gray-500">{result.time}</span>
                </div>
                <div className="text-sm text-gray-700">{result.message}</div>
              </div>
            ))}
          </div>

          {testResults.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-8">
              테스트 결과가 여기에 표시됩니다
            </div>
          )}
        </div>
      </div>
    </div>
  )
}