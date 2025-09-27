# CLAUDE.md (한글판)

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 필요한 가이드를 제공합니다.

## 프로젝트 개요

지플랫(G-Plat) 모바일 명함 서비스 - LinkedIn 스타일의 프로페셔널 네트워킹과 부업 포트폴리오 관리를 결합한 모바일 명함 플랫폼입니다. 한글 도메인 기반 개인 브랜딩(예: 김대리.한국)과 고객 참여를 위한 자동 콜백 시스템이 특징입니다.

## 개발 명령어

### Node.js 개발
```bash
# 의존성 설치
npm install

# 로컬 서버 시작 (Express)
npm start
# 또는 자동 재시작 개발 모드
npm run dev

# 서버는 http://localhost:8080 에서 실행됩니다
```

### Docker 개발
```bash
# 모든 서비스 시작 (Tomcat, MySQL, Redis, phpMyAdmin)
docker-compose up -d

# 서비스 중지
docker-compose down

# 로그 확인
docker-compose logs -f web

# 서비스 접속
# - 웹: http://localhost:8080
# - phpMyAdmin: http://localhost:8081
# - MySQL: localhost:3306
```

### 데이터베이스 접속
```bash
# MySQL 컨테이너 접속
docker exec -it gplat-db mysql -u root -pgplat2024!

# 데이터베이스 인증 정보:
# Root: root / gplat2024!
# User: gplat_user / gplat_pass
```

### 공개 접속 설정
```bash
# Windows 배치 스크립트 사용 가능:
run-local.bat          # 로컬 서버 시작
start-public-access.bat # ngrok 터널 설정
setup-firewall.bat     # 방화벽 구성
setup-ngrok.ps1        # PowerShell ngrok 설정
```

## 아키텍처

### 현재 상태
프로젝트는 두 가지 병렬 구현을 가지고 있습니다:

1. **Node.js/Express 서버** (`standalone-server.js`)
   - 정적 HTML을 제공하는 간단한 Express 서버
   - 템플릿 변수를 치환하여 JSP 기능 시뮬레이션
   - 로컬 개발의 주요 진입점

2. **JSP/Tomcat 애플리케이션** (webapps/ROOT/)
   - 전통적인 JSP 아키텍처
   - Docker 배포용으로 설계
   - 여러 카드 템플릿 (simple, professional, trendy, apple 테마)
   - 각 테마별 관리자 대시보드

### 디렉토리 구조
- `webapps/ROOT/` - JSP 웹 애플리케이션
  - `card/` - 모바일 명함 페이지 (여러 테마)
  - `admin/` - 대시보드 페이지 (일치하는 테마)
  - `WEB-INF/` - Java 웹 구성
- `sql/init.sql` - 데이터베이스 초기화 스크립트
- `assets/` - 정적 리소스
- 루트의 정적 HTML 프로토타입 (gplat_*.html 파일)

### 핵심 기술
- **프론트엔드**: 임베디드 JavaScript가 포함된 JSP 페이지, Next.js로 마이그레이션 계획 중
- **백엔드**: 개발용 Node.js/Express, 프로덕션용 Tomcat
- **데이터베이스**: Redis 캐시를 포함한 MySQL 8.0
- **계획된 스택**: Next.js 14 + TypeScript + Supabase (PRD 기준)

## 중요 컨텍스트

### 비즈니스 모델
- **Freemium SaaS**: 기본 무료 티어, 프리미엄 (월 9,900원), 비즈니스 (월 29,900원)
- **부업 통합**: 사용자가 여러 부업을 위한 "명함 카드"를 추가 가능
- **자동 콜백**: 통화 후 자동으로 명함 링크가 포함된 SMS 전송
- **한글 도메인**: 각 사용자는 개인화된 .한국 도메인 획득

### 개발 우선순위 (PRD 기준)
1. 핵심 기능을 갖춘 MVP 완성
2. 사용자 온보딩 최적화 (3분 내 설정)
3. 한글 도메인 시스템 구현
4. 콜백 자동화 시스템
5. 실시간 분석 대시보드

### 현재 이슈
- npm 의존성 미설치 (express, nodemon 누락)
- Git 저장소 초기화 안 됨
- 이중 아키텍처 (JSP + Node.js) 통합 필요

## 데이터베이스 스키마
MySQL 데이터베이스 (`gplat`)는 사용자, 명함, 부업 카드, 분석 및 콜백 관리를 위한 테이블을 포함합니다. 스키마 초기화는 `sql/init.sql`에 있습니다.

## 보안 고려사항
- Supabase Auth를 통한 인증 계획
- README.md의 현재 데모 인증 정보는 교체 필요
- 데이터베이스 비밀번호가 docker-compose.yml에 하드코딩됨
- 아직 시크릿 관리 시스템이 없음