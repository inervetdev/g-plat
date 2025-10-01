# Supabase 데이터베이스 마이그레이션 가이드

## 📋 준비 사항

1. Supabase 프로젝트: `anwwjowwrxdygqyhhckr`
2. Supabase Dashboard 접속: https://supabase.com/dashboard/project/anwwjowwrxdygqyhhckr

## 🚀 마이그레이션 실행 방법

### 방법 1: Supabase Dashboard SQL Editor (권장)

1. Supabase Dashboard 로그인
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. **New query** 버튼 클릭
4. `migrations/001_initial_schema.sql` 파일 내용 복사/붙여넣기
5. **Run** 버튼 클릭하여 실행

### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref anwwjowwrxdygqyhhckr

# 마이그레이션 실행
supabase db push
```

## 📊 생성되는 테이블

1. **users** - 사용자 기본 정보
   - Supabase Auth와 연동
   - 이메일, 이름, 도메인명, 구독 정보

2. **user_profiles** - 사용자 상세 프로필
   - 회사, 직책, 자기소개
   - 테마 설정, 소셜 링크

3. **sidejob_cards** - 부업 명함
   - 제목, 설명, 가격, CTA 버튼
   - 조회수, 클릭수 통계

4. **visitor_stats** - 방문자 통계
   - IP, User Agent, Referrer
   - 일별 방문 기록

5. **callback_logs** - SMS 콜백 로그
   - 전화번호, 메시지 내용
   - 발송 상태 추적

## 🔐 보안 설정 (RLS)

모든 테이블에 Row Level Security가 적용됨:
- 사용자는 자신의 데이터만 수정 가능
- 명함과 프로필은 공개 조회 가능
- 통계는 본인만 조회 가능

## ✅ 확인 사항

마이그레이션 후 다음을 확인:

1. **테이블 생성 확인**
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

2. **RLS 정책 확인**
   ```sql
   SELECT tablename, policyname FROM pg_policies
   WHERE schemaname = 'public';
   ```

3. **트리거 확인**
   ```sql
   SELECT trigger_name, event_object_table
   FROM information_schema.triggers
   WHERE trigger_schema = 'public';
   ```

## 🔑 API 키 설정

`.env` 파일에 추가:
```env
VITE_SUPABASE_URL=https://anwwjowwrxdygqyhhckr.supabase.co
VITE_SUPABASE_ANON_KEY=[Supabase Dashboard > Settings > API에서 확인]
```

## 🎯 다음 단계

1. Supabase Dashboard에서 API 키 확인
2. `.env` 파일 업데이트
3. 인증 시스템 구현
4. 테스트 데이터 생성

## ⚠️ 주의 사항

- 마이그레이션은 한 번만 실행 (이미 존재하는 테이블은 건너뜀)
- 프로덕션 환경에서는 백업 후 실행
- API 키는 절대 Git에 커밋하지 않음