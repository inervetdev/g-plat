<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard — G-PLAT</title>

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            /* macOS System Colors */
            --sidebar-bg: rgba(246, 246, 246, 0.95);
            --sidebar-border: rgba(0, 0, 0, 0.1);
            --sidebar-active: rgba(0, 122, 255, 0.1);
            --system-background: #ffffff;
            --system-secondary: #f5f5f7;
            --system-blue: #0071e3;
            --system-gray: #86868b;
            --system-green: #00c853;
            --system-red: #ff3b30;
            --system-orange: #ff9500;
            --system-purple: #bf5af2;
            --text-primary: #1d1d1f;
            --text-secondary: #86868b;
            --border-color: #d2d2d7;
            --sf-pro: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
            --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
            --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
            --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --sidebar-bg: rgba(40, 40, 40, 0.95);
                --sidebar-border: rgba(255, 255, 255, 0.1);
                --sidebar-active: rgba(10, 132, 255, 0.3);
                --system-background: #1d1d1f;
                --system-secondary: #2c2c2e;
                --system-blue: #0a84ff;
                --text-primary: #f5f5f7;
                --text-secondary: #98989d;
                --border-color: #424245;
            }
        }

        body {
            font-family: var(--sf-pro);
            background: var(--system-secondary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Sidebar */
        .sidebar {
            width: 240px;
            background: var(--sidebar-bg);
            backdrop-filter: blur(50px);
            -webkit-backdrop-filter: blur(50px);
            border-right: 1px solid var(--sidebar-border);
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100vh;
            z-index: 100;
        }

        .sidebar-header {
            padding: 24px 20px;
            border-bottom: 1px solid var(--sidebar-border);
        }

        .sidebar-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, var(--system-blue) 0%, var(--system-purple) 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 14px;
        }

        .user-details h3 {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 2px;
        }

        .user-details p {
            font-size: 12px;
            color: var(--text-secondary);
        }

        .nav-section {
            padding: 12px 0;
        }

        .nav-section-title {
            padding: 8px 20px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 20px;
            color: var(--text-primary);
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            transition: background 0.2s;
            position: relative;
        }

        .nav-item:hover {
            background: rgba(0, 0, 0, 0.05);
        }

        .nav-item.active {
            background: var(--sidebar-active);
            color: var(--system-blue);
        }

        .nav-item.active::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 20px;
            background: var(--system-blue);
            border-radius: 0 2px 2px 0;
        }

        .nav-icon {
            width: 20px;
            text-align: center;
            font-size: 16px;
        }

        /* Main Content */
        .main-container {
            flex: 1;
            margin-left: 240px;
            display: flex;
            flex-direction: column;
        }

        .top-bar {
            background: var(--system-background);
            border-bottom: 1px solid var(--border-color);
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 50;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }

        .page-title {
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }

        .top-actions {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .search-field {
            background: var(--system-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 8px 12px;
            width: 200px;
            font-family: var(--sf-pro);
            font-size: 13px;
        }

        .icon-button {
            width: 32px;
            height: 32px;
            background: var(--system-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .icon-button:hover {
            background: var(--border-color);
        }

        .main-content {
            padding: 24px;
            flex: 1;
            overflow-y: auto;
        }

        /* Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }

        .stat-card {
            background: var(--system-background);
            border-radius: 12px;
            padding: 20px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--system-blue) 0%, var(--system-purple) 100%);
        }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
        }

        .stat-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-icon {
            width: 32px;
            height: 32px;
            background: var(--system-secondary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: -1px;
            margin-bottom: 8px;
        }

        .stat-change {
            font-size: 13px;
            font-weight: 500;
            color: var(--system-green);
        }

        .stat-change.negative {
            color: var(--system-red);
        }

        /* Charts Section */
        .chart-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            margin-bottom: 32px;
        }

        .chart-panel {
            background: var(--system-background);
            border-radius: 12px;
            padding: 24px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .panel-title {
            font-size: 17px;
            font-weight: 600;
            letter-spacing: -0.4px;
        }

        .panel-controls {
            display: flex;
            gap: 8px;
        }

        .control-button {
            padding: 6px 12px;
            background: var(--system-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            font-family: var(--sf-pro);
        }

        .control-button.active {
            background: var(--system-blue);
            color: white;
            border-color: var(--system-blue);
        }

        .chart-placeholder {
            height: 240px;
            background: var(--system-secondary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            font-size: 14px;
        }

        /* Activity List */
        .activity-list {
            list-style: none;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-color);
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-dot {
            width: 8px;
            height: 8px;
            background: var(--system-green);
            border-radius: 50%;
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 2px;
        }

        .activity-time {
            font-size: 11px;
            color: var(--text-secondary);
        }

        /* Table */
        .table-panel {
            background: var(--system-background);
            border-radius: 12px;
            padding: 24px;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
        }

        .data-table th {
            text-align: left;
            padding: 12px;
            font-size: 11px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border-color);
        }

        .data-table td {
            padding: 12px;
            font-size: 13px;
            border-bottom: 1px solid var(--border-color);
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge.success {
            background: rgba(0, 200, 83, 0.1);
            color: var(--system-green);
        }

        .badge.warning {
            background: rgba(255, 149, 0, 0.1);
            color: var(--system-orange);
        }

        .badge.info {
            background: rgba(0, 122, 255, 0.1);
            color: var(--system-blue);
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <img src="/assets/GP 로고.png" alt="G-PLAT" style="height: 28px; margin-bottom: 12px; opacity: 0.8;">
            <div class="sidebar-title">Admin Dashboard</div>
            <div class="user-info">
                <div class="user-avatar">김</div>
                <div class="user-details">
                    <h3>김대리</h3>
                    <p>Administrator</p>
                </div>
            </div>
        </div>

        <nav>
            <div class="nav-section">
                <div class="nav-section-title">Main</div>
                <a href="#" class="nav-item active">
                    <span class="nav-icon">📊</span>
                    <span>Dashboard</span>
                </a>
                <a href="#" class="nav-item">
                    <span class="nav-icon">📈</span>
                    <span>Analytics</span>
                </a>
                <a href="#" class="nav-item">
                    <span class="nav-icon">👥</span>
                    <span>Contacts</span>
                </a>
            </div>

            <div class="nav-section">
                <div class="nav-section-title">Services</div>
                <a href="#" class="nav-item">
                    <span class="nav-icon">💼</span>
                    <span>Side Jobs</span>
                </a>
                <a href="#" class="nav-item">
                    <span class="nav-icon">💳</span>
                    <span>Payments</span>
                </a>
                <a href="#" class="nav-item">
                    <span class="nav-icon">📱</span>
                    <span>Mobile Cards</span>
                </a>
            </div>

            <div class="nav-section">
                <div class="nav-section-title">System</div>
                <a href="#" class="nav-item">
                    <span class="nav-icon">⚙️</span>
                    <span>Settings</span>
                </a>
                <a href="#" class="nav-item">
                    <span class="nav-icon">🔔</span>
                    <span>Notifications</span>
                </a>
            </div>
        </nav>
    </aside>

    <!-- Main Container -->
    <div class="main-container">
        <!-- Top Bar -->
        <header class="top-bar">
            <h1 class="page-title">Dashboard</h1>
            <div class="top-actions">
                <input type="search" class="search-field" placeholder="Search...">
                <button class="icon-button">🔔</button>
                <button class="icon-button">⚙️</button>
            </div>
        </header>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Stats Grid -->
            <section class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Total Visitors</span>
                        <div class="stat-icon">👥</div>
                    </div>
                    <div class="stat-value">8,462</div>
                    <div class="stat-change">↑ 12% from last month</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Active Services</span>
                        <div class="stat-icon">💼</div>
                    </div>
                    <div class="stat-value">24</div>
                    <div class="stat-change">↑ 3 new this week</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Conversion Rate</span>
                        <div class="stat-icon">📈</div>
                    </div>
                    <div class="stat-value">18.5%</div>
                    <div class="stat-change negative">↓ 2.1% from last week</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Revenue</span>
                        <div class="stat-icon">💰</div>
                    </div>
                    <div class="stat-value">₩24.8M</div>
                    <div class="stat-change">↑ 18% from last month</div>
                </div>
            </section>

            <!-- Charts Section -->
            <section class="chart-grid">
                <div class="chart-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Performance Overview</h2>
                        <div class="panel-controls">
                            <button class="control-button">Day</button>
                            <button class="control-button active">Week</button>
                            <button class="control-button">Month</button>
                        </div>
                    </div>
                    <div class="chart-placeholder">
                        Chart Visualization Area
                    </div>
                </div>

                <div class="chart-panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Recent Activity</h2>
                    </div>
                    <ul class="activity-list">
                        <li class="activity-item">
                            <div class="activity-dot"></div>
                            <div class="activity-content">
                                <div class="activity-title">New contact saved</div>
                                <div class="activity-time">2 minutes ago</div>
                            </div>
                        </li>
                        <li class="activity-item">
                            <div class="activity-dot" style="background: var(--system-orange)"></div>
                            <div class="activity-content">
                                <div class="activity-title">Service inquiry received</div>
                                <div class="activity-time">15 minutes ago</div>
                            </div>
                        </li>
                        <li class="activity-item">
                            <div class="activity-dot" style="background: var(--system-blue)"></div>
                            <div class="activity-content">
                                <div class="activity-title">Profile updated</div>
                                <div class="activity-time">1 hour ago</div>
                            </div>
                        </li>
                        <li class="activity-item">
                            <div class="activity-dot"></div>
                            <div class="activity-content">
                                <div class="activity-title">New subscription</div>
                                <div class="activity-time">3 hours ago</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            <!-- Table Section -->
            <section class="table-panel">
                <div class="panel-header">
                    <h2 class="panel-title">Top Services</h2>
                    <button class="control-button">View All</button>
                </div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Views</th>
                            <th>Conversions</th>
                            <th>Revenue</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Premium Water Purifier</td>
                            <td>2,847</td>
                            <td>142</td>
                            <td>₩8.5M</td>
                            <td><span class="badge success">Active</span></td>
                        </tr>
                        <tr>
                            <td>Auto Insurance</td>
                            <td>1,923</td>
                            <td>87</td>
                            <td>₩5.2M</td>
                            <td><span class="badge success">Active</span></td>
                        </tr>
                        <tr>
                            <td>Marketing Course</td>
                            <td>3,156</td>
                            <td>234</td>
                            <td>₩11.1M</td>
                            <td><span class="badge success">Active</span></td>
                        </tr>
                        <tr>
                            <td>Business Consulting</td>
                            <td>892</td>
                            <td>23</td>
                            <td>₩2.8M</td>
                            <td><span class="badge warning">Review</span></td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </main>
    </div>
</body>
</html>