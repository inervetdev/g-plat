<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Next Gen Analytics</title>

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
            --bg-hover: #242424;
            --text-primary: #ffffff;
            --text-secondary: #a0a0a0;
            --text-dim: #606060;
            --accent: #00dc82;
            --accent-secondary: #7c3aed;
            --accent-tertiary: #ff0080;
            --border: rgba(255, 255, 255, 0.08);
            --border-light: rgba(255, 255, 255, 0.04);
            --success: #00dc82;
            --warning: #ffb800;
            --danger: #ff3860;
            --info: #00d4ff;
        }

        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }

        @keyframes glow {
            0%, 100% {
                box-shadow: 0 0 20px rgba(0, 220, 130, 0.3);
            }
            50% {
                box-shadow: 0 0 40px rgba(0, 220, 130, 0.5);
            }
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
        }

        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background:
                radial-gradient(circle at 10% 20%, rgba(0, 220, 130, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.05) 0%, transparent 50%);
            pointer-events: none;
        }

        .sidebar {
            width: 80px;
            background: var(--bg-secondary);
            border-right: 1px solid var(--border);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem 0;
            transition: width 0.3s ease;
            position: relative;
            z-index: 100;
        }

        .sidebar:hover {
            width: 240px;
        }

        .logo {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 900;
            color: var(--text-primary);
            margin-bottom: 3rem;
            animation: glow 3s ease-in-out infinite;
        }

        .nav-menu {
            list-style: none;
            width: 100%;
        }

        .nav-item {
            margin-bottom: 0.5rem;
        }

        .nav-link {
            display: flex;
            align-items: center;
            padding: 1rem;
            color: var(--text-secondary);
            text-decoration: none;
            transition: all 0.3s;
            position: relative;
            overflow: hidden;
        }

        .nav-link::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: var(--accent);
            transform: translateX(-100%);
            transition: transform 0.3s;
        }

        .nav-link:hover {
            color: var(--text-primary);
            background: var(--bg-hover);
        }

        .nav-link.active {
            color: var(--accent);
            background: rgba(0, 220, 130, 0.1);
        }

        .nav-link.active::before {
            transform: translateX(0);
        }

        .nav-icon {
            font-size: 1.25rem;
            width: 48px;
            text-align: center;
            flex-shrink: 0;
        }

        .nav-text {
            opacity: 0;
            white-space: nowrap;
            transition: opacity 0.3s;
            font-size: 0.9rem;
        }

        .sidebar:hover .nav-text {
            opacity: 1;
        }

        .main-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .top-bar {
            height: 80px;
            padding: 0 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--border);
            background: var(--bg-secondary);
        }

        .search-box {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 0.75rem 1.5rem;
            width: 400px;
            color: var(--text-primary);
            font-size: 0.9rem;
        }

        .search-box::placeholder {
            color: var(--text-dim);
        }

        .top-bar-right {
            display: flex;
            gap: 1rem;
            align-items: center;
        }

        .icon-btn {
            width: 40px;
            height: 40px;
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
        }

        .icon-btn:hover {
            background: var(--bg-hover);
            color: var(--accent);
            border-color: var(--accent);
        }

        .notification-dot {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 8px;
            height: 8px;
            background: var(--danger);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        .main-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
        }

        .page-header {
            margin-bottom: 2rem;
            animation: slideInLeft 0.6s ease;
        }

        .page-title {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .page-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            animation: slideInUp 0.6s ease;
            animation-fill-mode: both;
            transition: all 0.3s;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100px;
            background: linear-gradient(180deg, rgba(0, 220, 130, 0.1) 0%, transparent 100%);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            border-color: var(--accent);
        }

        .stat-card:hover::before {
            opacity: 1;
        }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }

        .stat-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
        }

        .stat-icon {
            font-size: 1.5rem;
        }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .stat-change {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.375rem 0.75rem;
            background: rgba(0, 220, 130, 0.1);
            border: 1px solid rgba(0, 220, 130, 0.2);
            border-radius: 8px;
            color: var(--success);
            font-size: 0.8125rem;
            font-weight: 600;
        }

        .stat-change.negative {
            background: rgba(255, 56, 96, 0.1);
            border-color: rgba(255, 56, 96, 0.2);
            color: var(--danger);
        }

        .dashboard-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .panel {
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            animation: slideInUp 0.8s ease;
        }

        .panel-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .panel-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .panel-action {
            color: var(--accent);
            font-size: 0.875rem;
            cursor: pointer;
            transition: opacity 0.3s;
        }

        .panel-action:hover {
            opacity: 0.8;
        }

        .panel-body {
            padding: 1.5rem;
        }

        .chart-placeholder {
            height: 300px;
            background: linear-gradient(135deg, rgba(0, 220, 130, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%);
            border: 1px solid var(--border);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: var(--text-dim);
            position: relative;
            overflow: hidden;
        }

        .chart-placeholder::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent 48%, var(--accent) 50%, transparent 52%);
            animation: scan 3s linear infinite;
        }

        @keyframes scan {
            0% {
                transform: translateX(-100%) translateY(-100%);
            }
            100% {
                transform: translateX(100%) translateY(100%);
            }
        }

        .activity-feed {
            list-style: none;
        }

        .activity-item {
            padding: 1rem;
            border-bottom: 1px solid var(--border-light);
            display: flex;
            align-items: center;
            gap: 1rem;
            transition: background 0.3s;
        }

        .activity-item:hover {
            background: var(--bg-hover);
        }

        .activity-avatar {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            flex-shrink: 0;
        }

        .activity-content {
            flex: 1;
        }

        .activity-title {
            font-size: 0.9rem;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }

        .activity-time {
            font-size: 0.75rem;
            color: var(--text-dim);
        }

        .activity-status {
            width: 8px;
            height: 8px;
            background: var(--success);
            border-radius: 50%;
            flex-shrink: 0;
        }

        .data-table {
            width: 100%;
        }

        .table-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 100px;
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            font-size: 0.8125rem;
            color: var(--text-secondary);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .table-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 100px;
            padding: 1rem;
            border-bottom: 1px solid var(--border-light);
            transition: background 0.3s;
        }

        .table-row:hover {
            background: var(--bg-hover);
        }

        .service-name {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .service-icon {
            width: 32px;
            height: 32px;
            background: rgba(0, 220, 130, 0.1);
            border: 1px solid rgba(0, 220, 130, 0.2);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .metric-value {
            font-weight: 600;
            color: var(--text-primary);
        }

        .status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.75rem;
            background: rgba(0, 220, 130, 0.1);
            border: 1px solid rgba(0, 220, 130, 0.2);
            border-radius: 6px;
            color: var(--success);
            font-size: 0.75rem;
            font-weight: 600;
        }

        .status-indicator.warning {
            background: rgba(255, 184, 0, 0.1);
            border-color: rgba(255, 184, 0, 0.2);
            color: var(--warning);
        }
    </style>
</head>
<body>
    <aside class="sidebar">
        <div class="logo">
            <img src="/assets/GP 로고.png" alt="G-PLAT" style="width: 32px; height: 32px; object-fit: contain; filter: brightness(0) invert(1);">
        </div>

        <nav>
            <ul class="nav-menu">
                <li class="nav-item">
                    <a href="#" class="nav-link active">
                        <span class="nav-icon">⚡</span>
                        <span class="nav-text">Dashboard</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span class="nav-icon">📊</span>
                        <span class="nav-text">Analytics</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span class="nav-icon">👥</span>
                        <span class="nav-text">Network</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span class="nav-icon">🚀</span>
                        <span class="nav-text">Services</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span class="nav-icon">💎</span>
                        <span class="nav-text">Revenue</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link">
                        <span class="nav-icon">⚙️</span>
                        <span class="nav-text">Settings</span>
                    </a>
                </li>
            </ul>
        </nav>
    </aside>

    <div class="main-container">
        <header class="top-bar">
            <input type="search" class="search-box" placeholder="Search anything...">

            <div class="top-bar-right">
                <button class="icon-btn">
                    🔔
                    <span class="notification-dot"></span>
                </button>
                <button class="icon-btn">
                    💬
                </button>
                <button class="icon-btn">
                    👤
                </button>
            </div>
        </header>

        <main class="main-content">
            <div class="page-header">
                <h1 class="page-title">Analytics Dashboard</h1>
                <p class="page-subtitle">Real-time performance metrics</p>
            </div>

            <section class="stats-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Total Visits</span>
                        <span class="stat-icon">📈</span>
                    </div>
                    <div class="stat-value">24.8K</div>
                    <div class="stat-change">
                        <span>↑</span>
                        <span>23.5%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Active Users</span>
                        <span class="stat-icon">🔥</span>
                    </div>
                    <div class="stat-value">892</div>
                    <div class="stat-change">
                        <span>↑</span>
                        <span>12.3%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Conversion Rate</span>
                        <span class="stat-icon">🎯</span>
                    </div>
                    <div class="stat-value">28.5%</div>
                    <div class="stat-change negative">
                        <span>↓</span>
                        <span>2.1%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Revenue</span>
                        <span class="stat-icon">💰</span>
                    </div>
                    <div class="stat-value">₩42.3M</div>
                    <div class="stat-change">
                        <span>↑</span>
                        <span>18.9%</span>
                    </div>
                </div>
            </section>

            <div class="dashboard-grid">
                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Performance Overview</h2>
                        <span class="panel-action">View All →</span>
                    </div>
                    <div class="panel-body">
                        <div class="chart-placeholder">
                            📊
                        </div>
                    </div>
                </div>

                <div class="panel">
                    <div class="panel-header">
                        <h2 class="panel-title">Live Activity</h2>
                        <span class="panel-action">•••</span>
                    </div>
                    <div class="panel-body">
                        <ul class="activity-feed">
                            <li class="activity-item">
                                <div class="activity-avatar">🚀</div>
                                <div class="activity-content">
                                    <div class="activity-title">New service inquiry</div>
                                    <div class="activity-time">Just now</div>
                                </div>
                                <div class="activity-status"></div>
                            </li>
                            <li class="activity-item">
                                <div class="activity-avatar">💎</div>
                                <div class="activity-content">
                                    <div class="activity-title">Premium upgrade</div>
                                    <div class="activity-time">5 min ago</div>
                                </div>
                                <div class="activity-status"></div>
                            </li>
                            <li class="activity-item">
                                <div class="activity-avatar">👤</div>
                                <div class="activity-content">
                                    <div class="activity-title">Profile viewed</div>
                                    <div class="activity-time">12 min ago</div>
                                </div>
                                <div class="activity-status"></div>
                            </li>
                            <li class="activity-item">
                                <div class="activity-avatar">📱</div>
                                <div class="activity-content">
                                    <div class="activity-title">Contact saved</div>
                                    <div class="activity-time">1 hour ago</div>
                                </div>
                                <div class="activity-status"></div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="panel">
                <div class="panel-header">
                    <h2 class="panel-title">Service Performance</h2>
                    <span class="panel-action">Export →</span>
                </div>
                <div class="panel-body">
                    <div class="data-table">
                        <div class="table-header">
                            <div>Service</div>
                            <div>Views</div>
                            <div>Clicks</div>
                            <div>Revenue</div>
                            <div>Status</div>
                        </div>
                        <div class="table-row">
                            <div class="service-name">
                                <div class="service-icon">💧</div>
                                <span>Water Purifier</span>
                            </div>
                            <div class="metric-value">2,845</div>
                            <div class="metric-value">312</div>
                            <div class="metric-value">₩12.8M</div>
                            <div><span class="status-indicator">Active</span></div>
                        </div>
                        <div class="table-row">
                            <div class="service-name">
                                <div class="service-icon">🚗</div>
                                <span>Auto Insurance</span>
                            </div>
                            <div class="metric-value">1,923</div>
                            <div class="metric-value">189</div>
                            <div class="metric-value">₩8.2M</div>
                            <div><span class="status-indicator">Active</span></div>
                        </div>
                        <div class="table-row">
                            <div class="service-name">
                                <div class="service-icon">📚</div>
                                <span>Digital Course</span>
                            </div>
                            <div class="metric-value">4,156</div>
                            <div class="metric-value">523</div>
                            <div class="metric-value">₩21.3M</div>
                            <div><span class="status-indicator">Active</span></div>
                        </div>
                        <div class="table-row">
                            <div class="service-name">
                                <div class="service-icon">💼</div>
                                <span>Consulting</span>
                            </div>
                            <div class="metric-value">892</div>
                            <div class="metric-value">76</div>
                            <div class="metric-value">₩3.5M</div>
                            <div><span class="status-indicator warning">Review</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>