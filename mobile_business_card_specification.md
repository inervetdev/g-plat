# 지플랫 모바일 명함 서비스 - 상세 기능명세서

## 목차
1. [서비스 개요](#서비스-개요)
2. [비즈니스 모델](#비즈니스-모델)
3. [핵심 기능](#핵심-기능)
4. [사용자 기능 상세](#사용자-기능-상세)
5. [부업 연동 시스템](#부업-연동-시스템)
6. [기술 아키텍처](#기술-아키텍처)
7. [화면 설계](#화면-설계)
8. [데이터베이스 설계](#데이터베이스-설계)
9. [API 명세](#api-명세)
10. [보안 및 개인정보](#보안-및-개인정보)
11. [마케팅 전략](#마케팅-전략)
12. [개발 로드맵](#개발-로드맵)

---

## 서비스 개요

### 1.1 서비스명
**지플랫 (G-Plat)** - 개인 부업 포트폴리오 모바일 명함 웹 빌더

### 1.2 서비스 정의
개인이 선택한 다양한 부업을 통합 관리하고 홍보할 수 있는 모바일 명함 서비스로, 기존 '리멤버'의 명함 기능과 '아정당'의 부업 중개 비즈니스 모델을 결합한 혁신적인 플랫폼

### 1.3 서비스 비전
"모든 개인을 1인 기업가로, 명함 하나로 시작하는 부업 생태계"

### 1.4 핵심 가치 제안 (Value Proposition)

#### 사용자 측면
- **본업 홍보**: 전문성 있는 모바일 명함으로 개인 브랜딩
- **부업 관리**: 여러 부업을 하나의 플랫폼에서 통합 관리
- **자동 마케팅**: 콜백 기능으로 자연스러운 고객 접점 확보
- **수익 창출**: 제품 판매/렌탈 수수료를 통한 추가 수입

#### 파트너사 측면
- **효율적 영업 채널**: 개인 영업사원 네트워크 구축
- **낮은 마케팅 비용**: 성과 기반 수수료 모델
- **타겟 마케팅**: 실제 관심 고객에게만 노출

### 1.5 타겟 고객

#### Primary Target
- **연령**: 25-45세
- **직업**: 회사원, 프리랜서, 자영업자
- **특징**: 
  - 부수입에 관심이 있는 직장인
  - 네트워킹이 활발한 영업/마케팅 종사자
  - 다양한 수익원을 원하는 N잡러

#### Secondary Target
- **대학생/취준생**: 경력 관리 및 부업 시작
- **주부**: 시간제 부업 및 지인 네트워크 활용
- **은퇴자**: 경험을 활용한 컨설팅/중개업

---

## 비즈니스 모델

### 2.1 수익 구조

#### 2.1.1 기본 서비스 (Freemium Model)
- **무료 플랜**
  - 기본 명함 기능
  - 부업 카드 3개까지 등록
  - 월 100회 콜백 발송
  - 기본 통계

- **프리미엄 플랜** (월 9,900원)
  - 무제한 부업 카드 등록
  - 무제한 콜백 발송
  - 고급 통계 및 분석
  - 커스텀 도메인
  - 우선 고객 지원

- **비즈니스 플랜** (월 29,900원)
  - 프리미엄 기능 전체
  - 팀 계정 관리 (5명)
  - API 연동
  - 전담 매니저 지원

#### 2.1.2 부업 중개 수수료
- **렌탈 제품**: 월 렌탈료의 5-15% (계약 기간 동안 지속)
- **일반 제품**: 판매가의 3-10% (1회성)
- **보험 상품**: 초회 보험료의 20-30%
- **금융 상품**: 승인 건당 정액 수수료

#### 2.1.3 파트너사 광고 수익
- **배너 광고**: 메인 페이지 노출
- **이벤트 프로모션**: 푸시 알림 및 팝업
- **추천 상품**: AI 기반 맞춤 상품 추천

#### 2.1.4 부가 서비스
- **명함 디자인 템플릿**: 프리미엄 디자인 판매
- **교육 컨텐츠**: 부업 성공 노하우, 영업 스킬 강좌
- **네트워킹 이벤트**: 오프라인 모임 참가비

### 2.2 파트너십 전략

#### 2.2.1 제휴 카테고리
1. **생활가전 렌탈**
   - 정수기/공기청정기: 코웨이, LG전자, 청호나이스
   - 비데/매트리스: 노비타, 에이스침대
   
2. **차량 관련**
   - 자동차 리스/렌탈: 롯데렌탈, SK렌터카
   - 중고차 매매: K카, 엔카
   
3. **보험/금융**
   - 보험: 삼성생명, KB손해보험, 메리츠화재
   - 대출: 카카오뱅크, 토스
   
4. **교육/자격증**
   - 온라인 강의: 클래스101, 탈잉
   - 자격증: 한국산업인력공단 제휴

#### 2.2.2 파트너 혜택
- 초기 수수료 할인 (첫 3개월 50% 할인)
- 전용 랜딩 페이지 제공
- 실시간 리드 전달 시스템
- 월간 성과 리포트

### 2.3 경쟁 우위

#### 기존 서비스 대비 차별점

| 구분 | 리멤버 | 아정당 | 지플랫 |
|------|--------|--------|--------|
| 주요 기능 | 명함 관리 | 부업 중개 | 명함 + 부업 통합 |
| 수익 모델 | 구독료 | 중개 수수료 | 구독료 + 수수료 |
| 타겟 | B2B 중심 | 부업 희망자 | B2B + B2C 통합 |
| 콜백 기능 | X | X | O (자동화) |
| 한글 도메인 | X | X | O |
| 부업 포트폴리오 | X | 단일 부업 | 다중 부업 관리 |

---

## 핵심 기능

### 3.1 간편한 온보딩

#### 3.1.1 3단계 가입 프로세스
1. **기본 정보 입력** (30초)
   - 이름, 전화번호 (카카오/네이버 연동 가능)
   - 한글 도메인 자동 생성 (예: https://홍길동.한국)

2. **명함 정보 설정** (1분)
   - 직업, 회사, 직급
   - 프로필 사진 업로드
   - 소개 문구 작성

3. **부업 선택** (2분)
   - 관심 카테고리 선택
   - 추천 부업 리스트에서 선택
   - 즉시 활성화

#### 3.1.2 AI 기반 프로필 최적화
- 업종별 최적화된 소개 문구 자동 생성
- 프로필 사진 자동 보정
- 키워드 기반 SEO 최적화

### 3.2 한글 개인 도메인

#### 3.2.1 도메인 시스템
- **기본 도메인**: https://[이름].한국
- **커스텀 도메인**: https://[닉네임].한국
- **서브 도메인**: https://[이름].지플랫.한국

#### 3.2.2 도메인 관리
- 실시간 도메인 가용성 체크
- 도메인 변경 (월 1회 무료)
- QR코드 자동 생성 및 연동

### 3.3 모바일 최적화 UI/UX

#### 3.3.1 반응형 디자인
- 모바일 퍼스트 설계
- 터치 최적화 인터페이스
- 스와이프 제스처 지원

#### 3.3.2 카드형 레이아웃
- 직관적인 정보 계층 구조
- 한 눈에 보이는 핵심 정보
- 접을 수 있는 상세 정보

### 3.4 콜백 자동화 시스템

#### 3.4.1 Zero-Touch 프로세스
```
[통화 종료] → [번호 자동 감지] → [SMS 자동 발송] → [방문 추적]
```

#### 3.4.2 발송 옵션
- **즉시 발송**: 통화 종료 직후
- **지연 발송**: 설정한 시간 후 (5분, 10분, 30분)
- **스마트 발송**: AI가 최적 시간 판단

#### 3.4.3 메시지 커스터마이징
- 상황별 템플릿 (첫 만남, 미팅 후, 계약 후)
- 개인화 변수 삽입 (이름, 회사명, 논의 내용)
- A/B 테스트 기능

### 3.5 부업 카드 관리

#### 3.5.1 카드 생성 및 편집
- 드래그 앤 드롭 에디터
- 템플릿 갤러리 (100+ 디자인)
- 실시간 미리보기

#### 3.5.2 카드 구성 요소
- 제목 및 설명
- 이미지/동영상
- CTA 버튼 (상담신청, 구매하기 등)
- 가격 정보 및 프로모션
- 고객 후기

#### 3.5.3 카드 관리 기능
- 순서 변경 (드래그 앤 드롭)
- 활성/비활성 토글
- 기간 설정 (프로모션용)
- 복제 및 템플릿 저장

---

## 사용자 기능 상세

### 4.1 개인 명함 페이지

#### 4.1.1 페이지 구조
```
https://홍길동.한국
│
├── 헤더 섹션
│   ├── 프로필 이미지
│   ├── 이름 및 직함
│   ├── 회사 정보
│   └── 연락처 버튼 (전화, 메시지, 이메일)
│
├── 소개 섹션
│   ├── 자기소개
│   ├── 경력 하이라이트
│   └── 핵심 역량 태그
│
├── SNS 연동 섹션
│   ├── 인스타그램
│   ├── 링크드인
│   ├── 유튜브
│   └── 블로그/웹사이트
│
├── 부업 포트폴리오 섹션
│   ├── 부업 카드 리스트
│   ├── 카테고리 필터
│   └── 추천 상품 하이라이트
│
├── 고객 후기 섹션
│   ├── 평점 및 리뷰
│   └── 성공 사례
│
└── 하단 액션 섹션
    ├── 명함 저장하기
    ├── 공유하기
    └── 1:1 문의하기
```

#### 4.1.2 명함 커스터마이징
- **테마 선택**: 20+ 프리셋 테마
- **색상 설정**: 브랜드 컬러 적용
- **폰트 선택**: 10+ 한글 최적화 폰트
- **레이아웃**: 3가지 레이아웃 (클래식, 모던, 미니멀)
- **배경**: 이미지, 그라데이션, 패턴

### 4.2 대시보드

#### 4.2.1 홈 대시보드
- **오늘의 요약**
  - 페이지 방문자 수
  - 신규 문의/상담 요청
  - 수익 현황
  
- **빠른 액션**
  - 콜백 메시지 발송
  - 새 부업 카드 추가
  - 이벤트 등록

- **실시간 알림**
  - 새로운 방문자
  - 상담 요청
  - 계약 성사

#### 4.2.2 통계 및 분석
- **방문자 분석**
  - 일/주/월별 트래픽
  - 유입 경로 (직접, SNS, 콜백)
  - 체류 시간 및 이탈률
  
- **부업 카드 성과**
  - 카드별 조회수/클릭률
  - 전환율 및 수익
  - A/B 테스트 결과
  
- **수익 분석**
  - 부업별 수익 현황
  - 월별 수익 추이
  - 예상 수익 (파이프라인)

### 4.3 부업 마켓플레이스

#### 4.3.1 부업 탐색
- **카테고리별 브라우징**
  - 인기 부업 TOP 10
  - 신규 파트너사 제품
  - 높은 수수료 상품
  
- **필터링 옵션**
  - 수수료율
  - 카테고리
  - 난이도
  - 예상 수익

- **상세 정보 확인**
  - 제품/서비스 소개
  - 수수료 구조
  - 판매 팁 및 가이드
  - 성공 사례

#### 4.3.2 부업 신청 및 관리
- 원클릭 신청
- 승인 상태 확인
- 교육 자료 다운로드
- 전용 지원 채널

### 4.4 커뮤니케이션 도구

#### 4.4.1 고객 관리 (CRM)
- **연락처 관리**
  - 자동 저장 (콜백 발송 시)
  - 태그 및 메모 기능
  - 상담 이력 관리
  
- **팔로우업 관리**
  - 알림 설정
  - 자동 메시지 예약
  - 상담 단계 관리

#### 4.4.2 메시징 시스템
- **1:1 채팅**
  - 실시간 상담
  - 파일/이미지 전송
  - 상담 내역 저장
  
- **대량 발송**
  - 그룹 메시지
  - 개인화 변수
  - 발송 스케줄링

### 4.5 교육 및 지원

#### 4.5.1 교육 컨텐츠
- **온보딩 가이드**
  - 서비스 활용법
  - 부업 시작 가이드
  - 성공 전략
  
- **전문 교육**
  - 영업 스킬
  - 디지털 마케팅
  - 고객 관리

#### 4.5.2 커뮤니티
- **지식 공유**
  - 성공 사례 공유
  - Q&A 포럼
  - 팁 & 트릭
  
- **네트워킹**
  - 지역별 모임
  - 업종별 그룹
  - 멘토링 프로그램

---

## 부업 연동 시스템

### 5.1 파트너사 연동

#### 5.1.1 API 연동 구조
```
지플랫 플랫폼
     ↓
파트너사 API Gateway
     ↓
┌─────────┬─────────┬─────────┐
│ 상품정보 │ 주문처리 │ 정산관리 │
└─────────┴─────────┴─────────┘
```

#### 5.1.2 실시간 데이터 동기화
- 상품 정보 업데이트 (가격, 재고, 프로모션)
- 주문 상태 추적
- 수수료 정산 현황

### 5.2 리드 생성 및 전달

#### 5.2.1 리드 수집
- 고객 정보 수집 폼
- 관심도 스코어링
- 자동 검증 (중복, 유효성)

#### 5.2.2 리드 전달
- 실시간 파트너사 전송
- 리드 품질 보증
- 전환 추적

### 5.3 수익 정산 시스템

#### 5.3.1 정산 프로세스
```
[계약 성사] → [파트너사 확인] → [수수료 계산] → [정산 승인] → [지급]
```

#### 5.3.2 정산 주기
- **일반 상품**: 월 1회 (매월 10일)
- **렌탈 상품**: 월 1회 (지속)
- **즉시 정산**: 프리미엄 회원 (수수료 3%)

#### 5.3.3 정산 관리
- 실시간 수익 확인
- 정산 내역 상세
- 세금계산서 발행

### 5.4 성과 추적

#### 5.4.1 추적 매트릭스
- 노출 수 (Impression)
- 클릭률 (CTR)
- 전환율 (Conversion)
- 평균 수익 (Revenue per User)

#### 5.4.2 어트리뷰션
- 라스트 클릭
- 멀티 터치
- 기여도 분석

---

## 기술 아키텍처

### 6.1 시스템 구성도

```
┌─────────────── Frontend ───────────────┐
│                                         │
│  Web App          Mobile Web    Admin  │
│  (React)          (React)       Panel  │
│                                         │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────── API Gateway ─────────────┐
│                                         │
│         Kong / AWS API Gateway         │
│                                         │
└────────────────┬────────────────────────┘
                 │
     ┌───────────┼───────────┐
     ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌─────────┐
│  User   │ │Business │ │Partner  │
│Service  │ │Service  │ │Service  │
└─────────┘ └─────────┘ └─────────┘
     ↓           ↓           ↓
┌──────────── Database Layer ─────────────┐
│                                         │
│   PostgreSQL    Redis    Elasticsearch │
│                                         │
└──────────────────────────────────────────┘
     ↓
┌──────────── Infrastructure ─────────────┐
│                                         │
│     AWS / Naver Cloud Platform         │
│                                         │
└──────────────────────────────────────────┘
```

### 6.2 기술 스택

#### 6.2.1 Frontend
- **Web Application**
  - React 18.x
  - Next.js 14.x (SSR/SSG)
  - TypeScript
  - Tailwind CSS
  - Redux Toolkit
  
- **Mobile Web**
  - Progressive Web App (PWA)
  - React Native Web
  - Capacitor (네이티브 기능)

#### 6.2.2 Backend
- **API Server**
  - Node.js + Express / Nest.js
  - GraphQL (Apollo Server)
  - REST API
  
- **Microservices**
  - User Service: 사용자 관리
  - Business Service: 부업 카드, 리드
  - Partner Service: 파트너사 연동
  - Notification Service: 알림, 콜백
  - Analytics Service: 통계, 분석

#### 6.2.3 Database
- **Primary DB**: PostgreSQL 15.x
- **Cache**: Redis 7.x
- **Search**: Elasticsearch 8.x
- **File Storage**: AWS S3 / NCP Object Storage

#### 6.2.4 Infrastructure
- **Cloud**: AWS / Naver Cloud Platform
- **Container**: Docker, Kubernetes
- **CI/CD**: GitHub Actions, ArgoCD
- **Monitoring**: Prometheus, Grafana
- **APM**: New Relic / Datadog

### 6.3 핵심 기술 구현

#### 6.3.1 한글 도메인 시스템
```javascript
// 한글 도메인 변환 및 라우팅
class KoreanDomainService {
  async registerDomain(username) {
    const punycode = this.toPunycode(username);
    const available = await this.checkAvailability(punycode);
    
    if (available) {
      await this.createSubdomain(username);
      await this.updateDNS(punycode);
      return `https://${username}.한국`;
    }
  }
  
  toPunycode(korean) {
    // IDN 변환 로직
    return punycode.encode(korean);
  }
}
```

#### 6.3.2 콜백 자동화
```javascript
// 통화 종료 감지 및 SMS 발송
class CallbackService {
  async onCallEnded(phoneNumber) {
    const user = await this.getUserByPhone(phoneNumber);
    const message = await this.generateMessage(user);
    
    // 지연 발송 로직
    const delay = user.settings.callbackDelay || 0;
    
    setTimeout(() => {
      this.sendSMS(phoneNumber, message);
      this.trackCallback(user.id, phoneNumber);
    }, delay * 1000);
  }
}
```

#### 6.3.3 실시간 동기화
```javascript
// WebSocket 기반 실시간 업데이트
class RealtimeService {
  constructor() {
    this.io = new Server();
    this.subscribeToEvents();
  }
  
  subscribeToEvents() {
    eventBus.on('card.updated', (data) => {
      this.io.to(data.userId).emit('card:update', data);
    });
    
    eventBus.on('lead.created', (data) => {
      this.io.to(data.userId).emit('lead:new', data);
    });
  }
}
```

### 6.4 보안 및 성능

#### 6.4.1 보안 조치
- **인증/인가**
  - JWT + Refresh Token
  - OAuth 2.0 (소셜 로그인)
  - 2단계 인증 (2FA)
  
- **데이터 보호**
  - TLS 1.3 (전송 암호화)
  - AES-256 (저장 암호화)
  - PII 마스킹
  
- **보안 감사**
  - OWASP Top 10 대응
  - 정기 보안 점검
  - 침투 테스트

#### 6.4.2 성능 최적화
- **프론트엔드**
  - Code Splitting
  - Lazy Loading
  - Image Optimization (WebP, AVIF)
  - CDN 활용
  
- **백엔드**
  - 캐싱 전략 (Redis)
  - 데이터베이스 인덱싱
  - 쿼리 최적화
  - 로드 밸런싱
  
- **확장성**
  - 수평 확장 (Auto Scaling)
  - 마이크로서비스 아키텍처
  - 이벤트 기반 아키텍처

---

## 화면 설계

### 7.1 주요 화면 플로우

```
[랜딩 페이지]
     ↓
[회원가입/로그인]
     ↓
[온보딩 (명함 설정)]
     ↓
[대시보드]
     ├── [명함 관리]
     ├── [부업 마켓]
     ├── [통계 분석]
     ├── [고객 관리]
     └── [설정]
```

### 7.2 화면별 상세 설계

#### 7.2.1 대시보드
```
┌─────────────────────────────────────┐
│         지플랫 대시보드              │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐        │
│  │ 오늘 방문│  │ 신규문의 │        │
│  │   128명  │  │    5건    │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌─────────────────────────┐       │
│  │    주간 방문 트렌드       │       │
│  │    [그래프]              │       │
│  └─────────────────────────┘       │
│                                     │
│  ┌─────────────────────────┐       │
│  │    인기 부업 카드 TOP 3   │       │
│  │    1. 정수기 렌탈        │       │
│  │    2. 자동차 보험        │       │
│  │    3. 휴대폰 요금제      │       │
│  └─────────────────────────┘       │
│                                     │
│  [명함 편집] [부업 추가] [공유]     │
└─────────────────────────────────────┘
```

#### 7.2.2 명함 편집 화면
```
┌─────────────────────────────────────┐
│         명함 편집                    │
├─────────────────────────────────────┤
│  ┌─────────────────────────┐       │
│  │    [프로필 이미지]        │       │
│  │    홍길동                │       │
│  │    마케팅 매니저          │       │
│  │    ABC 컴퍼니            │       │
│  └─────────────────────────┘       │
│                                     │
│  기본 정보                          │
│  ├─ 이름: [___________]            │
│  ├─ 직함: [___________]            │
│  ├─ 회사: [___________]            │
│  └─ 연락처: [_________]            │
│                                     │
│  소개 문구                          │
│  ┌─────────────────────────┐       │
│  │                         │       │
│  └─────────────────────────┘       │
│                                     │
│  테마 선택                          │
│  [클래식] [모던] [미니멀]           │
│                                     │
│  [미리보기]  [저장]                 │
└─────────────────────────────────────┘
```

#### 7.2.3 부업 카드 관리
```
┌─────────────────────────────────────┐
│         부업 카드 관리               │
├─────────────────────────────────────┤
│  [+ 새 카드 추가]                   │
│                                     │
│  ┌─────────────────────────┐       │
│  │  정수기 렌탈              │ ≡     │
│  │  조회: 523 | 클릭: 45    │       │
│  │  [ON/OFF] [수정] [삭제]  │       │
│  └─────────────────────────┘       │
│                                     │
│  ┌─────────────────────────┐       │
│  │  자동차 보험              │ ≡     │
│  │  조회: 412 | 클릭: 38    │       │
│  │  [ON/OFF] [수정] [삭제]  │       │
│  └─────────────────────────┘       │
│                                     │
│  ┌─────────────────────────┐       │
│  │  온라인 강의              │ ≡     │
│  │  조회: 289 | 클릭: 22    │       │
│  │  [ON/OFF] [수정] [삭제]  │       │
│  └─────────────────────────┘       │
│                                     │
│  [순서 저장]                        │
└─────────────────────────────────────┘
```

### 7.3 모바일 반응형 디자인

#### 7.3.1 브레이크포인트
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

#### 7.3.2 터치 최적화
- 최소 터치 영역: 44x44px
- 스와이프 제스처 지원
- 풀다운 새로고침
- 무한 스크롤

---

## 데이터베이스 설계

### 8.1 주요 테이블 구조

#### 8.1.1 사용자 관련
```sql
-- users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(100) NOT NULL,
  nickname VARCHAR(50) UNIQUE,
  domain_name VARCHAR(100) UNIQUE,
  profile_image_url TEXT,
  subscription_tier ENUM('free', 'premium', 'business') DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- user_profiles 테이블
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  company VARCHAR(255),
  position VARCHAR(100),
  bio TEXT,
  address TEXT,
  social_links JSONB,
  theme_settings JSONB,
  callback_settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 8.1.2 부업 카드 관련
```sql
-- side_job_cards 테이블
CREATE TABLE side_job_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  partner_product_id UUID REFERENCES partner_products(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text VARCHAR(100),
  cta_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  view_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- partner_products 테이블
CREATE TABLE partner_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  category VARCHAR(100),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  commission_type ENUM('percentage', 'fixed') NOT NULL,
  commission_value DECIMAL(10, 2),
  product_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 8.1.3 리드 및 수익 관련
```sql
-- leads 테이블
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  card_id UUID REFERENCES side_job_cards(id),
  customer_name VARCHAR(100),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  status ENUM('new', 'contacted', 'converted', 'lost') DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- commissions 테이블
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  lead_id UUID REFERENCES leads(id),
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'approved', 'paid') DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8.2 인덱스 전략

```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_domain ON users(domain_name);
CREATE INDEX idx_cards_user_active ON side_job_cards(user_id, is_active);
CREATE INDEX idx_leads_user_status ON leads(user_id, status);
CREATE INDEX idx_commissions_user_status ON commissions(user_id, status);
```

---

## API 명세

### 9.1 RESTful API

#### 9.1.1 인증 API
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/verify
```

#### 9.1.2 사용자 API
```
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/users/account
POST   /api/users/domain/check
PUT    /api/users/domain
```

#### 9.1.3 명함 API
```
GET  /api/cards
POST /api/cards
GET  /api/cards/:id
PUT  /api/cards/:id
DELETE /api/cards/:id
PUT  /api/cards/reorder
```

#### 9.1.4 부업 API
```
GET  /api/sidejobs/marketplace
GET  /api/sidejobs/categories
POST /api/sidejobs/apply
GET  /api/sidejobs/my-jobs
PUT  /api/sidejobs/:id/toggle
```

#### 9.1.5 리드 API
```
GET  /api/leads
POST /api/leads
GET  /api/leads/:id
PUT  /api/leads/:id/status
POST /api/leads/:id/notes
```

### 9.2 GraphQL API

#### 9.2.1 Schema 정의
```graphql
type User {
  id: ID!
  email: String!
  name: String!
  domain: String!
  profile: UserProfile
  cards: [SideJobCard!]!
  stats: UserStats
}

type SideJobCard {
  id: ID!
  title: String!
  description: String
  imageUrl: String
  viewCount: Int!
  clickCount: Int!
  isActive: Boolean!
  product: PartnerProduct
}

type Query {
  me: User
  card(id: ID!): SideJobCard
  marketplace(category: String, limit: Int): [PartnerProduct!]!
  analytics(period: AnalyticsPeriod!): Analytics
}

type Mutation {
  updateProfile(input: UpdateProfileInput!): User
  createCard(input: CreateCardInput!): SideJobCard
  updateCard(id: ID!, input: UpdateCardInput!): SideJobCard
  deleteCard(id: ID!): Boolean
}
```

### 9.3 Webhook API

#### 9.3.1 파트너사 웹훅
```
POST /webhooks/partner/lead-status
POST /webhooks/partner/commission-approved
POST /webhooks/partner/product-updated
```

#### 9.3.2 결제 웹훅
```
POST /webhooks/payment/success
POST /webhooks/payment/failed
POST /webhooks/payment/refund
```

---

## 보안 및 개인정보

### 10.1 개인정보 보호

#### 10.1.1 수집 항목
- **필수**: 이름, 전화번호, 이메일
- **선택**: 회사, 직급, 주소, SNS 계정

#### 10.1.2 보관 및 파기
- 보관 기간: 회원 탈퇴 후 30일
- 파기 방법: 복구 불가능한 방법으로 삭제
- 법적 보관 의무: 전자상거래법에 따른 5년 보관

### 10.2 보안 정책

#### 10.2.1 접근 제어
- Role-Based Access Control (RBAC)
- IP 화이트리스트 (관리자)
- Rate Limiting

#### 10.2.2 감사 로그
- 모든 API 호출 기록
- 개인정보 접근 로그
- 이상 행위 탐지

### 10.3 규정 준수

- 개인정보보호법 (PIPA)
- 정보통신망법
- 전자상거래법
- GDPR (EU 고객 대상)

---

## 마케팅 전략

### 11.1 고객 획득 전략

#### 11.1.1 초기 시장 진입
1. **베타 테스트**: 100명 한정 무료 이용
2. **얼리버드 혜택**: 평생 50% 할인
3. **추천 프로그램**: 추천 시 1개월 무료

#### 11.1.2 그로스 해킹
- **바이럴 루프**: 명함 공유 시 자연스러운 서비스 노출
- **네트워크 효과**: 사용자 증가 = 가치 증가
- **콜백 기능**: 자동 마케팅 도구

### 11.2 파트너십 마케팅

#### 11.2.1 B2B 제휴
- 프랜차이즈 본사와 제휴
- 보험사 영업 조직 활용
- MLM 기업과 협력

#### 11.2.2 인플루언서 마케팅
- 부업 관련 유튜버 협업
- 자기계발 인플루언서 활용
- 성공 사례 콘텐츠 제작

### 11.3 콘텐츠 마케팅

#### 11.3.1 SEO 전략
- 부업 관련 키워드 타겟팅
- 블로그 운영 (성공 사례, 팁)
- 한글 도메인 SEO 최적화

#### 11.3.2 소셜 미디어
- 인스타그램: 비주얼 콘텐츠
- 링크드인: B2B 네트워킹
- 유튜브: 교육 콘텐츠

---

## 개발 로드맵

### 12.1 Phase 1: MVP (3개월)

#### Month 1
- [ ] 기본 회원 시스템 구축
- [ ] 명함 페이지 생성 기능
- [ ] 한글 도메인 시스템 구현

#### Month 2
- [ ] 부업 카드 관리 기능
- [ ] 기본 통계 대시보드
- [ ] 모바일 최적화

#### Month 3
- [ ] 콜백 자동화 시스템
- [ ] 3개 파트너사 연동
- [ ] 베타 테스트 시작

### 12.2 Phase 2: 확장 (3개월)

#### Month 4-6
- [ ] 고급 분석 기능
- [ ] CRM 시스템 구축
- [ ] 10개 파트너사 확대
- [ ] 결제 시스템 구축
- [ ] 프리미엄 기능 출시

### 12.3 Phase 3: 성장 (6개월)

#### Month 7-12
- [ ] AI 추천 시스템
- [ ] 네이티브 앱 개발
- [ ] 해외 시장 진출 준비
- [ ] B2B 엔터프라이즈 버전
- [ ] API 오픈 플랫폼

### 12.4 KPI 목표

| 지표 | 3개월 | 6개월 | 12개월 |
|------|-------|-------|--------|
| 가입자 수 | 1,000 | 10,000 | 100,000 |
| MAU | 500 | 5,000 | 50,000 |
| 유료 전환율 | 5% | 10% | 15% |
| 월 거래액 | 1천만원 | 1억원 | 10억원 |
| 파트너사 | 5개 | 20개 | 50개 |

---

## 부록

### A. 용어 정의

| 용어 | 설명 |
|------|------|
| 부업 카드 | 사용자가 홍보하는 파트너사 상품/서비스 |
| 콜백 | 통화 종료 후 자동 SMS 발송 기능 |
| 리드 | 잠재 고객 정보 |
| 전환 | 리드가 실제 계약으로 이어진 경우 |
| 한글 도메인 | .한국 도메인을 활용한 개인 URL |

### B. 참고 자료

- 리멤버 서비스 분석
- 아정당 비즈니스 모델 연구
- 한글 도메인 기술 문서
- PWA 구현 가이드
- 부업 시장 트렌드 리포트

### C. 연락처

- 프로젝트 매니저: PM@지플랫.한국
- 기술 지원: tech@지플랫.한국
- 파트너십 문의: partner@지플랫.한국
- 고객 지원: support@지플랫.한국

---

*본 문서는 지플랫 모바일 명함 서비스의 상세 기능명세서입니다.*
*작성일: 2025년 1월*
*버전: 1.0*