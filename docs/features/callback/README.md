# G-Plat 콜백 시스템 기획서

## 1. 개요

### 1.1 콜백 시스템이란?
사장님(명함 소유자)과 고객 간 통화 종료 후, 고객에게 자동으로 SMS를 발송하여 명함/상품 정보를 홍보하는 시스템

### 1.2 비즈니스 시나리오
```
[고객] 모바일 명함 방문 → 부업카드(사과) 클릭 → 📞 사장님에게 전화
                                                      ↓
                                            [사장님] 주문 상담
                                                      ↓
                                            통화 종료
                                                      ↓
                                            [고객] 콜백 SMS 수신
                                            "안녕하세요, OO과일입니다!
                                             상품 정보: https://g-plat.com/card/xxx"
```

### 1.3 전략적 가치
- **차별화 포인트**: 경쟁사(리멤버, 아정당) 대비 유일한 자동화 마케팅 도구
- **수익 모델**: 유료 전환 유도 (무료는 제한, 유료는 무제한)
- **데이터 자산**: 콜백을 통한 방문자 추적으로 마케팅 효과 측정

---

## 2. 플랫폼별 기술 분석

### 2.1 웹 (현재 서비스)

| 기능 | 가능 여부 | 이유 |
|------|----------|------|
| 통화 종료 감지 | ❌ 불가 | 브라우저 보안 정책 |
| SMS 자동 발송 | ❌ 불가 | 네이티브 기능 접근 불가 |
| **대안** | 수동 버튼 | "콜백 보내기" 버튼 클릭 |

### 2.2 Android 네이티브/하이브리드

| 기능 | 가능 여부 | 방법 |
|------|----------|------|
| 통화 종료 감지 | ✅ 가능 | TelephonyManager, PhoneStateListener |
| 발신 번호 확인 | ✅ 가능 | 앱에서 전화 걸 때 저장 |
| **수신 번호 확인** | ✅ **가능** | READ_CALL_LOG 권한 |
| SMS 발송 | ✅ 가능 | 서버 API (Aligo/Twilio) |
| 사용자 확인 | 선택적 | 자동 또는 팝업 |

**필요 권한**:
- `READ_PHONE_STATE` - 통화 상태 감지
- `READ_CALL_LOG` - 수신 전화 번호 확인

### 2.3 iOS 네이티브/하이브리드

| 기능 | 가능 여부 | 방법 |
|------|----------|------|
| 통화 종료 감지 | ✅ 가능 | CXCallObserver |
| 발신 번호 확인 | ✅ 가능 | 앱에서 전화 걸 때 저장 |
| **수신 번호 확인** | ❌ **불가** | Apple 보안 정책 |
| SMS 자동 발송 | ❌ 불가 | Apple 보안 정책 |
| SMS 서버 발송 | ✅ 가능 | 서버 API (팝업 확인 필요) |

**iOS 제한사항**:
- 수신 전화의 발신자 번호를 앱에서 확인 불가
- SMS 자동 발송 불가 (MFMessageComposeViewController는 사용자 확인 필수)

---

## 3. 사용 시나리오별 구현 방안

### 3.1 시나리오 A: 사장님이 고객에게 전화 (발신)

```
[사장님 앱] 고객 연락처에서 전화 버튼 클릭
    ↓
번호 저장 (010-1234-5678)
    ↓
tel: URL로 기본 전화 앱 실행
    ↓
통화 → 종료
    ↓
[팝업] "010-1234-5678에게 콜백 보낼까요?"
    ↓
[보내기] → 서버 API로 SMS 발송
```

| 플랫폼 | 지원 | 사용자 액션 |
|--------|-----|------------|
| Android | ✅ | 없음 (자동) 또는 팝업 확인 |
| iOS | ✅ | 팝업 확인 필수 |

### 3.2 시나리오 B: 고객이 사장님에게 전화 (수신) - Android

