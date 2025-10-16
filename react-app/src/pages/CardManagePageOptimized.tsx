import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface BusinessCard {
  id: string
  name: string
  title: string
  company: string
  phone: string
  email: string
  custom_url: string | null
  is_primary: boolean
  theme: string
  view_count: number
  created_at: string
}

// Extracted Components
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}

function PageHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 대시보드
          </button>
          <h1 className="text-2xl font-bold text-gray-900">명함 관리 (React Compiler 최적화)</h1>
        </div>
      </div>
    </header>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="text-6xl mb-4">🏷️</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 명함이 없습니다</h3>
      <p className="text-gray-600 mb-6">첫 번째 명함을 만들어보세요!</p>
      <button
        onClick={() => window.location.href = '/create-card'}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        명함 만들기
      </button>
    </div>
  )
}

function CardBadges({ card }: { card: BusinessCard }) {
  const getThemeInfo = (theme: string) => {
    switch (theme) {
      case 'trendy':
        return { label: '트렌디', className: 'bg-cyan-100 text-cyan-600' }
      case 'apple':
        return { label: '애플', className: 'bg-gray-100 text-gray-600' }
      case 'professional':
        return { label: '프로페셔널', className: 'bg-blue-100 text-blue-600' }
      case 'simple':
        return { label: '심플', className: 'bg-purple-100 text-purple-600' }
      default:
        return { label: '기본', className: 'bg-pink-100 text-pink-600' }
    }
  }

  const themeInfo = getThemeInfo(card.theme)

  return (
    <div className="flex flex-col items-end gap-1">
      {card.is_primary && (
        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">대표</span>
      )}
      <span className={`text-xs px-2 py-1 rounded ${themeInfo.className}`}>
        {themeInfo.label}
      </span>
    </div>
  )
}

function CardContactInfo({ card }: { card: BusinessCard }) {
  return (
    <div className="text-sm text-gray-600 mb-3 space-y-1">
      <p className="flex items-center gap-2">
        <span>📞</span>
        <span>{card.phone}</span>
      </p>
      <p className="flex items-center gap-2">
        <span>✉️</span>
        <span className="truncate">{card.email}</span>
      </p>
      {card.custom_url && (
        <p className="flex items-center gap-2">
          <span>🔗</span>
          <span className="text-blue-600 truncate">{card.custom_url}</span>
        </p>
      )}
    </div>
  )
}

function CardActions({ cardId }: { cardId: string }) {
  return (
    <>
      <div className="flex gap-2">
        <a
          href={`/card/${cardId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-50 text-blue-600 text-center py-2 rounded hover:bg-blue-100 transition text-sm font-medium"
        >
          보기
        </a>
        <button
          onClick={() => window.location.href = `/qr/${cardId}`}
          className="flex-1 bg-purple-50 text-purple-600 text-center py-2 rounded hover:bg-purple-100 transition text-sm font-medium"
        >
          QR
        </button>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => window.location.href = `/edit-card/${cardId}`}
          className="flex-1 bg-green-50 text-green-600 text-center py-2 rounded hover:bg-green-100 transition text-sm font-medium"
        >
          수정
        </button>
      </div>
    </>
  )
}

function CardStats({ card }: { card: BusinessCard }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>조회수: {card.view_count || 0}</span>
        <span>{new Date(card.created_at).toLocaleDateString('ko-KR')}</span>
      </div>
    </div>
  )
}

function BusinessCardItem({ card, onDelete }: { card: BusinessCard; onDelete: (id: string) => void }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{card.name}</h4>
          <p className="text-sm text-gray-600">{card.title}</p>
          <p className="text-xs text-gray-500">{card.company}</p>
        </div>
        <CardBadges card={card} />
      </div>

      <CardContactInfo card={card} />

      <div className="border-t border-gray-100 pt-3 mt-3">
        <CardActions cardId={card.id} />
        <button
          onClick={() => onDelete(card.id)}
          className="w-full mt-2 bg-red-50 text-red-600 text-center py-2 rounded hover:bg-red-100 transition text-sm font-medium"
        >
          삭제
        </button>
      </div>

      <CardStats card={card} />
    </div>
  )
}

function NewCardButton() {
  return (
    <button
      onClick={() => window.location.href = '/create-card'}
      className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all group"
    >
      <div className="flex flex-col items-center justify-center h-full min-h-[280px]">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
          새 명함 만들기
        </h4>
        <p className="text-sm text-gray-500 mt-2 text-center">
          클릭하여 새로운 명함을 생성하세요
        </p>
      </div>
    </button>
  )
}

function CardManagePageOptimized() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        const { data: cards } = await supabase
          .from('business_cards')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (cards) {
          setBusinessCards(cards)
        }
      } else {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (cardId: string) => {
    if (confirm('정말 이 명함을 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('business_cards')
        .delete()
        .eq('id', cardId)
        .eq('user_id', user?.id)

      if (!error) {
        alert('명함이 삭제되었습니다')
        checkUser()
      } else {
        alert('명함 삭제에 실패했습니다')
      }
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {businessCards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                내 명함 목록 ({businessCards.length}개)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessCards.map(card => (
                <BusinessCardItem
                  key={card.id}
                  card={card}
                  onDelete={handleDelete}
                />
              ))}

              <NewCardButton />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CardManagePageOptimized
