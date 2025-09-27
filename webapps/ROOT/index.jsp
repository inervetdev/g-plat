<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
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
        .info {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="/assets/GP 로고.png" alt="G-PLAT" style="height: 80px; margin-bottom: 1rem;">
        <h1 style="font-size: 2.5rem;">G-PLAT</h1>
        <p>모바일 명함으로 시작하는 부업 플랫폼</p>
        <div class="links">
            <a href="/card/mobile_card_simple.jsp">모바일 명함 (간단)</a>
            <a href="/card/mobile_card_professional.jsp">모바일 명함 (전문가)</a>
            <a href="/card/mobile_card_trendy.jsp">모바일 명함 (트렌디)</a>
            <a href="/card/mobile_card_apple.jsp">모바일 명함 (애플)</a>
            <a href="/admin/dashboard_simple.jsp">대시보드 (간단)</a>
            <a href="/admin/dashboard_professional.jsp">대시보드 (전문가)</a>
            <a href="/admin/dashboard_trendy.jsp">대시보드 (트렌디)</a>
            <a href="/admin/dashboard_apple.jsp">대시보드 (애플)</a>
        </div>
        <div class="info">
            <p>✅ Tomcat 서버 실행 중</p>
            <p>💡 JSTL 태그 없는 간단한 버전으로 수정되었습니다</p>
        </div>
    </div>
</body>
</html>