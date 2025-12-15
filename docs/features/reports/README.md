# G-Plat 신고관리 시스템 기획서

## 1. 개요

### 1.1 신고관리 시스템이란?
사용자가 부적절한 콘텐츠(명함, 부가명함, 사용자)를 신고하고, 관리자가 이를 검토/처리하는 시스템

### 1.2 비즈니스 시나리오
```
[방문자] 명함 열람 → 부적절한 콘텐츠 발견 → 신고 버튼 클릭
                                              ↓
                                    신고 접수 (pending)
                                              ↓
                                    [관리자] 신고 검토
                                              ↓
                        ┌─────────────────────┼─────────────────────┐
                        ↓                     ↓                     ↓
                   콘텐츠 삭제            사용자 경고            신고 기각
                   (resolved)           (resolved)           (rejected)
```

### 1.3 전략적 가치
- **플랫폼 신뢰성**: 스팸/사기 콘텐츠 차단으로 서비스 품질 유지
- **법적 리스크 감소**: 부적절한 콘텐츠에 대한 신속한 대응 체계
- **커뮤니티 자정**: 사용자 참여 기반의 콘텐츠 모더레이션

---

## 2. 신고 유형 및 대상

### 2.1 신고 대상 (target_type)

| 대상 | 설명 | 예시 |
|------|------|------|
| `business_card` | 명함 | 스팸 명함, 사기성 정보 |
| `sidejob_card` | 부가명함 | 불법 상품, 허위 광고 |
| `user` | 사용자 | 다중 계정 악용, 반복 위반자 |

### 2.2 신고 사유 (report_type)

| 사유 | 코드 | 설명 |
|------|------|------|
| 스팸 | `spam` | 광고성/반복 콘텐츠 |
| 부적절한 콘텐츠 | `inappropriate` | 선정적/폭력적/혐오 표현 |
| 사기/허위 | `fraud` | 허위 정보, 피싱 시도 |
| 저작권 침해 | `copyright` | 무단 이미지/로고 사용 |
| 개인정보 노출 | `privacy` | 타인 정보 무단 게시 |
| 기타 | `other` | 위에 해당하지 않는 경우 |

### 2.3 심각도 (severity)

| 등급 | 코드 | 설명 | 대응 |
|------|------|------|------|
| 낮음 | `low` | 경미한 위반 | 48시간 내 처리 |
| 중간 | `medium` | 일반적 위반 | 24시간 내 처리 |
| 높음 | `high` | 심각한 위반 | 4시간 내 처리 |

---

## 3. 처리 워크플로우

### 3.1 신고 상태 (status)

```
[pending] ──검토 시작──→ [investigating] ──처리 완료──→ [resolved]
    │                         │
    │                         └──────부적절────→ [rejected]
    │
    └────────자동 기각 (중복)────→ [rejected]
```

| 상태 | 코드 | 설명 |
|------|------|------|
| 대기 | `pending` | 신규 접수, 미검토 |
| 검토 중 | `investigating` | 관리자가 확인 중 |
| 처리 완료 | `resolved` | 조치 완료 |
| 기각 | `rejected` | 신고 사유 부적절 |

### 3.2 처리 조치 (resolution_action)

| 조치 | 코드 | 설명 |
|------|------|------|
| 콘텐츠 삭제 | `delete_content` | 명함/부가명함 삭제 |
| 콘텐츠 비활성화 | `disable_content` | 명함 비공개 처리 |
| 사용자 경고 | `warn_user` | 경고 이메일 발송 |
| 사용자 정지 | `suspend_user` | 계정 일시 정지 |
| 사용자 영구 정지 | `ban_user` | 계정 영구 차단 |
| 신고 기각 | `reject_report` | 신고 부적절 처리 |

---

## 4. 데이터베이스 스키마

### 4.1 신고 테이블 (user_reports)

```sql
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 신고자 정보
  reporter_id UUID REFERENCES auth.users(id),
  reporter_email VARCHAR(255),
  reporter_ip INET,

  -- 신고 대상
  target_type TEXT NOT NULL CHECK (target_type IN ('business_card', 'sidejob_card', 'user')),
  target_id UUID NOT NULL,
  target_owner_id UUID REFERENCES auth.users(id),

  -- 신고 내용
  report_type TEXT NOT NULL CHECK (report_type IN ('spam', 'inappropriate', 'fraud', 'copyright', 'privacy', 'other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT,
  evidence_urls TEXT[],

  -- 처리 상태
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'rejected')),

  -- 처리 정보
  resolution_action TEXT CHECK (resolution_action IN ('delete_content', 'disable_content', 'warn_user', 'suspend_user', 'ban_user', 'reject_report')),
  resolution_note TEXT,
  reviewed_by UUID REFERENCES admin_users(id),
  reviewed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  -- 알림 설정
  notify_reporter BOOLEAN DEFAULT true,

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_reports_status ON user_reports(status, created_at DESC);
CREATE INDEX idx_reports_target ON user_reports(target_type, target_id);
CREATE INDEX idx_reports_severity ON user_reports(severity, status);
CREATE INDEX idx_reports_reporter ON user_reports(reporter_id);
```

