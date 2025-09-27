<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true"%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>서버 오류 - 지플랫</title>
    <style>
        body {
            font-family: -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0;
        }
        .error-container {
            text-align: center;
            color: white;
            padding: 2rem;
        }
        h1 { font-size: 4rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; }
        a {
            display: inline-block;
            padding: 1rem 2rem;
            background: white;
            color: #667eea;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>500</h1>
        <p>서버 오류가 발생했습니다.</p>
        <p>JSP 컴파일 오류 또는 JSTL 라이브러리가 누락되었을 수 있습니다.</p>
        <a href="/">홈으로 돌아가기</a>
    </div>
</body>
</html>