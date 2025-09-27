<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>관리자 대시보드 - 지플랫</title>

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
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-600: #4b5563;
            --gray-900: #111827;
            --white: #ffffff;
            --gradient: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
            --shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --radius: 0.5rem;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            color: var(--gray-900);
            min-height: 100vh;
            display: flex;
        }

        .sidebar {
            width: 250px;
            background: var(--white);
            border-right: 1px solid var(--gray-200);
            padding: 2rem 1rem;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--primary);
            margin-bottom: 2rem;
            text-align: center;
        }

        .nav-menu {
            list-style: none;
        }

        .nav-item {
            margin-bottom: 0.5rem;
        }

        .nav-link {
            display: block;
            padding: 0.75rem 1rem;
            color: var(--gray-600);
            text-decoration: none;
            border-radius: var(--radius);
            transition: all 0.3s;
        }

        .nav-link:hover {
            background: var(--gray-100);
            color: var(--primary);
        }

        .nav-link.active {
            background: var(--gradient);
            color: var(--white);
        }

        .main-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
        }

        .header {
            margin-bottom: 2rem;
        }

        .header h1 {
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
        }

        .header p {
            color: var(--gray-600);
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: var(--white);
            padding: 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            background: var(--gradient);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .stat-label {
            color: var(--gray-600);
            font-size: 0.875rem;
        }

        .stat-change {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: #10b981;
            color: var(--white);
            border-radius: 0.25rem;
            font-size: 0.75rem;
            margin-top: 0.5rem;
        }

        .stat-change.negative {
            background: #ef4444;
        }

        .chart-section {
            background: var(--white);
            padding: 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            margin-bottom: 2rem;
        }

        .chart-header {
            margin-bottom: 1.5rem;
        }

        .chart-title {
            font-size: 1.25rem;
            font-weight: 700;
        }

        .chart-placeholder {
            height: 300px;
            background: var(--gray-100);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gray-600);
        }

        .table-section {
            background: var(--white);
            padding: 1.5rem;
            border-radius: var(--radius);
            box-shadow: var(--shadow);
        }

        .table-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }

        .table-title {
            font-size: 1.25rem;
            font-weight: 700;
        }

        .btn {
            padding: 0.5rem 1rem;
            background: var(--gradient);
            color: var(--white);
            border: none;
            border-radius: var(--radius);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            text-align: left;
            padding: 0.75rem;
            border-bottom: 2px solid var(--gray-200);
            font-weight: 600;
            color: var(--gray-600);
            font-size: 0.875rem;
        }

        td {
            padding: 0.75rem;
            border-bottom: 1px solid var(--gray-100);
        }

        .status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .status.active {
            background: #10b981;
            color: var(--white);
        }

        .status.pending {
            background: #f59e0b;
            color: var(--white);
        }

        .status.inactive {
            background: var(--gray-300);
            color: var(--gray-600);
        }

        @media (max-width: 768px) {
            .sidebar {
                display: none;
            }

            .main-content {
                padding: 1rem;
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="logo">
            <img src="/assets/GP 로고.png" alt="G-PLAT" style="height: 35px;">
        </div>
        <nav>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="#" class="nav-link active">📊 대시보드</a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">👤 프로필 관리</a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">💼 부업 관리</a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">📈 통계 분석</a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">💳 결제 관리</a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">⚙️ 설정</a>
                </li>
            </ul>
        </nav>
    </aside>

    <main class="main-content">
        <header class="header">
            <h1>대시보드</h1>
            <p>김대리님, 오늘도 좋은 하루 되세요!</p>
        </header>

        <section class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👁️</div>
                <div class="stat-value">1,234</div>
                <div class="stat-label">오늘 방문자</div>
                <span class="stat-change">+12.5%</span>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📱</div>
                <div class="stat-value">89</div>
                <div class="stat-label">연락 요청</div>
                <span class="stat-change">+8.2%</span>
            </div>

            <div class="stat-card">
                <div class="stat-icon">💼</div>
                <div class="stat-value">23</div>
                <div class="stat-label">부업 문의</div>
                <span class="stat-change negative">-3.1%</span>
            </div>

            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">₩2.3M</div>
                <div class="stat-label">이번달 수익</div>
                <span class="stat-change">+18.7%</span>
            </div>
        </section>

        <section class="chart-section">
            <div class="chart-header">
                <h2 class="chart-title">방문 통계</h2>
            </div>
            <div class="chart-placeholder">
                📊 차트 영역 (구현 예정)
            </div>
        </section>

        <section class="table-section">
            <div class="table-header">
                <h2 class="table-title">최근 활동</h2>
                <button class="btn">전체보기</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>시간</th>
                        <th>방문자</th>
                        <th>활동</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>10분 전</td>
                        <td>이과장</td>
                        <td>명함 저장</td>
                        <td><span class="status active">완료</span></td>
                    </tr>
                    <tr>
                        <td>25분 전</td>
                        <td>박대리</td>
                        <td>정수기 문의</td>
                        <td><span class="status pending">대기중</span></td>
                    </tr>
                    <tr>
                        <td>1시간 전</td>
                        <td>김부장</td>
                        <td>프로필 조회</td>
                        <td><span class="status active">완료</span></td>
                    </tr>
                    <tr>
                        <td>2시간 전</td>
                        <td>최사원</td>
                        <td>보험 상담 신청</td>
                        <td><span class="status pending">대기중</span></td>
                    </tr>
                </tbody>
            </table>
        </section>
    </main>
</body>
</html>