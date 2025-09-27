<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>

<%
    // 세션 체크 (실제로는 필터나 인터셉터로 처리)
    if (session.getAttribute("userId") == null) {
        response.sendRedirect("/login.jsp");
        return;
    }

    // 대시보드 데이터 (실제로는 서비스에서 조회)
    request.setAttribute("todayVisitors", 128);
    request.setAttribute("weeklyVisitors", 892);
    request.setAttribute("totalClicks", 456);
    request.setAttribute("conversionRate", 18.7);
    request.setAttribute("newInquiries", 24);
%>

<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대시보드 - 지플랫</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --primary-light: #818cf8;
            --secondary: #ec4899;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #3b82f6;
            --gray-50: #f9fafb;
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
            --gradient: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            --radius: 0.5rem;
            --radius-lg: 1rem;
        }

        body {
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            background: var(--gray-50);
            color: var(--gray-900);
        }

        /* Layout */
        .dashboard-container {
            display: flex;
            min-height: 100vh;
        }

        /* Sidebar */
        .sidebar {
            width: 280px;
            background: var(--white);
            border-right: 1px solid var(--gray-200);
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            z-index: 100;
        }

        .sidebar-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--gray-200);
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--primary);
            text-decoration: none;
        }

        .sidebar-nav {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
        }

        .nav-section {
            margin-bottom: 2rem;
        }

        .nav-title {
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--gray-500);
            margin-bottom: 0.5rem;
            padding: 0 0.75rem;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            border-radius: var(--radius);
            color: var(--gray-700);
            text-decoration: none;
            transition: all 0.2s;
            margin-bottom: 0.25rem;
            cursor: pointer;
        }

        .nav-item:hover {
            background: var(--gray-100);
            color: var(--primary);
        }

        .nav-item.active {
            background: var(--gradient);
            color: var(--white);
        }

        .nav-icon {
            font-size: 1.25rem;
        }

        .nav-badge {
            margin-left: auto;
            background: var(--danger);
            color: var(--white);
            padding: 0.125rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        /* Main Content */
        .main-content {
            flex: 1;
            margin-left: 280px;
            display: flex;
            flex-direction: column;
        }

        /* Header */
        .header {
            background: var(--white);
            border-bottom: 1px solid var(--gray-200);
            padding: 1rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .header-title {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: var(--radius);
            font-weight: 600;
            font-size: 0.875rem;
            transition: all 0.2s;
            cursor: pointer;
            border: none;
            text-decoration: none;
        }

        .btn-primary {
            background: var(--gradient);
            color: var(--white);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .btn-secondary {
            background: var(--white);
            border: 2px solid var(--gray-300);
            color: var(--gray-700);
        }

        .btn-secondary:hover {
            background: var(--gray-100);
        }

        /* Content */
        .content {
            flex: 1;
            padding: 2rem;
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
        }

        /* Stats Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: var(--white);
            padding: 1.5rem;
            border-radius: var(--radius-lg);
            border: 1px solid var(--gray-200);
            transition: all 0.2s;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;
        }

        .stat-title {
            font-size: 0.875rem;
            color: var(--gray-600);
            font-weight: 500;
        }

        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }

        .stat-icon.primary {
            background: rgba(99, 102, 241, 0.1);
            color: var(--primary);
        }

        .stat-icon.success {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .stat-icon.warning {
            background: rgba(245, 158, 11, 0.1);
            color: var(--warning);
        }

        .stat-icon.info {
            background: rgba(59, 130, 246, 0.1);
            color: var(--info);
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .stat-change {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.875rem;
            padding: 0.25rem 0.5rem;
            border-radius: var(--radius);
        }

        .stat-change.positive {
            color: var(--success);
            background: rgba(16, 185, 129, 0.1);
        }

        .stat-change.negative {
            color: var(--danger);
            background: rgba(239, 68, 68, 0.1);
        }

        /* Charts Section */
        .chart-container {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            border: 1px solid var(--gray-200);
            margin-bottom: 2rem;
        }

        .chart-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .chart-title {
            font-size: 1.125rem;
            font-weight: 600;
        }

        .chart-tabs {
            display: flex;
            gap: 0.5rem;
        }

        .chart-tab {
            padding: 0.375rem 0.75rem;
            border-radius: var(--radius);
            font-size: 0.875rem;
            background: var(--gray-100);
            color: var(--gray-600);
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }

        .chart-tab.active {
            background: var(--primary);
            color: var(--white);
        }

        /* Side Job List */
        .sidejob-list {
            background: var(--white);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            border: 1px solid var(--gray-200);
        }

        .list-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .list-title {
            font-size: 1.125rem;
            font-weight: 600;
        }

        .sidejob-item {
            display: flex;
            align-items: center;
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
            transition: all 0.2s;
        }

        .sidejob-item:hover {
            background: var(--gray-50);
        }

        .sidejob-item:last-child {
            border-bottom: none;
        }

        .sidejob-info {
            flex: 1;
            margin-left: 1rem;
        }

        .sidejob-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .sidejob-stats {
            font-size: 0.875rem;
            color: var(--gray-500);
        }

        .sidejob-status {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .status-active {
            background: rgba(16, 185, 129, 0.1);
            color: var(--success);
        }

        .status-inactive {
            background: rgba(156, 163, 175, 0.1);
            color: var(--gray-500);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s;
            }

            .sidebar.open {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }

        /* Chart Placeholder */
        .chart-placeholder {
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gray-50);
            border-radius: var(--radius);
            color: var(--gray-400);
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="/" class="logo">
                    <span>🎯</span>
                    <span>지플랫</span>
                </a>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-title">메인</div>
                    <a href="/dashboard" class="nav-item active">
                        <span class="nav-icon">📊</span>
                        <span>대시보드</span>
                    </a>
                    <a href="/card/edit" class="nav-item">
                        <span class="nav-icon">💳</span>
                        <span>내 명함</span>
                    </a>
                    <a href="/sidejobs" class="nav-item">
                        <span class="nav-icon">💼</span>
                        <span>부업 카드</span>
                        <span class="nav-badge">3</span>
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-title">관리</div>
                    <a href="/analytics" class="nav-item">
                        <span class="nav-icon">📈</span>
                        <span>통계 분석</span>
                    </a>
                    <a href="/customers" class="nav-item">
                        <span class="nav-icon">👥</span>
                        <span>고객 관리</span>
                    </a>
                    <a href="/callback" class="nav-item">
                        <span class="nav-icon">📲</span>
                        <span>콜백 설정</span>
                    </a>
                    <a href="/messages" class="nav-item">
                        <span class="nav-icon">💬</span>
                        <span>메시지</span>
                        <span class="nav-badge">5</span>
                    </a>
                </div>

                <div class="nav-section">
                    <div class="nav-title">설정</div>
                    <a href="/settings" class="nav-item">
                        <span class="nav-icon">⚙️</span>
                        <span>계정 설정</span>
                    </a>
                    <a href="/billing" class="nav-item">
                        <span class="nav-icon">💳</span>
                        <span>결제 관리</span>
                    </a>
                </div>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Header -->
            <header class="header">
                <h1 class="header-title">대시보드</h1>
                <div class="header-actions">
                    <button class="btn btn-secondary">
                        <span>📥</span>
                        <span>리포트 다운로드</span>
                    </button>
                    <a href="/card/edit" class="btn btn-primary">
                        <span>✏️</span>
                        <span>명함 편집</span>
                    </a>
                </div>
            </header>

            <!-- Content -->
            <div class="content">
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">오늘 방문자</span>
                            <div class="stat-icon primary">👀</div>
                        </div>
                        <div class="stat-value">${todayVisitors}</div>
                        <div class="stat-change positive">
                            <span>↑</span>
                            <span>12% 증가</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">신규 문의</span>
                            <div class="stat-icon success">💬</div>
                        </div>
                        <div class="stat-value">${newInquiries}</div>
                        <div class="stat-change positive">
                            <span>↑</span>
                            <span>8% 증가</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">카드 클릭</span>
                            <div class="stat-icon warning">👆</div>
                        </div>
                        <div class="stat-value">${totalClicks}</div>
                        <div class="stat-change negative">
                            <span>↓</span>
                            <span>3% 감소</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">전환율</span>
                            <div class="stat-icon info">📊</div>
                        </div>
                        <div class="stat-value">${conversionRate}%</div>
                        <div class="stat-change positive">
                            <span>↑</span>
                            <span>2.3% 증가</span>
                        </div>
                    </div>
                </div>

                <!-- Chart -->
                <div class="chart-container">
                    <div class="chart-header">
                        <h2 class="chart-title">방문자 추이</h2>
                        <div class="chart-tabs">
                            <button class="chart-tab active" onclick="changeChart('daily')">일간</button>
                            <button class="chart-tab" onclick="changeChart('weekly')">주간</button>
                            <button class="chart-tab" onclick="changeChart('monthly')">월간</button>
                        </div>
                    </div>
                    <div class="chart-placeholder">
                        📊 차트 영역 (Chart.js 또는 기타 차트 라이브러리 연동)
                    </div>
                </div>

                <!-- Side Job List -->
                <div class="sidejob-list">
                    <div class="list-header">
                        <h2 class="list-title">내 부업 카드</h2>
                        <a href="/sidejobs/add" class="btn btn-primary">
                            <span>+</span>
                            <span>카드 추가</span>
                        </a>
                    </div>

                    <div class="sidejob-item">
                        <span style="font-size: 2rem;">💧</span>
                        <div class="sidejob-info">
                            <div class="sidejob-name">프리미엄 정수기 렌탈</div>
                            <div class="sidejob-stats">조회 523 · 클릭 45 · 전환 12</div>
                        </div>
                        <span class="sidejob-status status-active">활성</span>
                    </div>

                    <div class="sidejob-item">
                        <span style="font-size: 2rem;">🚗</span>
                        <div class="sidejob-info">
                            <div class="sidejob-name">자동차 보험 컨설팅</div>
                            <div class="sidejob-stats">조회 412 · 클릭 38 · 전환 8</div>
                        </div>
                        <span class="sidejob-status status-active">활성</span>
                    </div>

                    <div class="sidejob-item">
                        <span style="font-size: 2rem;">📚</span>
                        <div class="sidejob-info">
                            <div class="sidejob-name">온라인 마케팅 강의</div>
                            <div class="sidejob-stats">조회 287 · 클릭 22 · 전환 5</div>
                        </div>
                        <span class="sidejob-status status-inactive">비활성</span>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- JavaScript -->
    <script>
        // 차트 탭 전환
        function changeChart(period) {
            const tabs = document.querySelectorAll('.chart-tab');
            tabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.textContent.includes(period === 'daily' ? '일간' :
                                            period === 'weekly' ? '주간' : '월간')) {
                    tab.classList.add('active');
                }
            });

            // 차트 데이터 로드 (AJAX)
            console.log('Loading chart data for:', period);
        }

        // 사이드바 토글 (모바일)
        function toggleSidebar() {
            document.querySelector('.sidebar').classList.toggle('open');
        }

        // 페이지 로드 시 초기화
        document.addEventListener('DOMContentLoaded', function() {
            // 실시간 데이터 업데이트 (WebSocket 또는 Polling)
            setInterval(updateStats, 30000); // 30초마다 업데이트
        });

        // 통계 업데이트
        function updateStats() {
            // AJAX로 최신 통계 데이터 가져오기
            fetch('/api/dashboard/stats')
                .then(response => response.json())
                .then(data => {
                    // DOM 업데이트
                    console.log('Stats updated:', data);
                })
                .catch(error => console.error('Error updating stats:', error));
        }
    </script>
</body>
</html>