<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>김대리 - 지플랫 디지털 명함</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --navy: #1e3a5f;
            --navy-dark: #0f1f35;
            --gold: #c9a961;
            --gray-50: #fafafa;
            --gray-100: #f5f5f5;
            --gray-200: #e5e5e5;
            --gray-300: #d4d4d4;
            --gray-400: #a3a3a3;
            --gray-500: #737373;
            --gray-600: #525252;
            --gray-700: #404040;
            --gray-800: #262626;
            --gray-900: #171717;
            --white: #ffffff;
            --success: #22c55e;
            --warning: #f59e0b;
            --danger: #ef4444;
        }

        body {
            font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
            background: #f8f9fa;
            color: var(--gray-900);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 1rem;
            line-height: 1.6;
        }

        .card-container {
            width: 100%;
            max-width: 400px;
            background: var(--white);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }

        .header-section {
            background: linear-gradient(135deg, var(--navy) 0%, var(--navy-dark) 100%);
            padding: 2rem;
            position: relative;
            overflow: hidden;
        }

        .header-section::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
        }

        .company-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.1);
            padding: 0.375rem 0.75rem;
            border-radius: 6px;
            margin-bottom: 1.5rem;
        }

        .company-badge span {
            color: var(--white);
            font-size: 0.875rem;
            font-weight: 500;
        }

        .profile-info {
            position: relative;
            z-index: 1;
        }

        .profile-name {
            color: var(--white);
            font-size: 1.875rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            letter-spacing: -0.025em;
        }

        .profile-title {
            color: var(--gold);
            font-size: 1.125rem;
            font-weight: 500;
            margin-bottom: 0.25rem;
        }

        .profile-department {
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.9375rem;
        }

        .profile-domain {
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
        }

        .domain-label {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.375rem;
        }

        .domain-value {
            color: var(--white);
            font-size: 0.9375rem;
            font-weight: 500;
        }

        .contact-section {
            padding: 1.5rem;
            background: var(--gray-50);
            border-bottom: 1px solid var(--gray-200);
        }

        .contact-grid {
            display: grid;
            gap: 0.75rem;
        }

        .contact-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.875rem;
            background: var(--white);
            border: 1px solid var(--gray-200);
            border-radius: 8px;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s ease;
        }

        .contact-item:hover {
            border-color: var(--navy);
            box-shadow: 0 2px 8px rgba(30, 58, 95, 0.1);
            transform: translateY(-1px);
        }

        .contact-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--navy);
            color: var(--white);
            border-radius: 8px;
            font-size: 1.125rem;
        }

        .contact-details {
            flex: 1;
        }

        .contact-label {
            font-size: 0.75rem;
            color: var(--gray-500);
            text-transform: uppercase;
            letter-spacing: 0.025em;
            margin-bottom: 0.125rem;
        }

        .contact-value {
            font-size: 0.9375rem;
            color: var(--gray-900);
            font-weight: 500;
        }

        .quick-actions {
            padding: 1.5rem;
            background: var(--white);
            border-bottom: 1px solid var(--gray-200);
        }

        .quick-actions-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
        }

        .quick-action {
            padding: 0.875rem 0.5rem;
            background: var(--white);
            border: 1px solid var(--gray-200);
            border-radius: 8px;
            text-align: center;
            text-decoration: none;
            color: var(--gray-700);
            font-size: 0.8125rem;
            font-weight: 500;
            transition: all 0.2s ease;
            cursor: pointer;
        }

        .quick-action:hover {
            background: var(--navy);
            color: var(--white);
            border-color: var(--navy);
        }

        .quick-action-icon {
            font-size: 1.25rem;
            margin-bottom: 0.375rem;
        }

        .services-section {
            padding: 1.5rem;
            background: var(--gray-50);
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .section-title {
            font-size: 1rem;
            font-weight: 700;
            color: var(--gray-900);
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }

        .section-badge {
            background: var(--gold);
            color: var(--navy);
            padding: 0.25rem 0.625rem;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .service-card {
            background: var(--white);
            border: 1px solid var(--gray-200);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.75rem;
            text-decoration: none;
            color: inherit;
            display: block;
            transition: all 0.2s ease;
        }

        .service-card:hover {
            border-color: var(--navy);
            box-shadow: 0 4px 12px rgba(30, 58, 95, 0.1);
        }

        .service-header {
            display: flex;
            align-items: start;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
        }

        .service-icon {
            width: 36px;
            height: 36px;
            background: var(--navy);
            color: var(--white);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.125rem;
            flex-shrink: 0;
        }

        .service-content {
            flex: 1;
        }

        .service-title {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--gray-900);
            margin-bottom: 0.25rem;
        }

        .service-description {
            font-size: 0.8125rem;
            color: var(--gray-600);
            line-height: 1.4;
        }

        .service-footer {
            display: flex;
            align-items: center;
            justify-content: between;
            padding-top: 0.75rem;
            border-top: 1px solid var(--gray-100);
        }

        .service-price {
            font-size: 1rem;
            font-weight: 700;
            color: var(--navy);
        }

        .service-price small {
            font-size: 0.75rem;
            color: var(--gray-500);
            font-weight: 400;
        }

        .service-badge {
            margin-left: auto;
            background: var(--success);
            color: var(--white);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.6875rem;
            font-weight: 600;
        }

        .footer-section {
            padding: 1.5rem;
            background: var(--navy);
            text-align: center;
        }

        .footer-logo {
            color: var(--white);
            font-size: 1.125rem;
            font-weight: 700;
            margin-bottom: 0.375rem;
        }

        .footer-text {
            color: rgba(255, 255, 255, 0.7);
            font-size: 0.75rem;
        }

        .verified-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            margin-top: 0.75rem;
            padding: 0.375rem 0.75rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            color: var(--gold);
            font-size: 0.75rem;
            font-weight: 500;
        }

        @media (max-width: 480px) {
            .card-container {
                border-radius: 0;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="card-container">
        <!-- Header Section -->
        <header class="header-section">
            <div class="company-badge">
                <span>ABC 컴퍼니</span>
            </div>

            <div class="profile-info">
                <h1 class="profile-name">김대리</h1>
                <div class="profile-title">마케팅 매니저</div>
                <div class="profile-department">디지털 마케팅팀</div>
            </div>

            <div class="profile-domain">
                <div class="domain-label">Personal Domain</div>
                <div class="domain-value">김대리.한국</div>
            </div>
        </header>

        <!-- Contact Section -->
        <section class="contact-section">
            <div class="contact-grid">
                <a href="tel:010-1234-5678" class="contact-item">
                    <div class="contact-icon">📱</div>
                    <div class="contact-details">
                        <div class="contact-label">Mobile</div>
                        <div class="contact-value">010-1234-5678</div>
                    </div>
                </a>

                <a href="mailto:kim@example.com" class="contact-item">
                    <div class="contact-icon">✉️</div>
                    <div class="contact-details">
                        <div class="contact-label">Email</div>
                        <div class="contact-value">kim@example.com</div>
                    </div>
                </a>

                <div class="contact-item">
                    <div class="contact-icon">🏢</div>
                    <div class="contact-details">
                        <div class="contact-label">Office</div>
                        <div class="contact-value">서울시 강남구 테헤란로 123</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions">
            <div class="quick-actions-grid">
                <a href="tel:010-1234-5678" class="quick-action">
                    <div class="quick-action-icon">📞</div>
                    <div>전화걸기</div>
                </a>
                <a href="sms:010-1234-5678" class="quick-action">
                    <div class="quick-action-icon">💬</div>
                    <div>문자보내기</div>
                </a>
                <button onclick="alert('명함 저장 기능')" class="quick-action">
                    <div class="quick-action-icon">💾</div>
                    <div>명함저장</div>
                </button>
            </div>
        </section>

        <!-- Services Section -->
        <section class="services-section">
            <div class="section-header">
                <h2 class="section-title">Professional Services</h2>
                <span class="section-badge">Premium</span>
            </div>

            <a href="#" class="service-card">
                <div class="service-header">
                    <div class="service-icon">💧</div>
                    <div class="service-content">
                        <h3 class="service-title">프리미엄 정수기 렌탈</h3>
                        <p class="service-description">최신형 직수형 정수기를 합리적인 가격으로 제공합니다</p>
                    </div>
                </div>
                <div class="service-footer">
                    <div class="service-price">
                        월 29,900원 <small>부터</small>
                    </div>
                    <span class="service-badge">인기</span>
                </div>
            </a>

            <a href="#" class="service-card">
                <div class="service-header">
                    <div class="service-icon">🚗</div>
                    <div class="service-content">
                        <h3 class="service-title">자동차 보험 컨설팅</h3>
                        <p class="service-description">최대 30% 할인 혜택과 맞춤형 보험 설계</p>
                    </div>
                </div>
                <div class="service-footer">
                    <div class="service-price">
                        무료 상담
                    </div>
                </div>
            </a>

            <a href="#" class="service-card">
                <div class="service-header">
                    <div class="service-icon">📚</div>
                    <div class="service-content">
                        <h3 class="service-title">디지털 마케팅 강의</h3>
                        <p class="service-description">10년 경력 실무자의 마케팅 노하우 전수</p>
                    </div>
                </div>
                <div class="service-footer">
                    <div class="service-price">
                        99,000원 <small>/월</small>
                    </div>
                </div>
            </a>
        </section>

        <!-- Footer -->
        <footer class="footer-section">
            <img src="/assets/GP 로고.png" alt="G-PLAT" style="height: 45px; margin-bottom: 8px;">
            <div class="footer-text">Digital Business Card Platform</div>
            <div class="verified-badge">
                ✓ Verified Business
            </div>
        </footer>
    </div>
</body>
</html>