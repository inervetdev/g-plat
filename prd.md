---
title: "지플랫(G-Plat) 모바일 명함 서비스 PRD"
category: "product"
tier: 1
status: "active"
last_updated: "2025-11-25"
version: "3.0"
related_docs:
  - path: "docs/business/product-vision.md"
    description: "제품 비전 및 가치 제안"
  - path: "docs/business/business-model.md"
    description: "비즈니스 모델 및 수익 구조"
  - path: "docs/roadmap/current-phase.md"
    description: "현재 개발 단계 (Phase 3)"
tags:
  - prd
  - product
  - requirements
---

# 지플랫(G-Plat) 모바일 명함 서비스 PRD
**Product Requirements Document v3.0**

---

## 제품 개요

### 제품 정의
**지플랫(G-Plat)**은 개인 부업 포트폴리오를 통합 관리하고 홍보할 수 있는 모바일 명함 웹 빌더 서비스입니다.

### 제품 비전
> "모든 개인을 1인 기업가로, 명함 하나로 시작하는 부업 생태계"

### 핵심 가치 제안
- **간편한 시작**: 3분 만에 완성되는 모바일 명함
- **스마트한 관리**: 여러 부업을 하나의 플랫폼에서 통합 관리
- **자동화된 마케팅**: 콜백 기능으로 자연스러운 고객 접점 확보
- **데이터 기반 성장**: 실시간 통계로 비즈니스 인사이트 제공

👉 **상세 정보**: [제품 비전 및 가치 제안](docs/business/product-vision.md)

---

## 현재 개발 상태

### Phase & Version
- **Current Phase**: Phase 3, Week 11
- **Version**: v3.0 (2025-11-25)
- **진행률**: 약 78%

### 최근 완료 (v3.0 - 2025-11-25)
- ✅ **사용자 삭제 시스템 v3.0 재설계**
  - Soft Delete (삭제대기) + Hard Delete (완전 삭제) 2단계 삭제
  - deleted_at, deletion_reason 필드 기반 삭제 추적
  - 삭제 정보 카드 (복구/완전 삭제 버튼 포함)
  - 삭제 사용자 로그인 차단 (react-app LoginPage)
  - 상태 필터 개선 (삭제대기/비활성 별도 필터링)
- ✅ Playwright E2E 테스트 스위트 구축

### 이전 완료 (v2.4 - 2025-11-22)
- ✅ 프로필 이미지 & 회사 로고 업로드 시스템
- ✅ 명함 편집 모달 (CardEditModal) 구현
- ✅ 관리자 RLS 정책 수정
- ✅ 5개 테마 카드에 이미지 표시 추가

### 진행 중
- 🔄 명함 생성 기능 (Week 4)
- 🔄 부가명함 관리 (Week 5)
- 🔄 QR 코드 관리 (Week 6)

### 다음 단계
- ⏳ 콜백 자동화 시스템 (SMS 통합)
- ⏳ 결제 시스템 (Stripe/Toss)
- ⏳ 한글 도메인 (.한국) 시스템

👉 **상세 정보**: [현재 개발 단계](docs/roadmap/current-phase.md)

---

## 핵심 기능

### 1. 명함 관리
- 모바일 명함 생성/편집/삭제
- 커스텀 URL (중복 체크)
- 5개 테마 (Trendy, Apple, Professional, Simple, Default)
- 프로필 이미지 & 회사 로고 업로드
- 실시간 미리보기

### 2. 부가명함 (SideJob Cards)
- 다중 부업 포트폴리오 관리
- 5개 Primary 카테고리, 16개 Secondary 카테고리
- 이미지 업로드 (Supabase Storage)
- 드래그 앤 드롭 순서 변경
- CTA 링크 및 배지 표시

### 3. 첨부파일 시스템
- 파일 업로드 (PDF, 이미지, 동영상)
- YouTube 통합 (Shorts 포함)
- 드래그 앤 드롭 순서 변경
- 썸네일 자동 생성

### 4. QR 코드 시스템
- QR 코드 생성 및 다운로드
- Edge Function 기반 리다이렉트
- 스캔 추적 (디바이스, 브라우저, OS)
- 통계 대시보드

### 5. 통계 & 분석
- 실시간 방문자 추적
- QR 스캔 분석
- 디바이스/브라우저별 통계
- 시계열 차트 (Recharts)

### 6. 인증 시스템
- 이메일/비밀번호 로그인
- Google OAuth (프로덕션 배포 완료)
- Kakao/Apple OAuth (준비 완료)
- 관리자 인증 시스템

### 7. 관리자 웹 서비스 (Phase 3)
- ✅ 대시보드 (주요 지표, 차트)
- ✅ **사용자 관리 (v3.0 완료)**
  - 사용자 목록 (필터링, 검색, 정렬)
  - 사용자 상세 정보 (기본 정보, 명함, 부가명함, QR 코드, 활동 로그, 결제 내역)
  - 상태 변경 (활성화, 비활성화, 정지, 삭제대기)
  - Soft Delete (삭제대기) + Hard Delete (완전 삭제) 2단계 삭제
  - 삭제 정보 카드 (복구/완전 삭제 기능)
  - 상태 필터 (활성, 비활성, 정지, 삭제대기)
- ✅ 명함 관리 (목록, 상세, 편집)
- 🔄 부가명함 관리 (진행 중)
- ⏳ QR 코드 관리
- ⏳ 통계 및 분석
- ⏳ 마케팅 캠페인

