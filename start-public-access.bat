@echo off
cls
echo ========================================
echo  외부 접속 설정 도구
echo ========================================
echo.
echo 선택하세요:
echo.
echo 1. 같은 네트워크 접속 설정 (방화벽 규칙 추가)
echo 2. 인터넷 공개 (ngrok 터널링)
echo 3. 현재 접속 정보 보기
echo 4. 종료
echo.
set /p choice=선택 (1-4):

if "%choice%"=="1" goto firewall
if "%choice%"=="2" goto ngrok
if "%choice%"=="3" goto info
if "%choice%"=="4" exit

:firewall
echo.
echo Windows 방화벽 규칙을 추가합니다...
echo 관리자 권한이 필요합니다!
echo.
netsh advfirewall firewall add rule name="Tomcat 8080" dir=in action=allow protocol=TCP localport=8080
echo.
echo 방화벽 규칙이 추가되었습니다!
echo 같은 네트워크에서 접속: http://192.168.0.19:8080
pause
goto :eof

:ngrok
echo.
echo ngrok을 다운로드하고 실행합니다...
echo.

:: ngrok 다운로드 확인
if not exist "%USERPROFILE%\ngrok\ngrok.exe" (
    echo ngrok을 다운로드합니다...
    powershell -Command "Invoke-WebRequest -Uri 'https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip' -OutFile '%TEMP%\ngrok.zip'"
    powershell -Command "Expand-Archive -Path '%TEMP%\ngrok.zip' -DestinationPath '%USERPROFILE%\ngrok' -Force"
    echo ngrok 다운로드 완료!
)

echo.
echo ngrok 터널을 시작합니다...
echo 생성되는 URL을 통해 어디서든 접속 가능합니다!
echo (종료하려면 Ctrl+C를 누르세요)
echo.
"%USERPROFILE%\ngrok\ngrok.exe" http 8080
goto :eof

:info
echo.
echo ========================================
echo  현재 접속 정보
echo ========================================
echo.
echo 로컬 접속: http://localhost:8080
echo 같은 네트워크 접속: http://192.168.0.19:8080
echo.
echo Docker 컨테이너 상태:
docker ps --filter "name=gplat-web" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
pause
goto :eof