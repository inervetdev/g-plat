/**
 * Supabase Email OTP 테스트 스크립트
 * 실제 이메일(dslee@inervet.com)로 OTP 발송 테스트
 */

import { createClient } from '@supabase/supabase-js'

// 프로덕션 Supabase 설정
const SUPABASE_URL = 'https://anwwjowwrxdygqyhhckr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFud3dqb3d3cnhkeWdxeWhoY2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjc2ODA4ODksImV4cCI6MjA0MzI1Njg4OX0.7x3uKMZJzP9vQGXPHJrYCW_VXkVJQFP8_6g_4pJTzh4'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 테스트 이메일
const TEST_EMAIL = 'dslee@inervet.com'
const TEST_PASSWORD = 'test1234!@#$'
const TEST_NAME = '이동석'

console.log('='.repeat(60))
console.log('📧 Supabase Email OTP 테스트 시작')
console.log('='.repeat(60))
console.log()

async function testSignupOTP() {
  console.log('1️⃣  회원가입 OTP 테스트')
  console.log(`   이메일: ${TEST_EMAIL}`)
  console.log(`   이름: ${TEST_NAME}`)
  console.log()

  try {
    console.log('   ⏳ OTP 발송 중...')

    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          name: TEST_NAME
        },
        emailRedirectTo: undefined  // OTP 방식 사용
      }
    })

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        console.log('   ⚠️  이미 등록된 이메일입니다.')
        console.log('   ℹ️  패스워드 찾기 OTP 테스트로 전환합니다.')
        console.log()
        return testPasswordResetOTP()
      }

      console.error('   ❌ 오류:', error.message)
      return false
    }

    console.log('   ✅ OTP 발송 성공!')
    console.log()
    console.log('   📨 다음 정보를 확인하세요:')
    console.log(`      - 이메일: ${TEST_EMAIL}`)
    console.log('      - 받은편지함 확인')
    console.log('      - 스팸함 확인')
    console.log('      - 제목: "지플랫 회원가입 인증 코드" (한글화 적용 시)')
    console.log('      - 본문: 6자리 OTP 코드 확인')
    console.log()

    if (data.user) {
      console.log('   ℹ️  사용자 정보:')
      console.log(`      - ID: ${data.user.id}`)
      console.log(`      - Email: ${data.user.email}`)
      console.log(`      - Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No (OTP 대기 중)'}`)
      console.log()
    }

    return true
  } catch (err) {
    console.error('   ❌ 예외 발생:', err.message)
    return false
  }
}

async function testPasswordResetOTP() {
  console.log('2️⃣  패스워드 찾기 OTP 테스트')
  console.log(`   이메일: ${TEST_EMAIL}`)
  console.log()

  try {
    console.log('   ⏳ OTP 발송 중...')

    const { data, error } = await supabase.auth.signInWithOtp({
      email: TEST_EMAIL,
      options: {
        shouldCreateUser: false  // 기존 사용자만
      }
    })

    if (error) {
      console.error('   ❌ 오류:', error.message)
      return false
    }

    console.log('   ✅ OTP 발송 성공!')
    console.log()
    console.log('   📨 다음 정보를 확인하세요:')
    console.log(`      - 이메일: ${TEST_EMAIL}`)
    console.log('      - 받은편지함 확인')
    console.log('      - 스팸함 확인')
    console.log('      - 제목: "지플랫 비밀번호 재설정 인증 코드" (한글화 적용 시)')
    console.log('      - 본문: 6자리 OTP 코드 확인')
    console.log()

    return true
  } catch (err) {
    console.error('   ❌ 예외 발생:', err.message)
    return false
  }
}

async function checkSupabaseConnection() {
  console.log('🔗 Supabase 연결 테스트')
  console.log(`   URL: ${SUPABASE_URL}`)
  console.log()

  try {
    // 간단한 쿼리로 연결 확인
    const { data, error } = await supabase.from('business_cards').select('count', { count: 'exact', head: true })

    if (error && error.message !== 'Could not find the public.business_cards relation in the schema cache') {
      console.error('   ❌ 연결 실패:', error.message)
      return false
    }

    console.log('   ✅ Supabase 프로덕션 연결 성공')
    console.log()
    return true
  } catch (err) {
    console.error('   ❌ 연결 예외:', err.message)
    return false
  }
}

// 메인 실행
async function main() {
  // 1. 연결 테스트
  const connected = await checkSupabaseConnection()
  if (!connected) {
    console.log('❌ Supabase 연결에 실패했습니다. 테스트를 중단합니다.')
    process.exit(1)
  }

  // 2. 회원가입 OTP 테스트
  const signupSuccess = await testSignupOTP()

  console.log()
  console.log('='.repeat(60))
  console.log('📊 테스트 결과')
  console.log('='.repeat(60))
  console.log()
  console.log(`✅ Supabase 연결: 성공`)
  console.log(`${signupSuccess ? '✅' : '❌'} OTP 발송: ${signupSuccess ? '성공' : '실패'}`)
  console.log()
  console.log('📝 다음 단계:')
  console.log(`   1. ${TEST_EMAIL} 메일함 확인`)
  console.log('   2. OTP 이메일 수신 확인 (받은편지함 + 스팸함)')
  console.log('   3. 이메일 템플릿 한글화 확인')
  console.log('   4. 6자리 OTP 코드 확인')
  console.log()
  console.log('🔗 Supabase Dashboard:')
  console.log('   https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr/auth/users')
  console.log()
}

main().catch(console.error)
