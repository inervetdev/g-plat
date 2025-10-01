# Supabase 이메일 확인 비활성화 방법

## 🔴 중요: Supabase 대시보드에서 직접 설정해야 합니다

### 1. 이메일 확인 비활성화 (테스트용)
1. [Supabase Dashboard](https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr) 접속
2. 왼쪽 메뉴에서 **Authentication** 클릭
3. **Providers** 탭 선택
4. **Email** 섹션 찾기
5. **"Confirm email"** 토글을 **OFF**로 변경
6. 저장

### 2. SMTP 설정 확인 (이메일이 안 올 때)
1. **Settings** → **Project Settings**
2. **Auth** 탭
3. **SMTP Settings** 섹션
4. Custom SMTP 설정이 없으면 기본 Supabase 메일 서버 사용 (하루 3개 제한)

### 3. 수동으로 사용자 확인 (SQL Editor에서)
```sql
-- 특정 사용자의 이메일을 확인된 것으로 변경
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'your-email@example.com';

-- 모든 사용자 확인 (테스트용)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

### 4. RLS 임시 비활성화 (테스트용)
SQL Editor에서 실행:
```sql
-- RLS 비활성화
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- 테스트 후 다시 활성화
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
```

## ⚠️ 주의사항
- 이메일 확인 비활성화는 개발/테스트 환경에서만 사용
- 프로덕션에서는 반드시 이메일 확인 활성화
- Custom SMTP 설정하면 이메일 제한 없음