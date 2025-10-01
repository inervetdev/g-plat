import Link from 'next/link'
import SupabaseTest from '@/components/SupabaseTest'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              🎯 지플랫
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              모바일 명함으로 시작하는 부업 플랫폼
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <FeatureCard
              icon="📱"
              title="모바일 명함"
              description="3분 만에 완성되는 나만의 디지털 명함"
            />
            <FeatureCard
              icon="💼"
              title="부업 관리"
              description="여러 부업을 하나의 플랫폼에서 통합 관리"
            />
            <FeatureCard
              icon="📊"
              title="실시간 통계"
              description="방문자 분석과 전환율 추적"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:bg-white/90 transition-all transform hover:-translate-y-1 hover:shadow-xl text-center"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white/20 text-white rounded-full font-semibold text-lg hover:bg-white/30 transition-all transform hover:-translate-y-1 hover:shadow-xl text-center border border-white/30"
            >
              로그인
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              이미 50,000명이 지플랫과 함께하고 있습니다
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex gap-6 text-white/60">
            <Link href="/about" className="hover:text-white transition">
              소개
            </Link>
            <Link href="/pricing" className="hover:text-white transition">
              요금제
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              문의하기
            </Link>
          </div>
        </div>

        {/* Supabase 연결 테스트 */}
        <div className="mt-8">
          <SupabaseTest />
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </div>
  )
}