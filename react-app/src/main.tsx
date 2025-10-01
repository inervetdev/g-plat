import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// 개발 모드에서 디버깅 정보 출력
if (import.meta.env.DEV) {
  console.log('🚀 React App Starting...')
  console.log('📍 Environment:', import.meta.env.MODE)
  console.log('🔗 Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Loaded' : '❌ Missing')
}

const root = document.getElementById('root')
if (!root) {
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Root element not found!</div>'
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}
