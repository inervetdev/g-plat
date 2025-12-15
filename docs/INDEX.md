---
title: "G-Plat 문서 인덱스"
category: "documentation"
tier: 1
status: "active"
last_updated: "2025-12-15"
---

# G-Plat 문서 인덱스

## 🔥 Hot Docs (매 세션 로드)
Claude Code가 항상 읽는 필수 문서:
- [CLAUDE.md](../CLAUDE.md) - 개발 가이드 (목표: 150줄)
- [prd.md](../prd.md) - 제품 요구사항 (목표: 200줄)

## 📋 Tier 2: 서비스별 문서
특정 서비스 작업 시 참조:

### React App (사용자 앱)
- [개요](services/react-app/README.md)
- [기능 목록](services/react-app/FEATURES.md)
- [개발 환경](services/react-app/DEVELOPMENT.md)
- [배포 가이드](services/react-app/DEPLOYMENT.md)

### Admin App (관리자 앱)
- [개요](services/admin-app/README.md)
- [상세 스펙](services/admin-app/SPECIFICATION.md)
- [로드맵](services/admin-app/ROADMAP.md)
- [제공형 부가명함](services/admin-app/PROVIDED_SIDEJOBS.md)

## 🔧 Tier 3: 기능별 문서
특정 기능 구현/디버깅 시:

### 인증 시스템
- [개요](features/authentication/README.md)
- [이메일 OTP 인증](features/authentication/email-otp.md) ⭐
- [소셜 로그인](features/authentication/social-login.md) (예정)
- [OAuth 설정](features/authentication/oauth-setup.md) (예정)

### 명함 관리
- [개요](features/business-cards/README.md)
- [CRUD 작업](features/business-cards/crud-operations.md)
- [커스텀 URL](features/business-cards/custom-url.md)
- [테마 시스템](features/business-cards/themes.md)
- [테마 표준 규격](features/business-cards/THEME_STANDARD.md) ⭐ NEW
- [프로필 이미지](features/business-cards/profile-images.md)

### 부가명함
- [개요](features/sidejob-cards/README.md)
- [카테고리 시스템](features/sidejob-cards/category-system.md)
- [드래그 앤 드롭](features/sidejob-cards/drag-drop.md)
- [Storage 통합](features/sidejob-cards/storage-integration.md)

### QR 시스템
- [개요](features/qr-system/README.md) ⭐ NEW (스캔 추적 완성)
- [설정 가이드](features/qr-system/setup-guide.md) (예정)
- [Edge Function](features/qr-system/edge-function.md) (예정)
- [분석 기능](features/qr-system/analytics.md) (예정)

### 첨부파일
- [파일 업로드](features/attachments/file-upload.md)
- [YouTube 통합](features/attachments/youtube-integration.md)
- [프로덕션 설정](features/attachments/production-setup.md)

### 지도/주소
- [Naver Maps 설정](features/maps/naver-maps-setup.md)
- [주소 검색](features/maps/address-search.md)
- [구현 가이드](features/maps/implementation.md)

### 콜백 시스템
- [기획서](features/callback/README.md) ⭐ NEW (통화 후 자동 SMS)

### 신고관리
- [기획서](features/reports/README.md) ⭐ NEW (콘텐츠 모더레이션)

### 분석/통계
- [대시보드](features/analytics/dashboard.md)
- [방문자 추적](features/analytics/visitor-tracking.md)
- [QR 분석](features/analytics/qr-analytics.md)

## 🏗️ Tier 4: 인프라 & 히스토리
설정, 보안, 변경 이력:

### 아키텍처
- [개요](architecture/overview.md)
- [데이터베이스 스키마](architecture/database-schema.md)
- [기술 스택](architecture/tech-stack.md)
- [기술 결정](architecture/tech-decisions.md)

### 인프라

#### Supabase
- [개요](infrastructure/supabase/README.md)
- [MCP 설정](infrastructure/supabase/mcp-setup.md)
- [로컬 개발](infrastructure/supabase/local-development.md)
- [RLS 정책](infrastructure/supabase/rls-policies.md)
- [마이그레이션](infrastructure/supabase/migrations.md)

#### Vercel
- [배포 가이드](infrastructure/vercel/deployment.md)
- [환경 설정](infrastructure/vercel/environment-setup.md)
- [CI/CD](infrastructure/vercel/ci-cd.md)

#### 보안
- [체크리스트](infrastructure/security/checklist.md)
- [인증 보안](infrastructure/security/authentication.md)
- [데이터 보호](infrastructure/security/data-protection.md)

### 비즈니스
- [제품 비전](business/product-vision.md)
- [비즈니스 모델](business/business-model.md)
- [타겟 사용자](business/target-users.md)
- [성공 지표](business/success-metrics.md)
- [리스크 관리](business/risk-management.md)

### 로드맵
- [현재 Phase](roadmap/current-phase.md)
- [Phase 1 완료](roadmap/phase-1-completed.md)
- [Phase 2 완료](roadmap/phase-2-completed.md)
- [Phase 3 계획](roadmap/phase-3-planned.md)
- [장기 비전](roadmap/long-term-vision.md)

### 변경 이력
- [2025년 12월](history/changelog/2025-12.md) ⭐ NEW
- [2025년 11월](history/changelog/2025-11.md)
- [2025년 10월](history/changelog/2025-10.md)
- [2025년 9월](history/changelog/2025-09.md)

### 버전별 릴리스
- [v2.4 - 프로필 이미지 시스템](history/versions/v2.4-profile-images.md)
- [v2.0 - React Compiler 최적화](history/versions/v2.0-react-compiler.md)
- [v1.10 - Google OAuth](history/versions/v1.10-google-oauth.md)
- [전체 버전 이력](history/versions/)

## 📊 문서 통계
- **Hot Docs**: 2개 (목표: 350줄)
- **Service Docs**: 8개
- **Feature Docs**: 예상 25개+
- **Infrastructure Docs**: 예상 11개+
- **Last Updated**: 2025-12-14

## 📘 참고 문서
- [문서 작성 표준안](../DOCUMENTATION_STANDARD.md)
- [기여 가이드](../CONTRIBUTING.md) (예정)
