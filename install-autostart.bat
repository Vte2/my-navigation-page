@echo off
copy /Y "%~dp0start-nav-server.vbs" "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\start-nav-server.vbs" >nul
echo Installed to Startup folder. Nav server will start automatically on login.
echo To uninstall: press Win+R, type shell:startup, delete start-nav-server.vbs
pause
