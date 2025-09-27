<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<%
    // 사용자 정보 (실제로는 DB에서 조회)
    request.setAttribute("userName", "김대리");
    request.setAttribute("userTitle", "마케팅 매니저");
    request.setAttribute("userCompany", "ABC 컴퍼니");
    request.setAttribute("userPhone", "010-1234-5678");
    request.setAttribute("userEmail", "kim@example.com");
    request.setAttribute("userDomain", "김대리.한국");
    request.setAttribute("userAddress", "서울시 강남구 테헤란로 123");
    request.setAttribute("userBio", "10년차 디지털 마케팅 전문가입니다. 성과 중심의 마케팅 전략을 제공합니다.");

    // 방문자 통계 (실제로는 DB에서 조회)
    request.setAttribute("todayVisitors", 128);
    request.setAttribute("totalVisitors", 5234);
    request.setAttribute("cardClicks", 89);
%>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="${userName}의 모바일 명함 - 지플랫">
    <meta property="og:title" content="${userName} - ${userTitle}">
    <meta property="og:description" content="${userCompany} | ${userBio}">
    <meta property="og:image" content="/resources/images/profile/${userName}.jpg">
    <meta property="og:url" content="https://${userDomain}">

    <title>${userName}.한국 - 지플랫 모바일 명함</title>

    <!-- CSS -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }

        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --primary-light: #818cf8;
            --secondary: #ec4899;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --dark: #1f2937;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
            --white: #ffffff;
            --gradient-primary: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            --gradient-secondary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            --radius: 0.5rem;
            --radius-lg: 1rem;
            --radius-xl: 1.5rem;
        }

        body {
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            background: var(--gray-100);
            color: var(--gray-900);
            min-height: 100vh;
        }

        /* Mobile Container */
        .mobile-wrapper {
            max-width: 430px;
            margin: 0 auto;
            background: var(--white);
            min-height: 100vh;
            position: relative;
            box-shadow: 0 0 50px rgba(0,0,0,0.1);
        }

        /* Profile Header */
        .profile-header {
            background: var(--gradient-primary);
            padding: 3rem 1.5rem 2rem;
            position: relative;
            overflow: hidden;
        }

        .profile-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 30px 30px;
            animation: float 20s linear infinite;
        }

        @keyframes float {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-30px, -30px); }
        }

        .profile-content {
            position: relative;
            z-index: 1;
            text-align: center;
        }

        .profile-avatar {
            width: 100px;
            height: 100px;
            margin: 0 auto 1.5rem;
            background: var(--white);
            border-radius: 50%;
            padding: 3px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .profile-avatar img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }

        .profile-name {
            font-size: 2rem;
            font-weight: 800;
            color: var(--white);
            margin-bottom: 0.5rem;
        }

        .profile-title {
            font-size: 1.125rem;
            color: rgba(255,255,255,0.95);
            margin-bottom: 0.25rem;
        }

        .profile-company {
            font-size: 1rem;
            color: rgba(255,255,255,0.85);
            margin-bottom: 1.5rem;
        }

        .profile-domain {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            color: var(--white);
            font-size: 0.875rem;
            font-weight: 500;
        }

        /* Contact Card */
        .contact-card {
            background: var(--white);
            margin: -1.5rem 1.5rem 1.5rem;
            border-radius: var(--radius-xl);
            padding: 1.5rem;
            box-shadow: var(--shadow-xl);
            position: relative;
            z-index: 2;
        }

        .contact-grid {
            display: grid;
            gap: 1rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem;
            background: var(--gray-100);
            border-radius: var(--radius);
            transition: all 0.3s;
        }

        .contact-item:hover {
            background: var(--gray-200);
            transform: translateX(5px);
        }

        .contact-icon {
            width: 40px;
            height: 40px;
            background: var(--gradient-primary);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            font-size: 1.25rem;
        }

        .contact-info {
            flex: 1;
        }

        .contact-label {
            font-size: 0.75rem;
            color: var(--gray-500);
            margin-bottom: 0.25rem;
        }

        .contact-value {
            font-size: 1rem;
            font-weight: 600;
            color: var(--gray-900);
        }

        /* Action Buttons */
        .action-buttons {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            padding: 0 1.5rem;
            margin-bottom: 2rem;
        }

        .action-btn {
            background: var(--white);
            border: 2px solid var(--gray-200);
            border-radius: var(--radius-lg);
            padding: 1rem;
            text-align: center;
            text-decoration: none;
            color: var(--gray-700);
            transition: all 0.3s;
            cursor: pointer;
        }

        .action-btn:hover {
            border-color: var(--primary);
            background: var(--primary);
            color: var(--white);
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .action-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .action-label {
            font-size: 0.875rem;
            font-weight: 600;
        }

        /* Side Job Cards Section */
        .sidejob-section {
            padding: 0 1.5rem 2rem;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .section-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--gray-900);
        }

        .view-all {
            color: var(--primary);
            text-decoration: none;
            font-size: 0.875rem;
            font-weight: 500;
        }

        .sidejob-grid {
            display: grid;
            gap: 1rem;
        }

        .sidejob-card {
            background: var(--white);
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-md);
            transition: all 0.3s;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: block;
        }

        .sidejob-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-xl);
        }

        .sidejob-image {
            height: 150px;
            background: var(--gradient-secondary);
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: var(--white);
        }

        .sidejob-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--danger);
            color: var(--white);
            padding: 0.375rem 0.75rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .sidejob-content {
            padding: 1.25rem;
        }

        .sidejob-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--gray-900);
            margin-bottom: 0.5rem;
        }

        .sidejob-desc {
            font-size: 0.875rem;
            color: var(--gray-600);
            margin-bottom: 0.75rem;
            line-height: 1.5;
        }

        .sidejob-price {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--primary);
        }

        .sidejob-price span {
            font-size: 0.875rem;
            color: var(--gray-500);
            font-weight: 400;
        }

        /* Stats Banner */
        .stats-banner {
            background: var(--gradient-primary);
            padding: 1.5rem;
            margin: 2rem 1.5rem;
            border-radius: var(--radius-lg);
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            text-align: center;
        }

        .stat-item {
            color: var(--white);
        }

        .stat-value {
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 0.25rem;
        }

        .stat-label {
            font-size: 0.75rem;
            opacity: 0.9;
        }

        /* Footer */
        .card-footer {
            background: var(--gray-100);
            padding: 2rem 1.5rem;
            text-align: center;
        }

        .footer-logo {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }

        .footer-text {
            font-size: 0.875rem;
            color: var(--gray-600);
        }

        /* Floating Action Button */
        .fab {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 60px;
            height: 60px;
            background: var(--gradient-primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            font-size: 1.5rem;
            box-shadow: var(--shadow-xl);
            cursor: pointer;
            transition: all 0.3s;
            z-index: 100;
        }

        .fab:hover {
            transform: scale(1.1);
        }

        /* Responsive */
        @media (max-width: 430px) {
            .mobile-wrapper {
                box-shadow: none;
            }
        }

        /* Animation */
        .fade-in {
            animation: fadeIn 0.8s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .slide-up {
            animation: slideUp 0.6s ease;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="mobile-wrapper">
        <!-- Profile Header Section -->
        <header class="profile-header">
            <div class="profile-content">
                <div class="profile-avatar">
                    <img src="/resources/images/profile/default-avatar.jpg"
                         alt="${userName}"
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Ccircle cx=\"50\" cy=\"50\" r=\"50\" fill=\"%236366f1\"/%3E%3Ctext x=\"50\" y=\"55\" text-anchor=\"middle\" font-size=\"40\" fill=\"white\" font-weight=\"bold\"%3E${fn:substring(userName, 0, 1)}%3C/text%3E%3C/svg%3E'">
                </div>
                <h1 class="profile-name">${userName}</h1>
                <p class="profile-title">${userTitle}</p>
                <p class="profile-company">${userCompany}</p>
                <div class="profile-domain">
                    <span>🌐</span>
                    <span>https://${userDomain}</span>
                </div>
            </div>
        </header>

        <!-- Contact Card -->
        <section class="contact-card fade-in">
            <div class="contact-grid">
                <a href="tel:${userPhone}" class="contact-item">
                    <div class="contact-icon">📱</div>
                    <div class="contact-info">
                        <div class="contact-label">휴대폰</div>
                        <div class="contact-value">${userPhone}</div>
                    </div>
                </a>

                <a href="mailto:${userEmail}" class="contact-item">
                    <div class="contact-icon">✉️</div>
                    <div class="contact-info">
                        <div class="contact-label">이메일</div>
                        <div class="contact-value">${userEmail}</div>
                    </div>
                </a>

                <div class="contact-item">
                    <div class="contact-icon">📍</div>
                    <div class="contact-info">
                        <div class="contact-label">주소</div>
                        <div class="contact-value">${userAddress}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Action Buttons -->
        <section class="action-buttons slide-up">
            <a href="tel:${userPhone}" class="action-btn">
                <div class="action-icon">📞</div>
                <div class="action-label">전화걸기</div>
            </a>
            <a href="sms:${userPhone}" class="action-btn">
                <div class="action-icon">💬</div>
                <div class="action-label">문자보내기</div>
            </a>
            <button onclick="shareCard()" class="action-btn">
                <div class="action-icon">🔗</div>
                <div class="action-label">공유하기</div>
            </button>
        </section>

        <!-- Stats Banner -->
        <section class="stats-banner">
            <div class="stat-item">
                <div class="stat-value">${todayVisitors}</div>
                <div class="stat-label">오늘 방문</div>
            </div>
            <div class="stat-item">
                <div class="stat-value"><fmt:formatNumber value="${totalVisitors}" pattern="#,###"/></div>
                <div class="stat-label">전체 방문</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${cardClicks}</div>
                <div class="stat-label">카드 클릭</div>
            </div>
        </section>

        <!-- Side Job Cards -->
        <section class="sidejob-section">
            <div class="section-header">
                <h2 class="section-title">제공 서비스</h2>
                <a href="/sidejobs/all" class="view-all">전체보기 →</a>
            </div>

            <div class="sidejob-grid">
                <!-- 정수기 렌탈 -->
                <a href="/sidejob/water-purifier" class="sidejob-card">
                    <div class="sidejob-image">
                        <span class="sidejob-badge">HOT</span>
                        💧
                    </div>
                    <div class="sidejob-content">
                        <h3 class="sidejob-title">프리미엄 정수기 렌탈</h3>
                        <p class="sidejob-desc">최신형 직수형 정수기를 합리적인 가격으로 만나보세요</p>
                        <div class="sidejob-price">
                            월 29,900원<span>부터</span>
                        </div>
                    </div>
                </a>

                <!-- 자동차 보험 -->
                <a href="/sidejob/car-insurance" class="sidejob-card">
                    <div class="sidejob-image" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                        <span class="sidejob-badge">추천</span>
                        🚗
                    </div>
                    <div class="sidejob-content">
                        <h3 class="sidejob-title">자동차 보험 컨설팅</h3>
                        <p class="sidejob-desc">최대 30% 할인 혜택과 맞춤형 설계 서비스</p>
                        <div class="sidejob-price">
                            무료 상담
                        </div>
                    </div>
                </a>

                <!-- 온라인 강의 -->
                <a href="/sidejob/online-course" class="sidejob-card">
                    <div class="sidejob-image" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                        📚
                    </div>
                    <div class="sidejob-content">
                        <h3 class="sidejob-title">디지털 마케팅 강의</h3>
                        <p class="sidejob-desc">실무자가 직접 알려주는 마케팅 전략과 노하우</p>
                        <div class="sidejob-price">
                            99,000원<span>/월</span>
                        </div>
                    </div>
                </a>
            </div>
        </section>

        <!-- Footer -->
        <footer class="card-footer">
            <div class="footer-logo">🎯 지플랫</div>
            <p class="footer-text">모바일 명함으로 시작하는 부업 플랫폼</p>
        </footer>

        <!-- Floating Action Button -->
        <button class="fab" onclick="openDashboard()">
            ⚙️
        </button>
    </div>

    <!-- JavaScript -->
    <script>
        // 공유하기 기능
        function shareCard() {
            const url = 'https://${userDomain}';
            const text = '${userName}님의 모바일 명함입니다.';

            if (navigator.share) {
                navigator.share({
                    title: '${userName} - ${userTitle}',
                    text: text,
                    url: url
                }).catch(console.error);
            } else {
                // 클립보드에 복사
                navigator.clipboard.writeText(url).then(() => {
                    alert('링크가 복사되었습니다.');
                });
            }
        }

        // 대시보드 열기
        function openDashboard() {
            window.location.href = '/dashboard';
        }

        // 방문자 추적
        window.addEventListener('load', function() {
            // AJAX로 방문 기록
            fetch('/api/track-visit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cardId: '${userDomain}',
                    timestamp: new Date().toISOString()
                })
            });

            // 애니메이션 효과
            document.querySelectorAll('.sidejob-card').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('slide-up');
                }, index * 100);
            });
        });

        // 스크롤 이벤트
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop) {
                // 아래로 스크롤
                document.querySelector('.fab').style.transform = 'translateY(100px)';
            } else {
                // 위로 스크롤
                document.querySelector('.fab').style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
        });
    </script>
</body>
</html>