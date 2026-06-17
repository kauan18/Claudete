@echo off
chcp 65001 >nul
title OdontoApp - Servidor Local
cd /d "%~dp0"

echo.
echo  ==========================================
echo    OdontoApp - iniciando servidor local
echo  ==========================================
echo.
echo  O site abrira no navegador em instantes.
echo  Se aparecer "nao foi possivel conectar",
echo  aguarde alguns segundos e atualize (F5).
echo.
echo  Para PARAR o servidor: feche esta janela.
echo.

REM Abre o navegador apos 8s (tempo de o servidor subir), em paralelo
start "" cmd /c "timeout /t 8 /nobreak >nul & start http://localhost:3000/c/sorriso-perfeito"

REM Sobe o servidor de desenvolvimento (bloqueante; mantem a janela aberta)
call npm run dev