### 4.2 신고 처리 로그 (report_action_logs)

```sql
CREATE TABLE report_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES user_reports(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_report_logs_report ON report_action_logs(report_id, created_at DESC);
```

---

## 5. 사용자 앱 (react-app)

### 5.1 신고 버튼 위치

| 위치 | 컴포넌트 | 트리거 |
|------|----------|--------|
| 명함 상세 | CardDetail | 더보기 메뉴 → "신고하기" |
| 부가명함 | SidejobCard | 더보기 메뉴 → "신고하기" |

### 5.2 신고 제출 API

```typescript
// lib/api/reports.ts
export async function submitReport(data: {
  target_type: 'business_card' | 'sidejob_card' | 'user'
  target_id: string
  report_type: string
  description?: string
  reporter_email?: string
  notify_reporter?: boolean
}): Promise<{ id: string }>
```

---

## 6. 관리자 앱 (admin-app)

### 6.1 구현 파일

- `src/pages/reports/ReportsPage.tsx` - 신고 목록
- `src/components/reports/ReportDetailModal.tsx` - 상세 모달
- `src/components/reports/ReportFilters.tsx` - 필터
- `src/components/reports/ReportStatusBadge.tsx` - 상태 배지
- `src/lib/api/reports.ts` - API 함수

### 6.2 타입 정의

```typescript
export interface Report {
  id: string
  reporter_id: string | null
  reporter_email: string | null
  target_type: 'business_card' | 'sidejob_card' | 'user'
  target_id: string
  target_owner_id: string | null
  report_type: 'spam' | 'inappropriate' | 'fraud' | 'copyright' | 'privacy' | 'other'
  severity: 'low' | 'medium' | 'high'
  description: string | null
  evidence_urls: string[] | null
  status: 'pending' | 'investigating' | 'resolved' | 'rejected'
  resolution_action: string | null
  resolution_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  resolved_at: string | null
  notify_reporter: boolean
  created_at: string
  updated_at: string
}

export interface ReportWithDetails extends Report {
  reporter?: { id: string; email: string }
  target_card?: { id: string; name: string; company: string }
  target_sidejob?: { id: string; title: string }
  target_user?: { id: string; name: string; email: string }
  reviewed_by_admin?: { id: string; name: string }
}

export interface ReportStats {
  total: number
  pending: number
  investigating: number
  resolved: number
  rejected: number
  by_type: { type: string; count: number }[]
  by_severity: { severity: string; count: number }[]
  avg_resolution_time_hours: number
}
```

---

## 7. 알림 시스템

### 7.1 관리자 알림

| 이벤트 | 채널 | 내용 |
|--------|------|------|
| 신규 고심각도 신고 | 이메일/푸시 | "긴급 신고 접수" |
| 24시간 미처리 | 이메일 | "미처리 신고 알림" |

### 7.2 사용자 알림

| 이벤트 | 채널 | 내용 |
|--------|------|------|
| 신고 접수 확인 | 이메일 | "신고가 접수되었습니다" |
| 처리 완료 | 이메일 | "신고 처리 결과 안내" |
| 콘텐츠 삭제 (대상자) | 이메일 | "콘텐츠가 삭제되었습니다" |
| 경고 (대상자) | 이메일 | "서비스 이용 경고" |

---

## 8. 구현 우선순위

### Phase 1: MVP (1주)
1. DB 마이그레이션 (user_reports 테이블)
2. 사용자 앱 신고 버튼/모달
3. 관리자 신고 목록 페이지
4. 관리자 신고 처리 기능

### Phase 2: 고도화 (1주)
1. 신고 통계 대시보드
2. 이메일 알림 시스템
3. 콘텐츠 미리보기 개선
4. 처리 이력 로그

### Phase 3: 자동화 (선택)
1. 중복 신고 자동 감지
2. 키워드 기반 자동 심각도 분류
3. 반복 위반자 자동 감지

---

## 9. 참고 자료

### 9.1 기존 문서
- [ADMIN_SERVICE_SPECIFICATION.md](../../history/archived/admin/ADMIN_SERVICE_SPECIFICATION.md) - 4.11절

### 9.2 유사 패턴
- QR 코드 관리 (QrCodesPage.tsx)
- 사용자 관리 (UsersPage.tsx)
- 부가명함 관리 (SidejobsPage.tsx)

---

**작성일**: 2025-12-16
**버전**: 1.0
**상태**: 기획 초안
