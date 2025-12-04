---
title: "현재 개발 단계 - Phase 3"
category: "roadmap"
tier: 2
status: "active"
last_updated: "2025-12-01"
related_docs:
  - path: "prd.md"
    description: "제품 요구사항 문서"
  - path: "docs/roadmap/phase-1-completed.md"
    description: "Phase 1 완료 내역"
  - path: "docs/roadmap/phase-2-completed.md"
    description: "Phase 2 완료 내역"
tags:
  - roadmap
  - development
  - phase-3
  - current
---

# 현재 개발 단계 - Phase 3

## 현재 상태 요약

**Phase**: 3
**Week**: 16
**전체 진행률**: 약 87%
**버전**: v2.8 (2025-12-04)

## Phase 3 개요

**기간**: 3-4개월차
**목표**: 관리자 웹 서비스 및 고급 기능 구현

### 핵심 목표
1. ✅ 관리자 웹 서비스 개발 (11개 모듈)
2. ⏳ 콜백 자동화 시스템 (SMS 통합)
3. ⏳ 결제 시스템 통합 (Stripe/Toss)
4. ⏳ 한글 도메인 (.한국) 시스템
5. ⏳ 고급 분석 기능

## 최근 완료 사항

### Week 16 (2025-12-04): QR 코드 시스템 완성 ✅

#### 1. QR 코드 자동 생성 기능
- 명함 생성 시 QR 코드 자동 생성
  - `lib/qr.ts`: QR 코드 생성 유틸리티 함수
  - `CreateCardPageOptimized.tsx`: 명함 생성 후 자동 QR 생성
- 기존 명함에 QR 코드 자동 생성
  - SQL 마이그레이션: `20251204000002_create_qr_for_existing_cards.sql`
  - 19개 기존 명함에 QR 코드 생성 완료

#### 2. QR 코드 공유 기능 활성화
- `QRCodeGenerator.tsx`: Web Share API 구현
- QR 코드 이미지 + URL 공유
- 통계 버튼 제거 (중복 UI 제거)

#### 3. QR 리다이렉트 시스템 수정
- `vercel.json`: rewrites 규칙 수정
  - `/q/` 경로를 rewrites에서 제외
  - redirects가 정상 작동하도록 개선
- Edge Function 리다이렉트 정상화

#### 4. Admin QR 관리 개선
- TypeScript 타입 정의 수정 (QRCodeWithDetails)
- Admin RLS 정책 추가 (is_admin_user())
- 활성/비활성 토글 기능 정상화

### Week 15 (2025-12-01): QR 코드 관리 모듈 ✅

#### 1. Admin App QR 코드 관리 페이지
- QR 코드 목록 페이지 (그리드뷰/테이블뷰)
- 검색, 상태, 타입별 필터링
- 정렬 기능 (생성일, 스캔수, 수정일)
- 페이지네이션 (50개/페이지)

#### 2. QR 코드 통계 대시보드
- 전체 QR 코드 수, 활성 QR 수
- 총 스캔 수, 오늘/이번 주 스캔
- 캠페인별 상위 QR 코드

#### 3. QR 코드 상세 모달 (스캔 분석)
- 일별 스캔 추이 차트 (최근 30일)
- 디바이스별 분포 (PieChart)
- 브라우저별 분포 (BarChart)
- 국가별 분포
- 최근 스캔 기록 테이블

#### 4. QR 코드 관리 기능
- 활성/비활성 토글
- QR 코드 삭제 (스캔 기록 포함)
- 외부 링크 열기

### Week 14 (2025-11-27): Admin 명함 신규 생성 기능 ✅

#### 1. CardCreateModal 컴포넌트
- 사용자 검색 및 선택 기능
- 모든 명함 필드 입력 지원 (20+ 필드)
- React Hook Form + Zod 검증

#### 2. 이미지 업로드
- 프로필 이미지 업로드
- 회사 로고 업로드
- Supabase Storage 연동

