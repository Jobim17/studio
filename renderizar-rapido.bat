@echo off
chcp 65001 >nul
title Studio - Render rapido
cd /d "%~dp0"

echo.
echo === Render rapido (usa o PC inteiro, visual identico) ===
echo.

where git >nul 2>nul
if not errorlevel 1 (
  echo Baixando a versao mais nova do codigo...
  git pull --ff-only
)
if not exist "node_modules\" call npm install

set "ID=JornadaGuru"
set /p "ID=Qual composicao renderizar? [Enter = JornadaGuru]: "
echo.
node scripts\render-rapido.mjs %ID% "out\%ID%.mp4"
echo.
explorer out
pause