```
[고객] 명함 웹에서 tel 버튼 클릭 → 사장님에게 전화
    ↓
[사장님 앱] 수신 전화 감지 + 발신자 번호 확인 (READ_CALL_LOG)
    ↓
통화 → 종료
    ↓
[팝업] "010-1234-5678에게 콜백 보낼까요?"
    ↓
[보내기] → 서버 API로 SMS 발송
```

**Android는 수신 전화도 번호 자동 인식 가능!**

### 3.3 시나리오 B: 고객이 사장님에게 전화 (수신) - iOS

```
[고객 - 웹]
명함에서 전화 버튼 클릭
    ↓
┌─────────────────────────────────┐
│ 전화 문의하기                    │
│                                 │
│ 연락 받으실 번호를 입력해주세요    │
│ 📱 [010-1234-5678    ]         │
│                                 │
│ ☑️ 마케팅 정보 수신 동의          │
│                                 │
│ [전화하기]                       │
└─────────────────────────────────┘
    ↓
서버에 번호 저장 → tel: 전화 실행
    ↓
[사장님 앱] 통화 종료 감지
    ↓
서버에서 최근 발신자 조회
    ↓
[팝업] "010-1234-5678에게 콜백 보낼까요?"
    ↓
[보내기] → 서버 API로 SMS 발송
```

**iOS는 고객이 번호 입력 필요 (서버 매칭 방식)**

---

## 4. 앱 개발 방식

### 4.1 하이브리드 앱 (Capacitor) - 추천

```
┌─────────────────────────────────────────────────────────┐
│                   G-Plat 하이브리드 앱                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │              WebView (기존 React 웹)             │   │
│  │  • 명함 생성/편집                                │   │
│  │  • 템플릿 관리                                   │   │
│  │  • 발송 설정                                     │   │
│  │  • 통계 확인                                     │   │
│  └─────────────────────────────────────────────────┘   │
│                          ↕ 브릿지                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │           네이티브 레이어 (콜백 전용)             │   │
│  │  • 통화 종료 감지                                │   │
│  │  • 백그라운드 서비스                             │   │
│  │  • 푸시 알림                                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**장점**:
- 기존 react-app 코드 그대로 사용
- 단일 코드베이스 (웹/앱 동시 배포)
- 빠른 개발 (2-3주)
- 웹 수정 시 앱 자동 반영

**기술 스택**:
- Capacitor (Ionic 팀)
- React + Vite (기존)
- 커스텀 네이티브 플러그인 (콜백용)

### 4.2 순수 네이티브 앱 vs 하이브리드 비교

| 항목 | 순수 네이티브 | 하이브리드 (Capacitor) |
|------|-------------|----------------------|
| 개발 비용 | 높음 | **낮음** |
| 개발 기간 | 2-3개월 | **2-3주** |
| 코드 재사용 | ❌ | ✅ **기존 웹** |
| 유지보수 | 웹 + 앱 따로 | **단일 코드** |
| 성능 | 최고 | 충분함 |
| 콜백 기능 | ✅ | ✅ |

---

## 5. 시스템 아키텍처

### 5.1 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                G-Plat 웹 (g-plat.com)                   │
│  • 명함 생성/편집                                        │
│  • 콜백 템플릿 작성                                      │
│  • 발송 조건 설정                                        │
│  • 통계 확인                                            │
└─────────────────────────────────────────────────────────┘
                          ↓ API
┌─────────────────────────────────────────────────────────┐
│                    G-Plat 서버                          │
│  • 설정 저장 (Supabase)                                 │
│  • SMS 발송 (Aligo API)                                │
│  • 발송 이력 기록                                        │
│  • iOS 서버 매칭 처리                                    │
└─────────────────────────────────────────────────────────┘
                          ↑ API
┌─────────────────────────────────────────────────────────┐
│              G-Plat 앱 (Android/iOS)                    │
│  • 통화 종료 감지                                        │
│  • 서버에 발송 요청                                      │
│  • 팝업 표시                                            │
└─────────────────────────────────────────────────────────┘
```

