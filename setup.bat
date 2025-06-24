@echo off
REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [Console @ Monkey-Bot] Node.js no esta instalado. Ejecutando instalador...
    start /wait node-installer.msi
) else (
    echo [Console @ Monkey-Bot] Node.js ya esta instalado.
)

REM Verificar si Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [Console @ Monkey-Bot] Git no esta instalado. Ejecutando instalador...
    start /wait git-installer.exe
) else (
    echo [Console @ Monkey-Bot] Git ya esta instalado.
)

REM Verificar si ImageMagick está instalado
where convert >nul 2>nul
if %errorlevel% neq 0 (
    echo [Console @ Monkey-Bot] ImageMagick no esta instalado. Ejecutando instalador...
    start /wait imagemagick-installer.exe
) else (
    echo [Console @ Monkey-Bot] ImageMagick ya esta instalado.
)

REM Ejecutar Git pull
echo [Console @ Monkey-Bot] Verificando Actualizaciones...
git pull

REM Ejecutar npm install (ignorar crasheo)
echo [Console @ Moneky-Bot] Instalando Dependencias...
npm install
if %errorlevel% neq 0 (
    echo [Console @ Monkey-Bot] Se detectó un problema después de npm install, pero se ignorará para continuar.
)

REM Ejecutar node index.js
echo Ejecutando node index.js...
node index.js

pause