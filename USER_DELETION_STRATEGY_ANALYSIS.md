# 사용자 삭제 전략 비교 분석

## 📊 현재 구현 vs 제안된 방식

### 현재 구현 (Soft Delete with RLS)

```
사용자 삭제 → deleted_at 설정 → Auth 계정 유지 → RLS로 데이터 접근 차단
                                ↓
                          로그인: 성공 ✅
                                ↓
                     명함 생성 시도: RLS 차단 ❌
                                ↓
                "계정이 정지되었거나 삭제되었습니다"
```

**특징:**
- ✅ 로그인 가능 (Auth 계정 유지)
- ❌ 데이터 접근 차단 (RLS)
- ⚠️  사용자가 로그인 후에야 삭제 사실 인지
- ✅ 복구 쉬움 (deleted_at = NULL)
- ✅ 감사 추적 용이

---

### 제안된 방식 (30일 유예 + 로그인 차단)

```
사용자 삭제 → deleted_at 설정 → 로그인 시도
                                ↓
                         로그인 차단 ❌
                                ↓
    "삭제 대상 계정입니다. 30일 후 영구 삭제됩니다."
                                ↓
                    30일 후 → 완전 삭제 (선택)
```

**특징:**
- ❌ 로그인 차단 (더 강력한 제재)
- ✅ 삭제 사실을 즉시 인지
- ✅ 30일 유예기간 명시
- ✅ 복구 가능 (30일 내)
- ✅ GDPR/개인정보보호법 준수

---

## 🎯 사용자 상태 분류

### Option A: 현재 구현 (2단계)

| 상태 | status | deleted_at | 로그인 | 데이터 접근 | 사용 사례 |
|------|--------|-----------|--------|------------|----------|
| 정상 | active | NULL | ✅ | ✅ | 일반 사용자 |
| 정지 | suspended | NULL | ✅ | ❌ (RLS) | 약관 위반, 일시 정지 |
| 삭제 | active | 설정됨 | ✅ | ❌ (RLS) | 사용자 삭제 요청 |

**문제점:**
- 정지와 삭제가 UX 상 동일 (둘 다 로그인 후 차단)
- 삭제가 덜 엄격함 (로그인 가능)

---

### Option B: 제안된 방식 (3단계)

| 상태 | status | deleted_at | 로그인 | 데이터 접근 | 사용 사례 |
|------|--------|-----------|--------|------------|----------|
| 정상 | active | NULL | ✅ | ✅ | 일반 사용자 |
| 정지 | suspended | NULL | ✅ | ❌ (RLS) | 약관 위반, 일시 정지 |
| 삭제 예정 | deleted | 설정됨 | ❌ (Auth 차단) | ❌ | 30일 유예 |
| 영구 삭제 | - | - | ❌ (계정 없음) | ❌ | 30일 후 완전 삭제 |

**장점:**
- 명확한 단계 구분
- 삭제가 더 엄격함 (로그인 차단)
- 30일 유예기간으로 복구 가능
- 법적 요구사항 준수

---

## 🔍 기술적 구현 방식 비교

### Option A: 현재 (RLS만 사용)

**장점:**
- ✅ 구현 간단 (RLS만 수정)
- ✅ Auth 계정 유지로 복구 쉬움
- ✅ 추가 로직 불필요

**단점:**
- ❌ 로그인 차단 불가 (Auth 수준)
- ❌ 정지와 삭제 구분 모호
- ❌ 30일 유예 개념 없음

**구현:**
```sql
-- RLS 정책만 수정 (이미 완료)
CREATE POLICY ... USING (
  auth.uid() = user_id
  AND is_user_allowed(auth.uid())  -- deleted_at + status 체크
);
```

---

### Option B: 제안된 방식 (Auth 차단 + 30일 유예)

**장점:**
- ✅ 로그인 단계에서 차단 (더 강력)
- ✅ 명확한 메시지 전달
- ✅ 30일 유예기간 명시
- ✅ 법적 안정성 (GDPR, 개인정보보호법)
- ✅ 정지 vs 삭제 명확히 구분

