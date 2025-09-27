# 지플랫(G-Plat) 모바일 명함 서비스

리멤버와 아정당을 결합한 혁신적인 모바일 명함 + 부업 플랫폼

## 🚀 빠른 시작

### Docker Compose로 실행하기

```bash
# 1. Docker Compose 실행
docker-compose up -d

# 2. 브라우저에서 접속
http://localhost:8080

# 3. 주요 페이지
- 메인: http://localhost:8080
- 모바일 명함: http://localhost:8080/card/mobile_card.jsp
- 대시보드: http://localhost:8080/admin/dashboard.jsp
- DB 관리: http://localhost:8081 (phpMyAdmin)
```

### 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| Tomcat | 8080 | JSP 웹 서버 |
| MySQL | 3306 | 데이터베이스 |
| Redis | 6379 | 캐시 서버 |
| phpMyAdmin | 8081 | DB 관리 도구 |

### 기본 계정 정보

**데이터베이스 (MySQL)**
- Root: root / gplat2024!
- User: gplat_user / gplat_pass

**Tomcat Manager**
- Admin: admin / admin123

**데모 사용자**
- demo@gplat.kr / password123
- test@gplat.kr / password123

## 📁 프로젝트 구조

```
mobile-business-card/
├── docker-compose.yml       # Docker 구성 파일
├── Dockerfile              # Tomcat 이미지 빌드
├── webapps/               # JSP 웹 애플리케이션
│   └── ROOT/
│       ├── index.jsp      # 메인 페이지
│       ├── card/
│       │   └── mobile_card.jsp  # 모바일 명함
│       └── admin/
│           └── dashboard.jsp    # 대시보드
├── sql/
│   └── init.sql          # DB 초기화 스크립트
└── docs/                 # 문서 및 명세서

```

## 💻 개발 환경

- **Backend**: Java 11, Tomcat 9.0, JSP/Servlet
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **Container**: Docker & Docker Compose

## 🔧 로컬 개발

```bash
# 컨테이너 중지
docker-compose down

# 컨테이너 재시작
docker-compose restart

# 로그 확인
docker-compose logs -f web

# 데이터베이스 접속
docker exec -it gplat-db mysql -u root -pgplat2024!
```

## 📝 주요 기능

### 모바일 명함 (mobile_card.jsp)
- 한글 도메인 표시 (김대리.한국)
- 프로필 정보 표시
- 부업 서비스 카드
- 실시간 방문자 통계
- 공유 기능

### 대시보드 (dashboard.jsp)
- 방문자 통계
- 부업 카드 관리
- 전환율 분석
- 실시간 차트

## 🚧 개발 로드맵

- [x] Docker 환경 구성
- [x] JSP 기본 화면 개발
- [ ] Spring Boot 전환
- [ ] REST API 구축
- [ ] React/Next.js 프론트엔드
- [ ] 콜백 자동화 시스템
- [ ] 결제 시스템 연동

## 📞 문의

- Email: support@gplat.kr
- GitHub: https://github.com/gplat/mobile-business-card