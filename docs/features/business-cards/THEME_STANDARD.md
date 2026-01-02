---
title: "명함 테마 표준 규격"
category: "features"
subcategory: "business-cards"
tier: 3
status: "active"
last_updated: "2026-01-02"
version: "1.1"
related_docs:
  - path: "docs/features/business-cards/README.md"
    description: "명함 관리 개요"
  - path: "docs/features/business-cards/themes.md"
    description: "테마 시스템"
tags:
  - business-cards
  - themes
  - standards
  - ui-ux
  - sns
---

# 명함 테마 표준 규격

## 개요
모든 명함 테마가 일관된 사용자 경험을 제공하기 위한 표준 규격입니다.

---

## 필수 영역 (Required Sections)

### 1. 프로필 헤더
| 항목 | 설명 | 필수 |
|------|------|:----:|
| 프로필 이미지 | 원형 또는 사각형, 최소 96x96px | ✅ |
| 이름 | 최대 1줄, truncate 처리 | ✅ |
| 직함 | 최대 1줄, truncate 처리 | ✅ |
| 회사명 | 조건부 표시, truncate 처리 | ⭕ |
| 부서명 | 조건부 표시 | ⭕ |

### 2. 소개
| 항목 | 설명 | 필수 |
|------|------|:----:|
| 자기소개 | 조건부 표시, 줄바꿈 허용 | ⭕ |

### 3. 연락처 정보
| 항목 | 설명 | 필수 |
|------|------|:----:|
| 전화번호 | tel: 링크, truncate 처리 | ✅ |
| 이메일 | mailto: 링크, truncate 처리 | ✅ |
| 웹사이트 | 외부 링크, 프로토콜 제거 표시 | ⭕ |

### 4. SNS 링크 (신규)
| 항목 | 아이콘 | 링크 형식 |
|------|--------|----------|
| LinkedIn | 🔗 또는 SVG | https://linkedin.com/in/{username} |
| Instagram | 📷 또는 SVG | https://instagram.com/{username} |
| Facebook | 📘 또는 SVG | https://facebook.com/{username} |
| Twitter/X | 🐦 또는 SVG | https://twitter.com/{username} |
| YouTube | ▶️ 또는 SVG | https://youtube.com/@{username} |
| GitHub | 💻 또는 SVG | https://github.com/{username} |

**표시 조건**: 하나 이상의 SNS가 입력된 경우에만 섹션 표시

### 5. 액션 버튼
| 항목 | 설명 | 필수 |
|------|------|:----:|
| 전화하기 | tel: 링크 호출 | ✅ |
| 문자하기 | sms: 링크 호출 | ⭕ |
| 연락처 저장 | vCard 다운로드 (.vcf) | ✅ |
| 공유하기 | Web Share API (지원 시) | ⭕ |

### 6. 제공 서비스
| 항목 | 설명 | 필수 |
|------|------|:----:|
| 서비스 목록 | 배열, 2열 그리드 또는 태그 형태 | ⭕ |
| 텍스트 제한 | line-clamp-2 적용 | ✅ |

### 7. 주소 & 지도
| 항목 | 설명 | 필수 |
|------|------|:----:|
| 주소 말풍선 | 📍 아이콘, 좌측 정렬, break-words | ⭕ |
| 상세주소 | 기본주소 뒤에 연결 표시 | ⭕ |
| 카카오 지도 | MapPreview 컴포넌트, 높이 200-250px | ⭕ |

### 8. 소개자료 (첨부파일)
| 항목 | 설명 | 필수 |
|------|------|:----:|
| 첨부파일 목록 | card_attachments 테이블 연동 | ⭕ |
| YouTube 인라인 | youtube_display_mode='inline' 시 카드 형태 | ⭕ |
| 미리보기 모달 | 이미지, 비디오, YouTube, PDF 지원 | ⭕ |
| 다운로드 버튼 | 파일 다운로드, 다운로드 추적 | ⭕ |

### 9. 푸터
| 항목 | 설명 | 필수 |
|------|------|:----:|
| G-PLAT 브랜딩 | 로고 + "Powered by G-PLAT" | ✅ |

---

## 선택 영역 (Optional Sections)

