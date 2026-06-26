@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0.."

set "LOCKFILE=.next\dev\lock"

if exist "%LOCKFILE%" (
  echo Found existing dev server lock, reading PID...
  set "PID="
  for /f "tokens=2 delims=:," %%p in ('findstr /r "\"pid\":" "%LOCKFILE%"') do (
    set "PID=%%p"
  )
  if defined PID (
    echo Stopping previous dev server ^(PID !PID!^)...
    taskkill /PID !PID! /F >nul 2>&1
  )
)

echo Stopping anything listening on ports 3000-3005...
for %%P in (3000 3001 3002 3003 3004 3005) do (
  for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%P ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
  )
)

echo Clearing build cache (.next) to avoid stale-cache / crashed-worker issues...
if exist ".next" rmdir /s /q ".next" >nul 2>&1

echo Starting dev server...
npm run dev

endlocal

pause