#### 3. 커스텀 URL 관리
- URL 중복 체크 (실시간)
- 사용 가능 여부 표시

### Week 13 (2025-11-26): UI/UX 개선 및 버그 수정 ✅

#### 1. 지도 및 주소 UI 최적화
- 지도 InfoWindow 완전 제거 (마커만 표시)
- 주소 말풍선 최적화 (`break-keep`, 전체 너비)

#### 2. React Compiler 관련 UI 제거
- 7개 페이지에서 문구/이미지 제거
- DashboardPageOptimized, CardManagePageOptimized 등

#### 3. 랜딩페이지 로그인 상태 유지
- `useAuth` 훅 연동으로 로그인 상태 확인
- 로그인/비로그인 사용자별 버튼 표시

#### 4. 명함 테마 SNS 섹션 추가
- 5개 테마 모두에 SNS 링크 섹션 추가
- LinkedIn, Instagram, Facebook, Twitter/X, YouTube, GitHub 지원
- [THEME_STANDARD.md](../features/business-cards/THEME_STANDARD.md) 신규 작성

### Week 12 (2025-11-22): 이메일 OTP 인증 시스템 ✅

#### 1. 이메일 OTP 회원가입
- 2단계 플로우: 회원가입 폼 → OTP 입력
- Supabase Auth `signUp()` + `verifyOtp()` 통합

#### 2. 비밀번호 찾기 OTP
- 3단계 플로우: 이메일 → OTP 입력 → 새 비밀번호
- `signInWithOtp()` + `verifyOtp()` + `updateUser()` 통합

#### 3. Supabase Email Templates 한글화
- Confirm signup 템플릿 (회원가입 OTP)
- Magic Link 템플릿 (비밀번호 찾기 OTP)

상세: [이메일 OTP 인증](../features/authentication/email-otp.md)

### Week 11 (2025-11-18): 프로필 이미지 시스템 ✅

#### 1. 명함 편집 모달 구현
- **CardEditModal.tsx** 전체 필드 편집 완료
  - 기본 정보, 연락처, 소셜 링크, 소개
  - React Hook Form + Zod 검증
  - 20+ 필드 지원
  - 5개 테마 선택

#### 2. 프로필 이미지 & 회사 로고 업로드
- Supabase Storage 통합 (card-attachments 버킷)
- 이미지 미리보기 및 삭제 기능
- 업로드 진행률 표시
- 파일 크기 및 형식 검증

#### 3. 데이터베이스 스키마 업데이트
- `business_cards` 테이블에 컬럼 추가:
  - `profile_image_url` (TEXT)
  - `company_logo_url` (TEXT)

#### 4. 관리자 RLS 정책 수정
- **business_cards** RLS 정책:
  - admin_users 테이블 조인으로 관리자 권한 확인
  - UPDATE, SELECT, DELETE 정책에 admin 접근 추가
- **Storage** RLS 정책:
  - admin이 모든 사용자 폴더에 파일 업로드/수정/삭제 가능

#### 5. 5개 테마 카드 업데이트
- TrendyCard, AppleCard, ProfessionalCard, SimpleCard, DefaultCard
- 프로필 이미지 표시 추가
- 회사 로고 표시 추가 (일부 테마)

### Week 1-2: 관리자 웹 서비스 기반 구축 ✅

#### 1. 관리자 인증 시스템
- admin_users 테이블 (Supabase)
- 로그인 페이지 (LoginPage.tsx)
- 인증 상태 무한 루프 이슈 해결
- Vercel 프로덕션 배포 완료

#### 2. 대시보드 UI
- DashboardPage.tsx 구현
- 주요 지표 카드 (총 사용자, 활성 명함, 총 방문자, QR 스캔)
- 최근 가입 사용자 목록
- 최근 활성 명함 목록
- Recharts 기반 차트 통합

#### 3. 명함 관리 모듈
- 명함 목록 페이지 (CardsPage)
  - 검색, 필터, 정렬 기능
  - 그리드뷰/테이블뷰 전환
  - 다중 선택 및 일괄 작업
  - 페이지네이션 (50개/페이지)
