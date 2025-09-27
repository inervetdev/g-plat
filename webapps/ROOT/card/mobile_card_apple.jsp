<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>김대리 — Business Card</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            /* iOS System Colors */
            --system-background: #ffffff;
            --system-grouped-background: #f2f2f7;
            --system-secondary-background: #ffffff;
            --system-tertiary-background: #f2f2f7;
            --system-blue: #007aff;
            --system-green: #34c759;
            --system-indigo: #5856d6;
            --system-orange: #ff9500;
            --system-pink: #ff2d55;
            --system-purple: #af52de;
            --system-red: #ff3b30;
            --system-teal: #5ac8fa;
            --system-yellow: #ffcc00;
            --label-primary: #000000;
            --label-secondary: rgba(60, 60, 67, 0.6);
            --label-tertiary: rgba(60, 60, 67, 0.3);
            --separator: rgba(60, 60, 67, 0.12);
            --sf-pro: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --system-background: #000000;
                --system-grouped-background: #1c1c1e;
                --system-secondary-background: #1c1c1e;
                --system-tertiary-background: #2c2c2e;
                --label-primary: #ffffff;
                --label-secondary: rgba(235, 235, 245, 0.6);
                --label-tertiary: rgba(235, 235, 245, 0.3);
                --separator: rgba(84, 84, 88, 0.65);
            }
        }

        body {
            font-family: var(--sf-pro);
            background: var(--system-grouped-background);
            color: var(--label-primary);
            min-height: 100vh;
            padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .container {
            max-width: 428px;
            margin: 0 auto;
            background: var(--system-background);
        }

        /* Navigation Bar */
        .nav-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            background: var(--system-background);
            border-bottom: 0.5px solid var(--separator);
            backdrop-filter: saturate(180%) blur(20px);
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .nav-title {
            font-size: 17px;
            font-weight: 600;
            letter-spacing: -0.4px;
        }

        .nav-button {
            color: var(--system-blue);
            font-size: 17px;
            background: none;
            border: none;
            cursor: pointer;
            font-family: var(--sf-pro);
        }

        /* Profile Header */
        .profile-header {
            padding: 24px 20px;
            text-align: center;
            background: var(--system-background);
        }

        .profile-avatar {
            width: 120px;
            height: 120px;
            margin: 0 auto 16px;
            background: linear-gradient(135deg, var(--system-blue) 0%, var(--system-indigo) 100%);
            border-radius: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            font-weight: 600;
            color: white;
            letter-spacing: -1px;
        }

        .profile-name {
            font-size: 34px;
            font-weight: 700;
            letter-spacing: -0.8px;
            margin-bottom: 4px;
        }

        .profile-title {
            font-size: 20px;
            font-weight: 400;
            color: var(--label-secondary);
            letter-spacing: -0.4px;
            margin-bottom: 2px;
        }

        .profile-company {
            font-size: 17px;
            color: var(--label-tertiary);
            letter-spacing: -0.4px;
        }

        /* Action Buttons */
        .action-section {
            padding: 0 20px 20px;
            display: flex;
            gap: 12px;
        }

        .action-button {
            flex: 1;
            padding: 14px;
            background: var(--system-blue);
            color: white;
            border: none;
            border-radius: 14px;
            font-size: 17px;
            font-weight: 600;
            font-family: var(--sf-pro);
            cursor: pointer;
            letter-spacing: -0.4px;
            transition: opacity 0.2s;
        }

        .action-button:active {
            opacity: 0.8;
        }

        .action-button.secondary {
            background: var(--system-grouped-background);
            color: var(--system-blue);
        }

        /* List Sections */
        .list-section {
            margin: 20px;
            background: var(--system-secondary-background);
            border-radius: 10px;
            overflow: hidden;
        }

        .list-header {
            padding: 6px 16px;
            font-size: 13px;
            font-weight: 400;
            color: var(--label-secondary);
            text-transform: uppercase;
            letter-spacing: -0.08px;
            background: var(--system-grouped-background);
        }

        .list-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            background: var(--system-secondary-background);
            border-bottom: 0.5px solid var(--separator);
            text-decoration: none;
            color: inherit;
            transition: background 0.2s;
            position: relative;
        }

        .list-item:last-child {
            border-bottom: none;
        }

        .list-item:active {
            background: var(--system-tertiary-background);
        }

        .list-item-icon {
            width: 29px;
            height: 29px;
            margin-right: 12px;
            background: var(--system-blue);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            flex-shrink: 0;
        }

        .list-item-content {
            flex: 1;
        }

        .list-item-label {
            font-size: 17px;
            letter-spacing: -0.4px;
            line-height: 22px;
        }

        .list-item-value {
            font-size: 15px;
            color: var(--label-secondary);
            letter-spacing: -0.24px;
            margin-top: 2px;
        }

        .list-item-accessory {
            color: var(--label-tertiary);
            font-size: 20px;
            margin-left: 8px;
        }

        /* Services Section */
        .service-grid {
            padding: 0 20px 20px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
        }

        .service-card {
            background: var(--system-secondary-background);
            border-radius: 14px;
            padding: 16px;
            text-decoration: none;
            color: inherit;
            border: 1px solid var(--separator);
            transition: transform 0.2s;
        }

        .service-card:active {
            transform: scale(0.98);
        }

        .service-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--system-blue) 0%, var(--system-purple) 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin-bottom: 12px;
        }

        .service-name {
            font-size: 15px;
            font-weight: 600;
            letter-spacing: -0.24px;
            margin-bottom: 4px;
        }

        .service-price {
            font-size: 13px;
            color: var(--label-secondary);
            letter-spacing: -0.08px;
        }

        /* Footer */
        .footer {
            padding: 40px 20px;
            text-align: center;
        }

        .footer-domain {
            font-size: 17px;
            font-weight: 600;
            color: var(--system-blue);
            letter-spacing: -0.4px;
            margin-bottom: 8px;
        }

        .footer-brand {
            font-size: 13px;
            color: var(--label-tertiary);
            letter-spacing: -0.08px;
        }

        /* SF Pro style adjustments */
        h1, h2, h3, h4, h5, h6 {
            font-weight: 700;
            letter-spacing: -0.02em;
        }

        /* iOS-style tap highlight */
        * {
            -webkit-tap-highlight-color: transparent;
        }

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Navigation Bar -->
        <nav class="nav-bar">
            <button class="nav-button">편집</button>
            <h1 class="nav-title">연락처</h1>
            <button class="nav-button">공유</button>
        </nav>

        <!-- Profile Header -->
        <header class="profile-header">
            <div class="profile-avatar">김</div>
            <h1 class="profile-name">김대리</h1>
            <p class="profile-title">Marketing Manager</p>
            <p class="profile-company">ABC Company</p>
        </header>

        <!-- Action Buttons -->
        <section class="action-section">
            <button class="action-button" onclick="location.href='tel:010-1234-5678'">
                전화
            </button>
            <button class="action-button secondary" onclick="location.href='sms:010-1234-5678'">
                메시지
            </button>
        </section>

        <!-- Contact Information -->
        <section class="list-section">
            <a href="tel:010-1234-5678" class="list-item">
                <div class="list-item-icon">📱</div>
                <div class="list-item-content">
                    <div class="list-item-label">휴대전화</div>
                    <div class="list-item-value">010-1234-5678</div>
                </div>
                <span class="list-item-accessory">›</span>
            </a>

            <a href="mailto:kim@example.com" class="list-item">
                <div class="list-item-icon">✉️</div>
                <div class="list-item-content">
                    <div class="list-item-label">이메일</div>
                    <div class="list-item-value">kim@example.com</div>
                </div>
                <span class="list-item-accessory">›</span>
            </a>

            <div class="list-item">
                <div class="list-item-icon">🏢</div>
                <div class="list-item-content">
                    <div class="list-item-label">회사</div>
                    <div class="list-item-value">서울시 강남구 테헤란로 123</div>
                </div>
            </div>
        </section>

        <!-- Services -->
        <section style="padding: 20px 20px 0;">
            <h2 style="font-size: 22px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.4px;">
                제공 서비스
            </h2>
        </section>

        <section class="service-grid">
            <a href="#" class="service-card">
                <div class="service-icon">💧</div>
                <div class="service-name">정수기 렌탈</div>
                <div class="service-price">월 29,900원</div>
            </a>

            <a href="#" class="service-card">
                <div class="service-icon">🚗</div>
                <div class="service-name">자동차 보험</div>
                <div class="service-price">무료 상담</div>
            </a>

            <a href="#" class="service-card">
                <div class="service-icon">📚</div>
                <div class="service-name">마케팅 강의</div>
                <div class="service-price">월 99,000원</div>
            </a>

            <a href="#" class="service-card">
                <div class="service-icon">💼</div>
                <div class="service-name">비즈니스 컨설팅</div>
                <div class="service-price">맞춤 견적</div>
            </a>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-domain">김대리.한국</div>
            <img src="/assets/GP 로고.png" alt="G-PLAT" style="height: 30px; margin-top: 12px; opacity: 0.6;">
        </footer>
    </div>
</body>
</html>