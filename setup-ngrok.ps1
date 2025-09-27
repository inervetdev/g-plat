# ngrok 설치 및 실행 스크립트

Write-Host "ngrok 설치 확인중..." -ForegroundColor Yellow

# ngrok이 설치되어 있는지 확인
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokPath) {
    Write-Host "ngrok이 설치되어 있지 않습니다. 설치를 시작합니다..." -ForegroundColor Yellow

    # Chocolatey로 설치 시도
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        Write-Host "Chocolatey로 ngrok 설치중..." -ForegroundColor Green
        choco install ngrok -y
    }
    else {
        Write-Host "수동으로 ngrok을 다운로드합니다..." -ForegroundColor Green

        # ngrok 다운로드
        $ngrokZip = "$env:TEMP\ngrok.zip"
        Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile $ngrokZip

        # 압축 해제
        Expand-Archive -Path $ngrokZip -DestinationPath "$env:USERPROFILE\ngrok" -Force

        # PATH에 추가
        $env:Path += ";$env:USERPROFILE\ngrok"

        Write-Host "ngrok이 다운로드되었습니다!" -ForegroundColor Green
    }
}

Write-Host "`n=== ngrok 터널링 시작 ===" -ForegroundColor Cyan
Write-Host "외부에서 접속 가능한 URL이 생성됩니다." -ForegroundColor White
Write-Host "생성된 URL을 누구나 접속할 수 있습니다.`n" -ForegroundColor Yellow

# ngrok 실행
if ($env:USERPROFILE) {
    & "$env:USERPROFILE\ngrok\ngrok.exe" http 8080
} else {
    ngrok http 8080
}