### 5.2 데이터베이스 스키마

```sql
-- 콜백 로그
CREATE TABLE callback_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  card_id UUID REFERENCES business_cards(id),
  recipient_phone VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  template_id UUID REFERENCES sms_templates(id),
  status TEXT CHECK (status IN ('PENDING', 'SENT', 'FAILED')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SMS 템플릿
CREATE TABLE sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 콜백 설정
CREATE TABLE callback_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  delay_seconds INTEGER DEFAULT 0,
  default_template_id UUID REFERENCES sms_templates(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- iOS 서버 매칭용 (고객 전화 의도 기록)
CREATE TABLE call_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES business_cards(id),
  card_owner_id UUID REFERENCES auth.users(id),
  caller_phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '5 minutes')
);
```

---

## 6. 메시지 템플릿 시스템

### 6.1 템플릿 변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `{{가게명}}` | 사업장 이름 | 맛있는과일 |
| `{{사용자이름}}` | 사장님 이름 | 홍길동 |
| `{{명함URL}}` | 명함 링크 | https://g-plat.com/card/xxx |
| `{{상품명}}` | 클릭한 상품 | 사과 10kg |

### 6.2 템플릿 예시

```
안녕하세요, {{가게명}}입니다!
방금 통화 감사합니다.

{{명함URL}}

궁금하신 점은 언제든 연락주세요!
```

### 6.3 발송 조건

| 옵션 | 설명 |
|------|------|
| 즉시 발송 | 통화 종료 직후 |
| 지연 발송 | 5초, 10초, 30초, 1분 후 |
| 수동 발송 | 팝업에서 확인 후 |

---

## 7. 비즈니스 모델

### 7.1 구독 플랜별 콜백 제공

| 플랜 | 가격 | 콜백 발송 |
|------|------|----------|
| FREE | ₩0/월 | 월 10회 |
| PREMIUM | ₩9,900/월 | 월 100회 |
| BUSINESS | ₩29,900/월 | 무제한 |

### 7.2 SMS 비용
- Aligo 기준: 건당 약 20원
- 서비스에서 비용 부담 → 구독료에 포함

---

## 8. 플랫폼별 최종 UX

### 8.1 Android (완전 자동)

```
[고객] 명함에서 전화 → [사장님] 통화 → 종료
                                ↓
                    자동으로 SMS 발송 (설정에 따라)
                    또는 팝업 확인 후 발송
```

### 8.2 iOS (반자동)

```
[고객] 명함에서 전화 (번호 입력) → [사장님] 통화 → 종료
                                          ↓
                              [팝업] "콜백 보낼까요?"
                                          ↓
                              [보내기] → SMS 발송
```

---

## 9. 구현 우선순위

### Phase 1: 웹 MVP (현재 가능)
1. 콜백 템플릿 관리 UI
2. 수동 콜백 버튼 ("콜백 보내기")
3. SMS API 연동 (Aligo)
4. 발송 이력/통계

### Phase 2: 하이브리드 앱
1. Capacitor 프로젝트 설정
2. 네이티브 플러그인 개발 (통화 감지)
3. Android 완전 자동화
4. iOS 서버 매칭 + 팝업

### Phase 3: 고도화
1. A/B 테스트 기능
2. 스마트 발송 (AI 최적 시간)
3. 통계 대시보드 강화

---

## 10. 참고 자료

### 10.1 외부 서비스
- **Aligo**: https://smartsms.aligo.in/ (한국 SMS)
- **Twilio**: https://www.twilio.com/ (국제 SMS)
- **Capacitor**: https://capacitorjs.com/

### 10.2 관련 문서
- [PRD](../../../prd.md)
- [비즈니스 모델](../../business/business-model.md)
- [현재 로드맵](../../roadmap/current-phase.md)

---

**작성일**: 2025-12-15
**버전**: 1.0
**상태**: 기획 검토 중
