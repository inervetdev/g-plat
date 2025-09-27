<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Executive Dashboard - G-PLAT</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --navy: #1e3a5f;
            --navy-dark: #0f1f35;
            --navy-light: #2a4a70;
            --gold: #c9a961;
            --gold-light: #e0c080;
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
            --info: #3b82f6;
        }

        body {
            font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', -apple-system, sans-serif;
            background: var(--gray-50);
            color: var(--gray-900);
            min-height: 100vh;
            display: flex;
        }

        .sidebar {
            width: 280px;
            background: var(--navy);
            color: var(--white);
            height: 100vh;
            position: fixed;
            overflow-y: auto;
        }

        .sidebar-header {
            padding: 2rem;
            background: var(--navy-dark);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--gold);
            margin-bottom: 0.5rem;
        }

        .logo-subtitle {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.7);
        }

        .user-profile {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar {
            width: 48px;
            height: 48px;
            background: var(--gold);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: var(--navy);
            margin-bottom: 1rem;
        }

        .user-name {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .user-role {
            font-size: 0.875rem;
            color: var(--gold);
        }

        .nav-menu {
            padding: 1rem 0;
            list-style: none;
        }

        .nav-item {
            margin-bottom: 0.25rem;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.875rem 2rem;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: all 0.3s;
            position: relative;
        }

        .nav-link:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--white);
        }

        .nav-link.active {
            background: rgba(255, 255, 255, 0.1);
            color: var(--gold);
        }

        .nav-link.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 4px;
            background: var(--gold);
        }

        .main-container {
            margin-left: 280px;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .top-bar {
            background: var(--white);
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .page-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--navy);
        }

        .top-bar-actions {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .notification-btn {
            width: 40px;
            height: 40px;
            border: 1px solid var(--gray-200);
            background: var(--white);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
        }

        .notification-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            width: 20px;
            height: 20px;
            background: var(--danger);
            color: var(--white);
            border-radius: 50%;
            font-size: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .main-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
        }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .kpi-card {
            background: var(--white);
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
        }

        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--navy);
        }

        .kpi-card.gold::before {
            background: var(--gold);
        }

        .kpi-card.success::before {
            background: var(--success);
        }

        .kpi-card.warning::before {
            background: var(--warning);
        }

        .kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .kpi-label {
            font-size: 0.875rem;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .kpi-icon {
            width: 40px;
            height: 40px;
            background: var(--gray-100);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--navy);
        }

        .kpi-value {
            font-size: 2.25rem;
            font-weight: 700;
            color: var(--navy);
            margin-bottom: 0.5rem;
        }

        .kpi-change {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
        }

        .kpi-change.positive {
            color: var(--success);
        }

        .kpi-change.negative {
            color: var(--danger);
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .panel {
            background: var(--white);
            border: 1px solid var(--gray-200);
            border-radius: 12px;
            overflow: hidden;
        }

        .panel-header {
            padding: 1.5rem;
            background: var(--gray-50);
            border-bottom: 1px solid var(--gray-200);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .panel-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--navy);
        }

        .panel-action {
            padding: 0.5rem 1rem;
            background: var(--navy);
            color: var(--white);
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
        }

        .panel-body {
            padding: 1.5rem;
        }

        .chart-container {
            height: 300px;
            background: linear-gradient(135deg, var(--gray-50) 0%, var(--gray-100) 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--gray-500);
        }

        .activity-list {
            list-style: none;
        }

        .activity-item {
            padding: 1rem;
            border-bottom: 1px solid var(--gray-100);
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            width: 40px;
            height: 40px;
            background: var(--navy);
            color: var(--white);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-size: 0.9375rem;
            font-weight: 600;
            color: var(--gray-900);
            margin-bottom: 0.25rem;
        }

        .activity-time {
            font-size: 0.8125rem;
            color: var(--gray-500);
        }

        .activity-badge {
            padding: 0.25rem 0.75rem;
            background: var(--gold);
            color: var(--navy);
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th {
            text-align: left;
            padding: 1rem;
            background: var(--gray-50);
            border-bottom: 2px solid var(--gray-200);
            font-weight: 600;
            color: var(--gray-600);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .data-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--gray-100);
        }

        .status-badge {
            display: inline-block;
            padding: 0.375rem 0.875rem;
            border-radius: 6px;
            font-size: 0.8125rem;
            font-weight: 600;
        }

        .status-badge.active {
            background: var(--success);
            color: var(--white);
        }

        .status-badge.pending {
            background: var(--warning);
            color: var(--white);
        }

        .status-badge.inactive {
            background: var(--gray-200);
            color: var(--gray-600);
        }
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="sidebar-header">
            <img src="/assets/GP 로고.png" alt="G-PLAT" style="height: 40px; margin-bottom: 8px; filter: brightness(0) invert(1);">
            <div class="logo-subtitle">Executive Dashboard</div>
        </div>

        <div class="user-profile">
            <div class="user-avatar">김</div>
            <div class="user-name">김대리</div>
            <div class="user-role">Marketing Manager</div>
        </div>

        <nav>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="#" class="nav-link active">
                        <span>📊</span>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span>📈</span>
                        <span>Analytics</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span>👥</span>
                        <span>Contacts</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span>💼</span>
                        <span>Services</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span>💰</span>
                        <span>Revenue</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span>⚙️</span>
                        <span>Settings</span>
                    </a>
                </li>
            </ul>
        </nav>
    </aside>

    <div class="main-container">
        <div class="top-bar">
            <h1 class="page-title">Executive Overview</h1>
            <div class="top-bar-actions">
                <button class="notification-btn">
                    🔔
                    <span class="notification-badge">3</span>
                </button>
            </div>
        </div>

        <main class="main-content">
            <section class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <span class="kpi-label">Total Visits</span>
                        <div class="kpi-icon">👁️</div>
                    </div>
                    <div class="kpi-value">12,584</div>
                    <div class="kpi-change positive">
                        <span>↑</span>
                        <span>15.3% vs last month</span>
                    </div>
                </div>

                <div class="kpi-card gold">
                    <div class="kpi-header">
                        <span class="kpi-label">Business Inquiries</span>
                        <div class="kpi-icon">💼</div>
                    </div>
                    <div class="kpi-value">428</div>
                    <div class="kpi-change positive">
                        <span>↑</span>
                        <span>8.7% vs last month</span>
                    </div>
                </div>

                <div class="kpi-card success">
                    <div class="kpi-header">
                        <span class="kpi-label">Conversion Rate</span>
                        <div class="kpi-icon">📊</div>
                    </div>
                    <div class="kpi-value">23.8%</div>
                    <div class="kpi-change positive">
                        <span>↑</span>
                        <span>2.1% vs last month</span>
                    </div>
                </div>

                <div class="kpi-card warning">
                    <div class="kpi-header">
                        <span class="kpi-label">Monthly Revenue</span>
                        <div class="kpi-icon">💰</div>
                    </div>
                    <div class="kpi-value">₩15.2M</div>
                    <div class="kpi-change negative">
                        <span>↓</span>
                        <span>3.2% vs last month</span>
                    </div>
                </div>
            </section>

            <div class="dashboard-grid">
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Performance Analytics</h2>
                        <button class="panel-action">View Details</button>
                    </div>
                    <div class="panel-body">
                        <div class="chart-container">
                            📈 Advanced Chart Visualization
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Recent Activities</h2>
                    </div>
                    <div class="panel-body">
                        <ul class="activity-list">
                            <li class="activity-item">
                                <div class="activity-icon">📱</div>
                                <div class="activity-content">
                                    <div class="activity-title">New Contact Request</div>
                                    <div class="activity-time">5 minutes ago</div>
                                </div>
                                <span class="activity-badge">NEW</span>
                            </li>
                            <li class="activity-item">
                                <div class="activity-icon">💼</div>
                                <div class="activity-content">
                                    <div class="activity-title">Service Inquiry</div>
                                    <div class="activity-time">1 hour ago</div>
                                </div>
                            </li>
                            <li class="activity-item">
                                <div class="activity-icon">✅</div>
                                <div class="activity-content">
                                    <div class="activity-title">Deal Closed</div>
                                    <div class="activity-time">3 hours ago</div>
                                </div>
                            </li>
                            <li class="activity-item">
                                <div class="activity-icon">👤</div>
                                <div class="activity-content">
                                    <div class="activity-title">Profile Updated</div>
                                    <div class="activity-time">Yesterday</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="panel-header">
                    <h2 class="panel-title">Service Performance</h2>
                    <button class="panel-action">Export Data</button>
                </div>
                <div class="panel-body">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Inquiries</th>
                                <th>Conversion</th>
                                <th>Revenue</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Premium Water Purifier</td>
                                <td>156</td>
                                <td>28.2%</td>
                                <td>₩4.2M</td>
                                <td><span class="status-badge active">Active</span></td>
                            </tr>
                            <tr>
                                <td>Auto Insurance Consulting</td>
                                <td>89</td>
                                <td>18.5%</td>
                                <td>₩2.8M</td>
                                <td><span class="status-badge active">Active</span></td>
                            </tr>
                            <tr>
                                <td>Digital Marketing Course</td>
                                <td>234</td>
                                <td>35.7%</td>
                                <td>₩8.2M</td>
                                <td><span class="status-badge active">Active</span></td>
                            </tr>
                            <tr>
                                <td>Business Consulting</td>
                                <td>45</td>
                                <td>12.3%</td>
                                <td>₩1.5M</td>
                                <td><span class="status-badge pending">Review</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</body>
</html>