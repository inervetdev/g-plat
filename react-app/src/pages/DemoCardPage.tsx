import { TrendyCard } from '../components/themes/TrendyCard'
import { AppleCard } from '../components/themes/AppleCard'
import { ProfessionalCard } from '../components/themes/ProfessionalCard'
import { SimpleCard } from '../components/themes/SimpleCard'
import { DefaultCard } from '../components/themes/DefaultCard'
import { useState } from 'react'

// Demo user ID for testing
const DEMO_USER_ID = 'demo-user-test'

export default function DemoCardPage() {
  const [selectedTheme, setSelectedTheme] = useState<string>('trendy')

  // Theme selector
  const themes = [
    { id: 'trendy', name: '트렌디', component: TrendyCard },
    { id: 'apple', name: '애플', component: AppleCard },
    { id: 'professional', name: '프로페셔널', component: ProfessionalCard },
    { id: 'simple', name: '심플', component: SimpleCard },
    { id: 'default', name: '기본', component: DefaultCard }
  ]

  const CurrentTheme = themes.find(t => t.id === selectedTheme)?.component || TrendyCard

  return (
    <div className="min-h-screen">
      {/* Theme Selector Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg p-4">
        <div className="max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">테마 선택:</h3>
          <div className="flex gap-2">
            {themes.map(theme => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTheme === theme.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card Display with padding for selector bar */}
      <div className="pt-20">
        <CurrentTheme userId={DEMO_USER_ID} />
      </div>
    </div>
  )
}