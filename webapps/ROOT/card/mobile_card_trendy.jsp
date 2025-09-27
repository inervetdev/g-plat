<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>김대리 - Digital Business Card</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --bg-primary: #0a0a0a;
            --bg-secondary: #141414;
            --bg-card: #1a1a1a;
            --text-primary: #ffffff;
            --text-secondary: #a0a0a0;
            --accent: #00dc82;
            --accent-secondary: #7c3aed;
            --border: rgba(255, 255, 255, 0.08);
            --glow: #00dc82;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }

        @keyframes glow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }

        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            overflow-x: hidden;
            position: relative;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
                radial-gradient(circle at 20% 50%, rgba(0, 220, 130, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.02) 0%, transparent 50%);
            pointer-events: none;
        }

        .noise {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.02;
            z-index: 1;
            pointer-events: none;
            background: url('data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E');
        }

        .card-wrapper {
            width: 100%;
            max-width: 420px;
            position: relative;
            z-index: 10;
            animation: fadeInUp 0.8s ease-out;
        }

        .card {
            background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);
            border: 1px solid var(--border);
            border-radius: 24px;
            overflow: hidden;
            backdrop-filter: blur(10px);
            box-shadow:
                0 0 100px rgba(0, 220, 130, 0.1),
                0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .profile-section {
            padding: 2.5rem 2rem;
            position: relative;
            text-align: center;
        }

        .profile-avatar {
            width: 120px;
            height: 120px;
            margin: 0 auto 1.5rem;
            position: relative;
        }

        .avatar-inner {
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
            border-radius: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            font-weight: 900;
            color: var(--text-primary);
            position: relative;
            animation: float 4s ease-in-out infinite;
            transform: rotate(-5deg);
        }

        .avatar-inner::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
            border-radius: 30px;
            filter: blur(20px);
            opacity: 0.6;
            z-index: -1;
            animation: glow 2s ease-in-out infinite;
        }

        .profile-name {
            font-size: 2.25rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: -0.02em;
        }

        .profile-title {
            font-size: 1.125rem;
            color: var(--accent);
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .profile-company {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }

        .profile-tags {
            display: flex;
            gap: 0.5rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .tag {
            padding: 0.5rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border);
            border-radius: 100px;
            font-size: 0.75rem;
            color: var(--text-secondary);
            transition: all 0.3s ease;
        }

        .tag:hover {
            background: rgba(0, 220, 130, 0.1);
            border-color: var(--accent);
            color: var(--accent);
            transform: translateY(-2px);
        }

        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, var(--border) 50%, transparent 100%);
            margin: 0 2rem;
        }

        .contact-section {
            padding: 2rem;
        }

        .contact-grid {
            display: grid;
            gap: 1rem;
        }

        .contact-item {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .contact-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent 0%, rgba(0, 220, 130, 0.1) 50%, transparent 100%);
            transition: left 0.5s ease;
        }

        .contact-item:hover::before {
            left: 100%;
        }

        .contact-item:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--accent);
            transform: translateX(4px);
        }

        .contact-icon {
            width: 48px;
            height: 48px;
            background: rgba(0, 220, 130, 0.1);
            border: 1px solid rgba(0, 220, 130, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        .contact-info {
            flex: 1;
        }

        .contact-label {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.25rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .contact-value {
            font-size: 1rem;
            color: var(--text-primary);
            font-weight: 500;
        }

        .action-section {
            padding: 0 2rem 2rem;
        }

        .action-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
        }

        .action-btn {
            background: linear-gradient(135deg, rgba(0, 220, 130, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1rem;
            text-align: center;
            text-decoration: none;
            color: var(--text-primary);
            font-weight: 500;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }

        .action-btn::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
            transition: all 0.5s ease;
            transform: translate(-50%, -50%);
        }

        .action-btn:hover::before {
            width: 300px;
            height: 300px;
        }

        .action-btn:hover {
            border-color: var(--accent);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 220, 130, 0.2);
        }

        .action-btn span {
            position: relative;
            z-index: 1;
        }

        .services-section {
            padding: 2rem;
        }

        .section-header {
            margin-bottom: 1.5rem;
            text-align: center;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .section-subtitle {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }

        .service-cards {
            display: grid;
            gap: 1rem;
        }

        .service-card {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 1.5rem;
            text-decoration: none;
            color: inherit;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .service-card::after {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(0, 220, 130, 0.1) 0%, transparent 70%);
            transition: all 0.5s ease;
        }

        .service-card:hover::after {
            top: -25%;
            right: -25%;
        }

        .service-card:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--accent);
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 220, 130, 0.15);
        }

        .service-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
            display: inline-block;
            animation: float 3s ease-in-out infinite;
        }

        .service-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .service-desc {
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 1rem;
        }

        .service-price {
            font-size: 1.25rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .footer-section {
            padding: 2rem;
            background: var(--bg-secondary);
            text-align: center;
            border-top: 1px solid var(--border);
        }

        .domain-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, rgba(0, 220, 130, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%);
            border: 1px solid var(--border);
            border-radius: 100px;
            margin-bottom: 1rem;
            animation: gradient 3s ease infinite;
            background-size: 200% 200%;
        }

        .domain-text {
            font-size: 0.875rem;
            color: var(--accent);
            font-weight: 500;
        }

        .footer-brand {
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-top: 0.5rem;
        }
    </style>
