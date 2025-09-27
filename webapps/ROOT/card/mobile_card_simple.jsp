<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>김대리.한국 - 지플랫 모바일 명함</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #ec4899;
            --gray-100: #f3f4f6;
            --gray-600: #4b5563;
            --gray-900: #111827;
            --white: #ffffff;
            --gradient: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            --shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --radius: 0.5rem;
            --radius-lg: 1rem;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            color: var(--gray-900);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .mobile-wrapper {
            width: 350px;
            background: var(--white);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            border: 1px solid #e0e0e0;
        }

        .profile-header {
            background: var(--gradient);
            padding: 2rem 1.5rem 1.5rem;
            text-align: center;
            color: var(--white);
            position: relative;
        }

        .profile-avatar {
            width: 70px;
            height: 70px;
            margin: 0 auto 1rem;
            background: var(--white);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            color: var(--primary);
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .profile-name {
            font-size: 1.5rem;
            font-weight: 800;
            margin-bottom: 0.25rem;
            letter-spacing: -0.5px;
        }

        .profile-title {
            font-size: 0.95rem;
            opacity: 0.95;
            margin-bottom: 0.2rem;
        }

        .profile-company {
            font-size: 0.875rem;
            opacity: 0.85;
            margin-bottom: 1rem;
        }

        .profile-domain {
            display: inline-block;
            background: rgba(255,255,255,0.25);
            padding: 0.5rem 1rem;
            border-radius: 1.5rem;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .contact-card {
            background: var(--white);
            margin: -1rem 1rem 1rem;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            position: relative;
            z-index: 2;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: var(--gray-100);
            border-radius: 8px;
            margin-bottom: 0.75rem;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
        }

        .contact-item:last-child {
            margin-bottom: 0;
        }

        .contact-icon {
            width: 35px;
            height: 35px;
            background: var(--gradient);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            font-size: 1rem;
        }

        .contact-info {
            flex: 1;
        }

        .contact-label {
            font-size: 0.7rem;
            color: var(--gray-600);
            margin-bottom: 0.15rem;
        }

        .contact-value {
            font-size: 0.875rem;
            font-weight: 600;
        }

        .action-buttons {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
            padding: 0 1rem 1.5rem;
        }

        .action-btn {
            background: var(--white);
            border: 1px solid var(--gray-100);
            border-radius: 8px;
            padding: 0.75rem 0.5rem;
            text-align: center;
            text-decoration: none;
            color: var(--gray-900);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.75rem;
        }

        .action-btn:hover {
            border-color: var(--primary);
            background: var(--primary);
            color: var(--white);
        }

        .sidejob-section {
            padding: 0 1rem 1.5rem;
        }

        .section-title {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--gray-900);
        }

        .sidejob-card {
            background: var(--white);
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 0.75rem;
            cursor: pointer;
            display: block;
            text-decoration: none;
            color: inherit;
            border: 1px solid var(--gray-100);
            transition: all 0.2s;
        }

        .sidejob-card:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
            transform: translateY(-2px);
        }

        .sidejob-image {
            height: 100px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: var(--white);
        }

        .sidejob-content {
            padding: 0.75rem;
        }

        .sidejob-title {
            font-size: 0.9rem;
            font-weight: 700;
            margin-bottom: 0.3rem;
        }

        .sidejob-desc {
            font-size: 0.75rem;
            color: var(--gray-600);
            margin-bottom: 0.5rem;
            line-height: 1.3;
        }

        .sidejob-price {
            font-size: 1rem;
            font-weight: 800;
            color: var(--primary);
        }

        .footer {
            background: var(--gray-100);
            padding: 1rem;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }

        .footer p {
            margin: 0.25rem 0;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }

            .mobile-wrapper {
                box-shadow: none;
                border: 1px solid #ddd;
                width: 85.6mm;
                height: 53.98mm;
                page-break-inside: avoid;
            }

            .action-buttons,
            .sidejob-section,
            .footer {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="mobile-wrapper">
        <!-- Profile Header -->
        <header class="profile-header">
            <div class="profile-avatar">김</div>
            <h1 class="profile-name">김대리</h1>
            <p class="profile-title">마케팅 매니저</p>
            <p class="profile-company">ABC 컴퍼니</p>
            <div class="profile-domain">🌐 https://김대리.한국</div>
        </header>

        <!-- Contact Card -->
        <section class="contact-card">
            <a href="tel:010-1234-5678" class="contact-item">
                <div class="contact-icon">📱</div>
                <div class="contact-info">
                    <div class="contact-label">휴대폰</div>
                    <div class="contact-value">010-1234-5678</div>
                </div>
            </a>

            <a href="mailto:kim@example.com" class="contact-item">
                <div class="contact-icon">✉️</div>
                <div class="contact-info">
                    <div class="contact-label">이메일</div>
                    <div class="contact-value">kim@example.com</div>
                </div>
            </a>

            <div class="contact-item">
                <div class="contact-icon">📍</div>
                <div class="contact-info">
                    <div class="contact-label">주소</div>
                    <div class="contact-value">서울시 강남구 테헤란로 123</div>
                </div>
            </div>
        </section>

        <!-- Action Buttons -->
        <section class="action-buttons">
            <a href="tel:010-1234-5678" class="action-btn">
                <div>📞</div>
                <div>전화걸기</div>
            </a>
            <a href="sms:010-1234-5678" class="action-btn">
                <div>💬</div>
                <div>문자보내기</div>
            </a>
            <button onclick="alert('공유 기능')" class="action-btn">
                <div>🔗</div>
                <div>공유하기</div>
            </button>
        </section>

        <!-- Side Job Cards -->
        <section class="sidejob-section">
            <h2 class="section-title">제공 서비스</h2>

            <a href="#" class="sidejob-card">
                <div class="sidejob-image">💧</div>
                <div class="sidejob-content">
                    <h3 class="sidejob-title">프리미엄 정수기 렌탈</h3>
                    <p class="sidejob-desc">최신형 직수형 정수기를 합리적인 가격으로</p>
                    <div class="sidejob-price">월 29,900원부터</div>
                </div>
            </a>

            <a href="#" class="sidejob-card">
                <div class="sidejob-image" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                    🚗
                </div>
                <div class="sidejob-content">
                    <h3 class="sidejob-title">자동차 보험 컨설팅</h3>
                    <p class="sidejob-desc">최대 30% 할인 혜택과 맞춤형 설계</p>
                    <div class="sidejob-price">무료 상담</div>
                </div>
            </a>

            <a href="#" class="sidejob-card">
                <div class="sidejob-image" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                    📚
                </div>
                <div class="sidejob-content">
                    <h3 class="sidejob-title">디지털 마케팅 강의</h3>
                    <p class="sidejob-desc">실무자가 직접 알려주는 마케팅 노하우</p>
                    <div class="sidejob-price">99,000원/월</div>
                </div>
            </a>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <img src="/assets/GP 로고.png" alt="G-PLAT" style="height: 40px; margin-bottom: 8px;">
            <p style="font-size: 0.875rem; color: var(--gray-600);">모바일 명함 서비스</p>
        </footer>
    </div>
</body>
</html>