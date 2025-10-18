# G-PLAT Admin Web Service

관리자 전용 웹 서비스 - Clean Light Theme 기반

## 🚀 시작하기

### 개발 서버 실행
```bash
npm run dev
```

브라우저에서 http://localhost:5173 자동 오픈

### 빌드
```bash
npm run build
```

### 프리뷰
```bash
npm run preview
```

## 📦 설치된 패키지

### Core
- React 19.1.1 (React Compiler 1.0 포함)
- TypeScript 5.8
- Vite 7

### UI
- Tailwind CSS 3.4
- Lucide React (아이콘)
- clsx, tailwind-merge (유틸리티)

### 라우팅 & 상태 관리
- React Router DOM 7.9
- Zustand 5.0
- TanStack React Query 5.0

### 폼 & 테이블
- React Hook Form 7.0
- Zod 3.0
- TanStack React Table 8.0

### 차트 & 날짜
- Recharts 3.2
- date-fns 3.0

### Backend
- Supabase JS 2.58

## 📁 프로젝트 구조

```
admin-app/
├── src/
│   ├── components/      # 재사용 컴포넌트
│   │   ├── ui/         # 기본 UI 컴포넌트
│   │   ├── layout/     # Header, Sidebar, Layout
│   │   ├── dashboard/  # 대시보드 컴포넌트
│   │   ├── users/      # 사용자 관리 컴포넌트
│   │   └── cards/      # 명함 관리 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── auth/       # 로그인 등
│   │   ├── dashboard/  # 대시보드
│   │   ├── users/      # 사용자 관리
│   │   ├── cards/      # 명함 관리
│   │   ├── qr/         # QR 코드
│   │   ├── reports/    # 신고 관리
│   │   └── settings/   # 설정
│   ├── lib/            # 유틸리티
│   │   ├── supabase.ts
│   │   ├── react-query.ts
│   │   └── utils.ts
│   ├── hooks/          # Custom Hooks
│   ├── types/          # TypeScript 타입
│   └── stores/         # Zustand 스토어
├── .env.local          # 환경 변수 (Git 제외)
├── .env.example        # 환경 변수 예시
├── tailwind.config.js  # Tailwind 설정 (Design 2)
├── vite.config.ts      # Vite 설정
└── tsconfig.app.json   # TypeScript 설정
```

## 🎨 디자인 시스템 (Design 2 - Clean Light Theme)

### 색상
- **Primary Blue**: `#3B82F6` (버튼, 링크, Active)
- **Secondary Purple**: `#8B5CF6` (악센트)
- **Background**: `#F9FAFB` (Gray-50)
- **Card**: `#FFFFFF` (White)
- **Border**: `#E5E7EB` (Gray-200)

### Path Aliases
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@pages/*` → `./src/pages/*`
- `@lib/*` → `./src/lib/*`

## 🔐 환경 변수

`.env.local` 파일 생성:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 📚 참고 문서
- [ADMIN_SERVICE_SPECIFICATION.md](../ADMIN_SERVICE_SPECIFICATION.md) - 상세 기획
- [ADMIN_DEVELOPMENT_ROADMAP.md](../ADMIN_DEVELOPMENT_ROADMAP.md) - 개발 로드맵
- [admin-design-2-clean-light.html](../admin-design-2-clean-light.html) - 디자인 프로토타입

## 🛠️ 개발 가이드

### React Compiler 활성화
이 프로젝트는 React Compiler 1.0을 사용합니다. 자동 메모이제이션이 적용되어 `useMemo`, `useCallback` 없이도 최적화됩니다.

### Code Style
- ESLint 규칙 준수
- Prettier 포맷팅
- TypeScript strict 모드