</head>
<body>
    <div class="noise"></div>

    <div class="card-wrapper">
        <div class="card">
            <!-- Profile Section -->
            <section class="profile-section">
                <div class="profile-avatar">
                    <div class="avatar-inner">K</div>
                </div>

                <h1 class="profile-name">김대리</h1>
                <p class="profile-title">Marketing Manager</p>
                <p class="profile-company">ABC Company</p>

                <div class="profile-tags">
                    <span class="tag">#디지털마케팅</span>
                    <span class="tag">#브랜딩</span>
                    <span class="tag">#컨설팅</span>
                </div>
            </section>

            <div class="divider"></div>

            <!-- Contact Section -->
            <section class="contact-section">
                <div class="contact-grid">
                    <a href="tel:010-1234-5678" class="contact-item">
                        <div class="contact-icon">📱</div>
                        <div class="contact-info">
                            <div class="contact-label">Mobile</div>
                            <div class="contact-value">010-1234-5678</div>
                        </div>
                    </a>

                    <a href="mailto:kim@example.com" class="contact-item">
                        <div class="contact-icon">✉️</div>
                        <div class="contact-info">
                            <div class="contact-label">Email</div>
                            <div class="contact-value">kim@example.com</div>
                        </div>
                    </a>

                    <div class="contact-item">
                        <div class="contact-icon">📍</div>
                        <div class="contact-info">
                            <div class="contact-label">Location</div>
                            <div class="contact-value">Seoul, Korea</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Action Section -->
            <section class="action-section">
                <div class="action-grid">
                    <a href="tel:010-1234-5678" class="action-btn">
                        <span>💬 Message</span>
                    </a>
                    <button onclick="alert('Contact Saved!')" class="action-btn">
                        <span>💾 Save Contact</span>
                    </button>
                </div>
            </section>

            <div class="divider"></div>

            <!-- Services Section -->
            <section class="services-section">
                <div class="section-header">
                    <h2 class="section-title">Services</h2>
                    <p class="section-subtitle">Premium solutions for your needs</p>
                </div>

                <div class="service-cards">
                    <a href="#" class="service-card">
                        <div class="service-icon">💧</div>
                        <h3 class="service-title">프리미엄 정수기</h3>
                        <p class="service-desc">최첨단 기술의 직수형 정수기로 깨끗한 물을 경험하세요</p>
                        <div class="service-price">₩29,900/월</div>
                    </a>

                    <a href="#" class="service-card">
                        <div class="service-icon">🚗</div>
                        <h3 class="service-title">자동차 보험</h3>
                        <p class="service-desc">맞춤형 설계와 최대 30% 할인 혜택</p>
                        <div class="service-price">Free Consultation</div>
                    </a>

                    <a href="#" class="service-card">
                        <div class="service-icon">📚</div>
                        <h3 class="service-title">디지털 마케팅 강좌</h3>
                        <p class="service-desc">실무 전문가의 노하우를 직접 배워보세요</p>
                        <div class="service-price">₩99,000/월</div>
                    </a>
                </div>
            </section>

            <!-- Footer -->
            <footer class="footer-section">
                <div class="domain-badge">
                    <span class="domain-text">🌐 김대리.한국</span>
                </div>
                <img src="/assets/GP 로고.png" alt="G-PLAT" style="height: 35px; margin-top: 12px; opacity: 0.8; filter: brightness(0) invert(1);">
            </footer>
        </div>
    </div>
</body>
</html>