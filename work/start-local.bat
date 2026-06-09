@echo off
cd /d "%~dp0"
echo Iniciando Escala de Trabalho...
echo Se a porta 3000 estiver ocupada, o sistema tentara 3001, 3002 etc.
echo.
node src\server.js
pause