### 방문자 통계
- DefaultCard 전용
- 오늘/총 방문자 수 표시
- visitor_stats 테이블 연동

### 인증 배지
- ProfessionalCard 전용
- "인증된 비즈니스 프로필" 표시

### iOS 네비게이션
- AppleCard 전용
- 편집/공유 버튼 UI

---

## UI/UX 표준

### 텍스트 처리
```css
/* 전역 설정 */
body {
  word-break: keep-all;      /* 한글 단어 단위 줄바꿈 */
  overflow-wrap: break-word;
}

/* 한 줄 말줄임 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 여러 줄 말줄임 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 긴 URL/이메일 줄바꿈 */
.break-words {
  word-break: break-word;
}
```

### 주소 말풍선 스타일
```jsx
<div className="relative inline-block max-w-[85%]">
  <div className="bg-{theme-color} text-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-lg">
    <p className="text-sm leading-relaxed break-words text-left">
      📍 {address}{addressDetail ? ` ${addressDetail}` : ''}
    </p>
  </div>
</div>
```

### Flex 컨테이너 텍스트 처리
```jsx
<div className="flex items-center gap-3 min-w-0 flex-1">
  <span className="flex-shrink-0">아이콘</span>
  <span className="truncate">텍스트</span>
</div>
```

### 반응형 설계

#### 브레이크포인트 (Mobile-First)
| 브레이크포인트 | 크기 | 대상 기기 | 시장 점유율 |
|---------------|------|----------|------------|
| (기본) | 360px~ | 작은 안드로이드 | 10% |
| `sm:` | 375px~ | iPhone SE/12/13/14 | 40% (주요 타겟) |
| `md:` | 390px~ | iPhone Pro | 25% |
| `lg:` | 414px~ | iPhone Plus | 15% |
| `xl:` | 430px~ | iPhone 14 Pro Max | 5% |
| `2xl:` | 768px~ | 태블릿 | 5% |

#### 컨테이너 설정
- 최대 너비: `max-w-md` (448px)
- 좌우 패딩: `px-4 sm:px-6`
- 상하 패딩: `py-6 sm:py-8`
- 카드 둥근 모서리: 테마별 상이 (rounded-xl ~ rounded-3xl)

#### 반응형 폰트 크기
| 요소 | 클래스 | 360px | 375px+ |
|------|--------|-------|--------|
| 이름/제목 | `text-2xl sm:text-3xl` | 24px | 30px |
| 부제목/직함 | `text-lg sm:text-xl` | 18px | 20px |
| 섹션 제목 | `text-base sm:text-lg` | 16px | 18px |
| 본문 텍스트 | `text-sm sm:text-base` | 14px | 16px |
| 작은 텍스트 | `text-xs sm:text-sm` | 12px | 14px |
| 초소형 텍스트 | `text-[10px] sm:text-xs` | 10px | 12px |

**중요**: 최소 폰트 크기는 14px (`text-sm`) 이상 권장

#### 반응형 패딩/마진
| 요소 | 클래스 | 설명 |
|------|--------|------|
| 컨테이너 좌우 | `px-4 sm:px-6` | 16px → 24px |
| 컨테이너 상하 | `py-6 sm:py-8` | 24px → 32px |
| 카드 내부 | `p-4 sm:p-6` | 16px → 24px |
| 섹션 간격 | `mb-4 sm:mb-6` | 16px → 24px |
| 아이템 간격 | `gap-2 sm:gap-3` | 8px → 12px |

#### 터치 영역 표준 (Apple HIG)
| 요소 | 최소 크기 | 권장 클래스 |
|------|----------|------------|
| 액션 버튼 | 44x60px | `min-h-[60px]` |
| 연락처 링크 | 44px 높이 | `min-h-[44px]` |
| SNS 버튼 | 44px 높이 | `min-h-[44px] py-2 sm:py-2.5 px-3 sm:px-4` |
| 다운로드 버튼 | 44px 높이 | `min-h-[44px] py-2 sm:py-2.5 px-3 sm:px-4` |
| 저장 버튼 | 48px 높이 | `min-h-[48px] py-3 sm:py-4` |

