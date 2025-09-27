@echo off
echo ========================================
echo  지플랫 로컬 서버 실행 스크립트
echo ========================================
echo.

REM Java 버전 확인
java -version
if errorlevel 1 (
    echo [ERROR] Java가 설치되지 않았습니다.
    echo https://adoptium.net/ 에서 Java 11 이상을 설치하세요.
    pause
    exit /b 1
)

echo.
echo [1] Tomcat 다운로드 중...
if not exist "tomcat" (
    echo Tomcat을 다운로드합니다...
    powershell -Command "Invoke-WebRequest -Uri 'https://dlcdn.apache.org/tomcat/tomcat-9/v9.0.93/bin/apache-tomcat-9.0.93-windows-x64.zip' -OutFile 'tomcat.zip'"
    powershell -Command "Expand-Archive -Path 'tomcat.zip' -DestinationPath '.'"
    rename apache-tomcat-9.0.93 tomcat
    del tomcat.zip
)

echo.
echo [2] JSP 파일 복사 중...
xcopy /E /Y webapps\* tomcat\webapps\

echo.
echo [3] Tomcat 서버 시작...
cd tomcat\bin
call startup.bat

echo.
echo ========================================
echo  서버가 시작되었습니다!
echo
echo  브라우저에서 접속하세요:
echo  http://localhost:8080
echo ========================================
echo.
pause