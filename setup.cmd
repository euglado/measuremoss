@echo off
setlocal
pushd "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missing
call npm ci --ignore-scripts
if errorlevel 1 goto failed
call npm run build
if errorlevel 1 goto failed
call npm run setup
if errorlevel 1 goto failed
echo Install the bot using the link above, then press any key. / Botu yukaridaki baglanti ile ekleyin, sonra tusa basin.
pause >nul
call npm run register
if errorlevel 1 goto failed
echo Ready. Run start.cmd / Hazir. start.cmd dosyasini calistirin.
popd
pause
exit /b 0
:missing
echo Install Node.js 24 LTS first / Once Node.js 24 LTS kurun.
:failed
echo Setup stopped. Read the error above. / Kurulum durdu. Yukaridaki hatayi okuyun.
popd
pause
exit /b 1