#### 반응형 이미지/아이콘
| 요소 | 클래스 | 360px | 375px+ | 390px+ |
|------|--------|-------|--------|--------|
| 프로필 이미지 | `w-20 sm:w-24 md:w-28` | 80px | 96px | 112px |
| 아이콘 (대) | `text-xl sm:text-2xl` | 20px | 24px | - |
| 아이콘 (중) | `text-base sm:text-lg` | 16px | 18px | - |
| YouTube 플레이 | `w-16 sm:w-20 h-16 sm:h-20` | 64px | 80px | - |

#### 반응형 적용 예시
```jsx
{/* 컨테이너 */}
<div className="max-w-md mx-auto px-4 sm:px-6 py-6 sm:py-8">

  {/* 섹션 카드 */}
  <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">

    {/* 섹션 제목 */}
    <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">섹션 제목</h2>

    {/* 본문 */}
    <p className="text-sm sm:text-base">본문 내용</p>
  </div>

  {/* 액션 버튼 그리드 */}
  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
    <button className="flex flex-col items-center min-h-[60px] py-3 sm:py-4">
      <span className="text-xl sm:text-2xl">📞</span>
      <span className="text-xs sm:text-sm">전화</span>
    </button>
  </div>

  {/* SNS 버튼 */}
  <div className="flex flex-wrap gap-1.5 sm:gap-2">
    <a className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 min-h-[44px] text-xs sm:text-sm">
      SNS 링크
    </a>
  </div>
</div>
```

---

## 테마별 색상 팔레트

| 테마 | Primary | Secondary | Background |
|------|---------|-----------|------------|
| Default | purple-500 | pink-500 | purple-50/pink-50 그라데이션 |
| Apple | blue-500 | gray-500 | gray-50 |
| Professional | #1e3a5f (navy) | #c9a961 (gold) | gray-50 |
| Simple | blue-500 | purple-500 | white/gray-50 그라데이션 |
| Trendy | green-400 | cyan-400 | black |

---

## SNS 섹션 구현 가이드

### 아이콘 스타일
```jsx
const SNS_CONFIG = {
  linkedin: { icon: '🔗', label: 'LinkedIn', color: '#0A66C2' },
  instagram: { icon: '📷', label: 'Instagram', color: '#E4405F' },
  facebook: { icon: '📘', label: 'Facebook', color: '#1877F2' },
  twitter: { icon: '🐦', label: 'X (Twitter)', color: '#000000' },
  youtube: { icon: '▶️', label: 'YouTube', color: '#FF0000' },
  github: { icon: '💻', label: 'GitHub', color: '#181717' }
}
```

### 렌더링 조건
```jsx
const hasSocialLinks = cardData.linkedin || cardData.instagram ||
                       cardData.facebook || cardData.twitter ||
                       cardData.youtube || cardData.github

{hasSocialLinks && (
  <div className="sns-section">
    {/* SNS 링크 렌더링 */}
  </div>
)}
```

---

## 데이터 스키마

### CardData Interface
```typescript
interface CardData {
  // 기본 정보
  id?: string
  name: string
  title: string
  company: string
  department?: string

  // 연락처
  phone: string
  email: string
  website?: string

  // 위치
  address?: string
  address_detail?: string
  latitude?: number
  longitude?: number

  // SNS
  linkedin?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
  github?: string

  // 추가 정보
  introduction?: string
  services?: string[]
  skills?: string[]

  // 미디어
  profileImage?: string
  profile_image_url?: string
  company_logo_url?: string
}
```

---

## 관련 문서

### 📖 상위 문서
- [명함 관리 개요](./README.md)

### 🔗 연관 기능
- [테마 시스템](./themes.md)
- [프로필 이미지](./profile-images.md)
- [지도/주소](../maps/README.md)

### 🏗️ 인프라
- [Supabase Storage](../../infrastructure/supabase/README.md)

### 📚 외부 참고자료
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Kakao Maps API](https://apis.map.kakao.com/)

---

## 버전 이력
- v1.1 (2026-01-02): 반응형 설계 가이드라인 대폭 확장 (브레이크포인트, 폰트, 터치 영역 표준)
- v1.0 (2025-11-26): 초기 표준안 작성, SNS 섹션 추가
