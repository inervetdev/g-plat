---
title: "현재 개발 단계 - Phase 3"
category: "roadmap"
tier: 2
status: "active"
last_updated: "2025-11-22"
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
**Week**: 11
**전체 진행률**: 약 75%
**버전**: v2.4 (2025-11-18)

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

### Week 3 (2025-11-18): 프로필 이미지 시스템 ✅

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

### Week 4 (예정): 명함 생성 기능
- 관리자가 직접 사용자 명함 생성
- CardCreateModal 컴포넌트 구현
- 사용자 검색 및 선택
- 모든 필드 입력 지원

### Week 5 (예정): 부가명함 관리
- 부가명함 목록 페이지
- 부가명함 편집/삭제
- 카테고리별 필터링
- 이미지 업로드 관리

### Week 6 (예정): QR 코드 관리
- QR 코드 목록 및 통계
- QR 코드 스캔 분석
- QR 코드 재생성
- 캠페인별 QR 관리

## Phase 3 전체 계획

### 관리자 웹 서비스 (11개 모듈)
1. ✅ 대시보드 (Week 2)
2. 🔄 사용자 관리 (Week 3-4)
   - ✅ 명함 목록 및 상세
   - ✅ 명함 편집 (프로필 이미지 포함)
   - ⏳ 명함 생성 (Week 4)
3. ⏳ 부가명함 관리 (Week 5)
4. ⏳ QR 코드 관리 (Week 6)
5. ⏳ 첨부파일 관리 (Week 7)
6. ⏳ 통계 및 분석 (Week 8)
7. ⏳ 마케팅 캠페인 (Week 9)
8. ⏳ 고객 지원 (Week 10)
9. ⏳ 설정 관리 (Week 11)
10. ⏳ 감사 로그 (Week 12)
11. ⏳ 시스템 모니터링 (Week 13)

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

### Week 4 (2025-11-25): 명함 생성 기능
- CardCreateModal 구현
- 사용자 검색 및 선택
- 모든 필드 입력 지원
- 프로필 이미지 업로드

### Week 5-6 (2025-12-02 ~ 12-09): 부가명함 & QR 관리
- 부가명함 CRUD
- QR 코드 통계 대시보드
- 캠페인 관리

### Week 7-8 (2025-12-16 ~ 12-23): 콜백 시스템 개발
- SMS API 연동
- 자동 발송 로직
- 템플릿 관리

## 성공 지표

### 개발 진행률
- Phase 3 전체: **약 30% 완료**
- 관리자 웹 서비스: **약 25% 완료**
  - 대시보드: 100%
  - 명함 관리: 80%
  - 기타 모듈: 0-10%

### 품질 지표
- TypeScript 빌드 에러: 0개
- ESLint 경고: 최소화
- Playwright 테스트: 85% 통과
- 코드 커버리지: 60% (목표: 80%)

## 관련 문서

- [Phase 1 완료 내역](phase-1-completed.md)
- [Phase 2 완료 내역](phase-2-completed.md)
- [Phase 3 계획](phase-3-planned.md)
- [버전 히스토리](../history/versions/)
- [PRD 문서](../../prd.md)