- 명함 상세 페이지 (CardDetailPage)
  - 사용자 정보 및 명함 상세
  - 통계 차트 (방문자 추이, 디바이스별, 브라우저별)
  - 최근 방문자 목록
  - 명함 활성/비활성 토글
  - 테마 변경 기능

## 진행 중인 작업

### Week 16 (예정): 콜백 자동화 시스템 시작
- SMS API 연동 (Twilio/Aligo)
- 자동 발송 로직 설계
- 메시지 템플릿 관리

### Week 17-18 (예정): 콜백 시스템 완성
- 통화 종료 감지
- SMS 자동 발송
- 발송 이력 추적

## Phase 3 전체 계획

### 관리자 웹 서비스 (11개 모듈)
1. ✅ 대시보드 (Week 2)
2. ✅ 명함 관리 (Week 3-14)
   - ✅ 명함 목록 및 상세
   - ✅ 명함 편집 (프로필 이미지 포함)
   - ✅ 명함 생성 (Week 14)
3. ✅ 부가명함 관리 (Week 13)
4. ✅ QR 코드 관리 (Week 15)
5. ⏳ 첨부파일 관리
6. ⏳ 통계 및 분석
7. ⏳ 마케팅 캠페인
8. ⏳ 고객 지원
9. ⏳ 설정 관리
10. ⏳ 감사 로그
11. ⏳ 시스템 모니터링

### 콜백 자동화 시스템 (Phase 3)
- ⏳ 통화 종료 감지
- ⏳ SMS 자동 발송 (Twilio/Aligo)
- ⏳ 메시지 템플릿 관리
- ⏳ 발송 이력 추적

### 결제 시스템 (Phase 3)
- ⏳ Stripe/Toss Payments 연동
- ⏳ 구독 플랜 관리
- ⏳ 결제 내역 및 영수증
- ⏳ 자동 청구 시스템

### 한글 도메인 시스템 (Phase 3)
- ⏳ 가비아 도메인 API 연동
- ⏳ 자동 도메인 생성
- ⏳ DNS 설정 자동화
- ⏳ 도메인 관리 대시보드

## 기술 스택 (현재)

### 관리자 앱 (admin-app/)
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Zustand (상태 관리)
- React Hook Form + Zod (폼 검증)
- Recharts (차트)

### 공통 인프라
- Supabase (Auth, Database, Storage)
- Vercel (배포)
- GitHub (버전 관리)
- Playwright (E2E 테스트)

## 다음 마일스톤

### Week 16 (2025-12-02): 콜백 자동화 시스템 시작
- SMS API 연동 (Twilio/Aligo)
- 자동 발송 로직 설계
- 메시지 템플릿 관리

### Week 17-18 (2025-12-09 ~ 12-16): 콜백 시스템 완성
- 통화 종료 감지
- SMS 자동 발송
- 발송 이력 추적

### Week 19-20 (2025-12-23 ~ 12-30): 결제 시스템
- Stripe/Toss Payments 연동
- 구독 플랜 관리
- 결제 내역 및 영수증

## 성공 지표

### 개발 진행률
- Phase 3 전체: **약 60% 완료**
- 관리자 웹 서비스: **약 55% 완료**
  - 대시보드: 100%
  - 명함 관리: 100%
  - 부가명함 관리: 100%
  - QR 코드 관리: 100%
  - 사용자 인증: 100% (이메일 OTP)
  - 기타 모듈: 0-10%

### 품질 지표
- TypeScript 빌드 에러: 0개
- ESLint 경고: 최소화
- Playwright 테스트: 90% 통과
- 코드 커버리지: 65% (목표: 80%)

## 관련 문서

- [Phase 1 완료 내역](phase-1-completed.md)
- [Phase 2 완료 내역](phase-2-completed.md)
- [Phase 3 계획](phase-3-planned.md)
- [버전 히스토리](../history/versions/)
- [PRD 문서](../../prd.md)
