@echo off
setlocal
pushd "%~dp0"
call npm start
set "result=%errorlevel%"
popd
pause
exit /b %result%
