@echo off
echo ============================================
echo      DESPLEGANDO LINKOLOR A FIREBASE
echo ============================================
echo.

echo 1. Construyendo aplicacion para produccion...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] El build ha fallado. Revisa los errores arriba.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. Lanzando despliegue a Firebase Hosting...
call npx firebase deploy --only hosting

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] El despliegue ha fallado. Asegurate de tener sesion iniciada.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ============================================
echo    !DESPLIEGUE COMPLETADO CON EXITO!
echo ============================================
pause