👉 **상세 정보**:
- [React App 기능 목록](docs/services/react-app/FEATURES.md)
- [Admin App 스펙](ADMIN_SERVICE_SPECIFICATION.md)

---

## 비즈니스 모델

### Freemium 구독 모델
| 플랜 | 가격 | 주요 기능 |
|------|------|-----------|
| **무료** | ₩0/월 | 명함 3개, 부가명함 5개, 기본 통계만 제공, 콜백 미제공 |
| **유료** | ₩9,900/월 | 명함 10개, 부가명함 30개, 전체 통계, 콜백 제공 |
| **프리미엄** | ₩29,900/월 | 무제한 명함/부가명함, 무제한 콜백, 특화 서비스 (환급금 계산기, AI 상담사, TM 서비스) |

### 부업 중개 수수료
- 렌탈 제품: 월 렌탈료의 5-15%
- 일반 제품: 판매가의 3-10%
- 보험 상품: 초회 보험료의 20-30%

👉 **상세 정보**: [비즈니스 모델](docs/business/business-model.md)

---

## 기술 아키텍처

### Frontend
- **React App**: React 18 + TypeScript + Vite
- **Admin App**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Backend
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Functions**: Supabase Edge Functions (Deno)
- **Realtime**: Supabase Realtime

### Infrastructure
- **Hosting**: Vercel (React App + Admin App)
- **CDN**: Cloudflare (planned)
- **Version Control**: GitHub
- **CI/CD**: Vercel Auto-Deploy
- **Testing**: Playwright

👉 **상세 정보**: [기술 스택](docs/architecture/tech-stack.md)

---

## 성공 지표

### 사용자 지표
- MAU (Monthly Active Users)
- 유료 전환율
- 사용자 유지율 (Retention)

### 비즈니스 지표
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)
- 부업 중개 거래액

### 제품 지표
- 명함 생성 수
- QR 스캔 수
- 평균 방문자 수

👉 **상세 정보**: [성공 지표](docs/business/success-metrics.md)

---

## 개발 로드맵

### ✅ Phase 1: MVP (완료)
- React + Vite + Supabase 프로젝트 셋업
- 인증 시스템 (이메일, Google OAuth)
- 명함 CRUD (커스텀 URL)
- 부가명함 시스템 (카테고리, 이미지 업로드)
- QR 코드 생성 및 추적
- 통계 대시보드
- Vercel 프로덕션 배포

### ✅ Phase 2: 핵심 기능 완성 (완료)
- 부가명함 카테고리 시스템
- Supabase Storage 통합
- QR Edge Function 배포
- 첨부파일 시스템 (YouTube 통합)
- 드래그 앤 드롭 순서 변경
- Naver Maps 주소 검색
- React Compiler 최적화

### 🔄 Phase 3: 관리자 웹 & 고급 기능 (진행 중)
- ✅ 관리자 인증 및 대시보드
- ✅ 명함 관리 (목록, 상세, 편집)
- 🔄 명함 생성 (Week 4)
- ⏳ 부가명함 & QR 관리 (Week 5-6)
- ⏳ 콜백 자동화 (SMS 통합)
- ⏳ 결제 시스템 (Stripe/Toss)
- ⏳ 한글 도메인 (.한국) 시스템

### ⏳ Phase 4: 확장 (계획)
- 팀 협업 기능
- AI 기반 추천
- 고급 CRM 기능
- 모바일 앱 (React Native)

👉 **상세 정보**:
- [Phase 1 완료 내역](docs/roadmap/phase-1-completed.md)
- [Phase 2 완료 내역](docs/roadmap/phase-2-completed.md)
- [Phase 3 계획](docs/roadmap/phase-3-planned.md)

---

## 리스크 및 대응방안

### 기술적 리스크
- Supabase 서비스 장애 → 백업 시스템 구축
- 한글 도메인 호환성 → Punycode 변환
- SMS 발송 실패 → 다중 벤더 연동

### 비즈니스 리스크
- 사용자 획득 부진 → 추천 프로그램
- 경쟁사 출현 → 빠른 기능 개발
- 파트너사 확보 어려움 → 초기 수수료 할인

### 보안 리스크
- 개인정보 유출 → 암호화, 접근 제어
- DDoS 공격 → Cloudflare 보호
- 계정 탈취 → 2단계 인증

👉 **상세 정보**: [리스크 관리](docs/business/risk-management.md)

---

## 문서 인덱스

### 비즈니스 문서
- [제품 비전](docs/business/product-vision.md)
- [비즈니스 모델](docs/business/business-model.md)
- [타겟 사용자](docs/business/target-users.md)
- [성공 지표](docs/business/success-metrics.md)
- [리스크 관리](docs/business/risk-management.md)

### 기술 문서
- [기술 스택](docs/architecture/tech-stack.md)
- [데이터베이스 스키마](docs/architecture/database-schema.md)
- [React App 개요](docs/services/react-app/README.md)
- [Admin App 스펙](ADMIN_SERVICE_SPECIFICATION.md)

### 로드맵 & 히스토리
- [현재 단계 (Phase 3)](docs/roadmap/current-phase.md)
- [Phase 1 완료](docs/roadmap/phase-1-completed.md)
- [Phase 2 완료](docs/roadmap/phase-2-completed.md)
- [v2.4 릴리스 노트](docs/history/versions/v2.4-profile-images.md)
- [전체 버전 히스토리](docs/history/versions/)

### 전체 문서 인덱스
👉 [docs/INDEX.md](docs/INDEX.md)

---

*문서 버전: 2.4*
*최종 수정일: 2025년 11월 22일*
*다음 검토일: 2025년 12월*
