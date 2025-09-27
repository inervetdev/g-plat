@echo off
echo Windows 방화벽에 8080 포트 규칙 추가중...
echo.
echo 이 작업은 관리자 권한이 필요합니다.
echo 마우스 우클릭 -> "관리자 권한으로 실행"을 선택해주세요.
echo.

netsh advfirewall firewall add rule name="Tomcat 8080" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="Tomcat 8080 Out" dir=out action=allow protocol=TCP localport=8080

echo.
echo 방화벽 규칙이 추가되었습니다!
echo.
echo 이제 같은 네트워크의 다른 기기에서 접속 가능합니다:
echo http://192.168.0.19:8080
echo.
pause