@echo off
chcp 65001 >nul
title Studio - Remotion
cd /d "%~dp0"

echo.
echo === Abrindo o Studio ===
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] O Node.js nao esta instalado neste PC.
  echo Instale em https://nodejs.org ^(versao LTS^) e de dois cliques neste arquivo de novo.
  pause
  exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
  echo [aviso] Git nao encontrado: vou abrir sem baixar atualizacoes.
) else (
  echo Baixando a versao mais nova do codigo...
  git pull --ff-only
  if errorlevel 1 echo [aviso] Nao consegui atualizar. Vou abrir a versao que ja esta aqui.
)

if not exist "node_modules\" (
  echo.
  echo Primeira vez neste PC: instalando o Remotion. Leva alguns minutos...
  call npm install
  if errorlevel 1 (
    echo [ERRO] A instalacao falhou. Copie a mensagem acima e mande para o Claude.
    pause
    exit /b 1
  )
)

echo.
echo Conferindo os videos brutos...
if not exist "projetos\001. Reels Teste\video\video.mp4" (
  echo [aviso] Falta o video bruto do Reels Teste em:
  echo         projetos\001. Reels Teste\video\video.mp4
  echo         Sem ele, o JornadaGuru abre com tela preta.
)

echo.
echo Abrindo em http://localhost:3000  ^(feche esta janela para desligar o Studio^)
echo.
call npm run studio
pause
