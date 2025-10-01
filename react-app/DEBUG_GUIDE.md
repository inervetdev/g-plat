# React 하얀 화면 문제 해결 가이드

## 🔍 주요 원인들

### 1. **JavaScript 에러로 인한 렌더링 중단**
- React는 컴포넌트에서 에러가 발생하면 전체 앱 렌더링을 중단합니다
- 브라우저 콘솔(F12)에서 빨간색 에러 메시지 확인 필수

### 2. **import 경로 문제**
- 파일이 없는 경로를 import하면 빌드는 되지만 런타임 에러 발생
- 특히 컴포넌트나 Context를 import할 때 자주 발생

### 3. **비동기 로딩 문제**
- Supabase 같은 외부 라이브러리 초기화 실패
- 환경변수(.env) 로드 실패
- Context Provider 초기화 중 에러

### 4. **라우팅 문제**
- React Router의 잘못된 설정
- 존재하지 않는 경로로 리다이렉트

## 🛠️ 디버깅 체크리스트

### 즉시 확인할 사항:
```bash
# 1. 브라우저 콘솔 확인
F12 → Console 탭 → 빨간색 에러 메시지 확인

# 2. 네트워크 탭 확인
F12 → Network 탭 → 실패한 요청이 있는지 확인

# 3. React Developer Tools
Chrome 확장프로그램 설치 → Components 탭에서 렌더링 트리 확인
```

### 코드 수정 시 안전한 접근법:

#### Step 1: 최소한의 동작하는 버전으로 시작
```tsx
// App.tsx - 가장 간단한 버전
function App() {
  return <div>Hello World</div>
}
export default App
```

#### Step 2: 단계적으로 기능 추가
```tsx
// 1단계: 스타일 추가
import './index.css'

// 2단계: 라우터 추가 (에러 처리 포함)
try {
  return <Router>...</Router>
} catch (error) {
  console.error('Router error:', error)
  return <div>라우터 에러</div>
}

// 3단계: Context 추가
// 4단계: 컴포넌트 추가
```

## 🔧 일반적인 해결 방법

### 1. Error Boundary 추가
```tsx
// src/components/ErrorBoundary.tsx
import React from 'react'

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>에러가 발생했습니다</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      )
    }

    return this.props.children
  }
}

// App.tsx에서 사용
<ErrorBoundary>
  <AuthProvider>
    <Router>...</Router>
  </AuthProvider>
</ErrorBoundary>
```

### 2. 로딩 상태 추가
```tsx
function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기화 작업
    setTimeout(() => setLoading(false), 1000)
  }, [])

  if (loading) {
    return <div>로딩 중...</div>
  }

  return <div>실제 앱 내용</div>
}
```

### 3. 환경변수 검증
```tsx
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경변수가 없습니다')
  // 에러를 throw하지 말고 로그만 남기기
}
```

## 📝 개발 팁

1. **항상 콘솔 먼저 확인**: 하얀 화면 = 99% JavaScript 에러
2. **작은 단위로 개발**: 한 번에 많은 코드 추가 X
3. **try-catch 활용**: 에러 발생 지점 파악
4. **console.log 활용**: 컴포넌트 렌더링 순서 추적
5. **개발자 도구 활용**: React DevTools, Redux DevTools 등

## 🚨 자주 발생하는 실수

1. **import 경로 오타**
   ```tsx
   // ❌ 잘못된 예
   import { AuthContext } from './context/AuthContext'

   // ✅ 올바른 예
   import { AuthContext } from './contexts/AuthContext'
   ```

2. **비동기 함수 처리**
   ```tsx
   // ❌ 잘못된 예
   const data = await fetchData() // 컴포넌트 본문에서 직접 await

   // ✅ 올바른 예
   useEffect(() => {
     fetchData().then(setData)
   }, [])
   ```

3. **조건부 렌더링 실수**
   ```tsx
   // ❌ 잘못된 예
   return user && <Dashboard /> // user가 false면 아무것도 안 보임

   // ✅ 올바른 예
   return user ? <Dashboard /> : <Login />
   ```

## 💡 즉시 해결 방법

현재 하얀 화면이 보인다면:

1. **브라우저 강제 새로고침**: Ctrl + F5
2. **캐시 삭제**: 개발자도구 → Application → Clear Storage
3. **서버 재시작**: 터미널에서 Ctrl+C 후 `npm run dev`
4. **node_modules 재설치**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

이 가이드를 참고하여 문제를 체계적으로 해결하세요!