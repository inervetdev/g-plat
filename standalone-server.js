// Node.js로 간단한 서버 실행 (JSP 대신 정적 HTML)
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 정적 파일 서빙
app.use(express.static('.'));

// 메인 페이지
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>지플랫 - 모바일 명함 서비스</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            text-align: center;
            color: white;
            background: rgba(255,255,255,0.1);
            padding: 3rem;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        p {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .links {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
        a {
            padding: 1rem 2rem;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.3s;
            display: inline-block;
        }
        a:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .status {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(16, 185, 129, 0.2);
            border-radius: 10px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 지플랫</h1>
        <p>모바일 명함으로 시작하는 부업 플랫폼</p>
        <div class="links">
            <a href="/mobile-card">모바일 명함</a>
            <a href="/dashboard">대시보드</a>
            <a href="/gplat_mobile_card_app.html">샘플 명함</a>
        </div>
        <div class="status">
            ✅ 로컬 서버 실행 중 (포트: ${PORT})
        </div>
    </div>
</body>
</html>
    `);
});

// 모바일 명함 페이지 (HTML 버전)
app.get('/mobile-card', (req, res) => {
    const mobileCardPath = path.join(__dirname, 'mobile_card.jsp');
    if (fs.existsSync(mobileCardPath)) {
        let content = fs.readFileSync(mobileCardPath, 'utf8');
        // JSP 태그를 간단히 치환
        content = content.replace(/<%.*?%>/g, '')
                        .replace(/\${userName}/g, '김대리')
                        .replace(/\${userTitle}/g, '마케팅 매니저')
                        .replace(/\${userCompany}/g, 'ABC 컴퍼니')
                        .replace(/\${userPhone}/g, '010-1234-5678')
                        .replace(/\${userEmail}/g, 'kim@example.com')
                        .replace(/\${userDomain}/g, '김대리.한국')
                        .replace(/\${userAddress}/g, '서울시 강남구 테헤란로 123')
                        .replace(/\${todayVisitors}/g, '128')
                        .replace(/\${totalVisitors}/g, '5,234')
                        .replace(/\${cardClicks}/g, '89');
        res.send(content);
    } else {
        res.send('mobile_card.jsp 파일을 찾을 수 없습니다.');
    }
});

// 대시보드 페이지 (HTML 버전)
app.get('/dashboard', (req, res) => {
    const dashboardPath = path.join(__dirname, 'dashboard.jsp');
    if (fs.existsSync(dashboardPath)) {
        let content = fs.readFileSync(dashboardPath, 'utf8');
        // JSP 태그를 간단히 치환
        content = content.replace(/<%.*?%>/g, '')
                        .replace(/\${todayVisitors}/g, '128')
                        .replace(/\${newInquiries}/g, '24')
                        .replace(/\${totalClicks}/g, '456')
                        .replace(/\${conversionRate}/g, '18.7');
        res.send(content);
    } else {
        res.send('dashboard.jsp 파일을 찾을 수 없습니다.');
    }
});

// 기존 HTML 파일들 서빙
app.get('/gplat_mobile_card_app.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'gplat_mobile_card_app.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`
========================================
 🎯 지플랫 서버가 시작되었습니다!
========================================

 브라우저에서 접속하세요:
 http://localhost:${PORT}

 주요 페이지:
 - 메인: http://localhost:${PORT}
 - 모바일 명함: http://localhost:${PORT}/mobile-card
 - 대시보드: http://localhost:${PORT}/dashboard
 - 샘플: http://localhost:${PORT}/gplat_mobile_card_app.html

 종료: Ctrl + C
========================================
    `);
});

// 에러 처리
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('서버 오류가 발생했습니다.');
});