**단점:**
- ⚠️  구현 복잡도 증가
- ⚠️  Supabase Auth Hook 필요
- ⚠️  Cron Job 필요 (30일 후 삭제)
- ⚠️  Edge Function 필요 (인증 차단)

**구현:**

#### 1. Database 스키마 추가
```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS permanent_deletion_at TIMESTAMPTZ;

-- deletion_scheduled_at: 삭제 시작 시각
-- permanent_deletion_at: 영구 삭제 예정 시각 (30일 후)
```

#### 2. Auth Hook (로그인 차단)
```typescript
// supabase/functions/auth-hook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { event, user } = await req.json()

  // 로그인 시도 시
  if (event === 'user.login') {
    const { data: userData } = await supabase
      .from('users')
      .select('deleted_at, deletion_scheduled_at, permanent_deletion_at')
      .eq('id', user.id)
      .single()

    // 삭제 예정 사용자 차단
    if (userData?.deletion_scheduled_at) {
      const daysLeft = Math.ceil(
        (new Date(userData.permanent_deletion_at).getTime() - Date.now())
        / (1000 * 60 * 60 * 24)
      )

      return new Response(
        JSON.stringify({
          decision: 'reject',
          message: `삭제 대상 계정입니다. ${daysLeft}일 후 영구 삭제됩니다.\n복구를 원하시면 관리자에게 문의하세요.`
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response(
    JSON.stringify({ decision: 'continue' }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

#### 3. Cron Job (30일 후 영구 삭제)
```typescript
// supabase/functions/cleanup-deleted-users/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 30일 지난 삭제 예정 사용자 찾기
  const { data: usersToDelete } = await supabase
    .from('users')
    .select('id, email, permanent_deletion_at')
    .lte('permanent_deletion_at', new Date().toISOString())
    .not('deletion_scheduled_at', 'is', null)

  for (const user of usersToDelete || []) {
    // 1. Auth 계정 완전 삭제
    await supabase.auth.admin.deleteUser(user.id)

    // 2. users 테이블에서도 삭제 (CASCADE로 관련 데이터 모두 삭제)
    await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    console.log(`Permanently deleted user: ${user.email}`)
  }

  return new Response(
    JSON.stringify({
      deleted: usersToDelete?.length || 0,
      timestamp: new Date().toISOString()
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

#### 4. 사용자 삭제 로직 수정 (UserDeleteModal.tsx)
```typescript
const handleDelete = async () => {
  const now = new Date()
  const deletionDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30일 후

  const { error: updateError } = await supabase
    .from('users')
    .update({
      deletion_scheduled_at: now.toISOString(),
      permanent_deletion_at: deletionDate.toISOString(),
      deletion_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (!updateError) {
    alert(`사용자가 삭제 예정으로 설정되었습니다.

이름: ${user.name}
이메일: ${user.email}
삭제 사유: ${reason}

⚠️ 30일 후 (${deletionDate.toLocaleDateString('ko-KR')}) 영구 삭제됩니다.
복구를 원하시면 permanent_deletion_at을 NULL로 설정하세요.`)
  }
}
```

---

## 📊 비교 표

| 항목 | 현재 구현 (A) | 제안 방식 (B) |
|------|--------------|--------------|
| **구현 복잡도** | 낮음 ⭐ | 높음 ⭐⭐⭐ |
| **로그인 차단** | ❌ | ✅ |
| **명확한 메시지** | ⚠️  (명함 생성 시) | ✅ (로그인 시) |
| **30일 유예** | ❌ | ✅ |
| **복구 용이성** | ✅ (즉시) | ✅ (30일 내) |
| **법적 준수** | ⚠️  기본 | ✅ 완전 |
| **정지 vs 삭제 구분** | 모호 | 명확 ✅ |
| **필요 기술** | RLS만 | Auth Hook + Edge Function + Cron |
| **유지보수** | 쉬움 | 복잡 |
| **비용** | 무료 | Edge Function 실행 비용 |

---

## 🎯 권장 사항

### 단기 (현재 유지) - Option A
**현재 구현을 유지하되, 문서에 명시:**

```markdown
## 사용자 상태 관리

### 정지 (Suspended)
- status = 'suspended'
- 로그인: 가능 ✅
- 데이터 접근: 불가 ❌
- 사용 사례: 약관 위반, 일시 정지
- 복구: status = 'active'로 변경

### 삭제 (Deleted)
- deleted_at 설정
- 로그인: 가능 ✅ (Auth 계정 유지)
- 데이터 접근: 불가 ❌ (RLS 차단)
- 사용 사례: 사용자 삭제 요청
- 복구: deleted_at = NULL로 변경
- 완전 삭제: Supabase Dashboard에서 수동 삭제
```

**장점:**
- ✅ 이미 구현 완료
- ✅ 추가 개발 불필요
- ✅ 즉시 사용 가능

**단점:**
- ⚠️  삭제가 로그인 후에야 인지
- ⚠️  30일 유예 개념 없음

---

### 장기 (v3.0 고려) - Option B
**향후 개선 시 도입:**

```markdown
## 사용자 삭제 로드맵

### Phase 1 (현재 - v2.5.5) ✅
- RLS로 삭제 사용자 데이터 접근 차단
- Soft delete (deleted_at)
- 수동 복구 가능

### Phase 2 (v3.0 - 계획)
- Auth Hook으로 로그인 차단
- 30일 유예기간 도입
- 자동 영구 삭제 (Cron Job)
- 삭제 예정 사용자 복구 UI

### Phase 3 (v3.5 - 계획)
- 사용자 셀프 계정 삭제
- 데이터 다운로드 (GDPR)
- 삭제 전 이메일 알림
```

---

## 💡 즉시 적용 가능한 개선안 (중간 방안)

현재 구현에 **최소한의 코드 추가**로 개선:

### 1. 로그인 후 리다이렉트 체크 추가

```typescript
// react-app/src/App.tsx 또는 Layout.tsx
useEffect(() => {
  const checkUserStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('deleted_at, deletion_reason, status')
      .eq('id', user.id)
      .single()

    if (userData?.deleted_at) {
      // 삭제된 사용자
      await supabase.auth.signOut()
      alert('삭제 대상 계정입니다.\n관리자에게 복구를 요청하세요.')
      navigate('/login')
    } else if (userData?.status === 'suspended') {
      // 정지된 사용자
      await supabase.auth.signOut()
      alert('계정이 정지되었습니다.\n관리자에게 문의하세요.')
      navigate('/login')
    }
  }

  checkUserStatus()
}, [])
```

**장점:**
- ✅ 로그인 직후 즉시 차단
- ✅ 구현 간단 (10줄)
- ✅ Auth Hook 불필요
- ✅ 비용 증가 없음

**단점:**
- ⚠️  완전한 로그인 차단은 아님 (클라이언트 측)
- ⚠️  API 직접 호출 시 우회 가능 (하지만 RLS로 차단됨)

---

## 📋 결론 및 추천

### 현재 상황 (MVP 단계)
**Option A 유지 + 즉시 개선안 적용**

1. ✅ 현재 RLS 구현 유지 (이미 작동 중)
2. ✅ 로그인 후 리다이렉트 체크 추가 (10줄)
3. ✅ 문서에 명확히 기술

**이유:**
- MVP 단계에서는 간단한 구현이 중요
- RLS로 데이터는 완벽히 차단됨
- 로그인 차단은 클라이언트 측으로도 충분
- 추가 인프라 비용 없음

### 향후 (정식 출시 후)
**Option B 도입 고려**

**타이밍:**
- 사용자 1000명 이상
- 법적 요구사항 발생 시
- 자동화된 운영 필요 시

**도입 시:**
- Auth Hook 설정
- Edge Function 배포
- Cron Job 설정
- 30일 유예 로직 구현

---

**현재 권장: Option A (현재 유지) + 로그인 후 체크 추가** ⭐

즉시 적용 가능한 개선안을 적용하시겠습니까?
