@echo off
setlocal

REM =====================================================
REM Edit these two values before running this script
REM =====================================================
set "E2E_EMAIL=kh0206@gmail.com"
set "E2E_PASSWORD=Gloryday62!"

REM Optional: set to 1 to force browser install each run
set "INSTALL_BROWSERS=0"

REM Optional: set to 1 to generate/update screenshot baselines before running tests
set "UPDATE_SNAPSHOTS=0"

pushd "%~dp0.." || (
  echo Failed to switch to project root.
  pause
  exit /b 1
)

if "%E2E_EMAIL%"=="your-email@example.com" (
  echo Please edit E2E_EMAIL in run\run-e2e.cmd first.
  popd
  pause
  exit /b 1
)

if "%E2E_PASSWORD%"=="your-password" (
  echo Please edit E2E_PASSWORD in run\run-e2e.cmd first.
  popd
  pause
  exit /b 1
)

set "E2E_EMAIL=%E2E_EMAIL%"
set "E2E_PASSWORD=%E2E_PASSWORD%"

echo Running E2E tests from: %CD%

if "%INSTALL_BROWSERS%"=="1" (
  echo Installing Playwright Chromium...
  call npx playwright install chromium
  if errorlevel 1 (
    echo Browser install failed.
    popd
    pause
    exit /b 1
  )
)

if "%UPDATE_SNAPSHOTS%"=="1" (
  echo Updating Playwright screenshot baselines...
  call npm run test:e2e:update-snapshots
  if errorlevel 1 (
    echo Snapshot update failed.
    popd
    pause
    exit /b 1
  )
)

echo Starting Playwright tests...
call npm run test:e2e
set "RC=%ERRORLEVEL%"

echo.
if "%RC%"=="0" (
  echo E2E tests completed.
) else (
  echo E2E tests failed with exit code %RC%.
)

popd
pause
exit /b %RC%
