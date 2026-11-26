@echo off
cd /d "%~dp0"
powershell -NoExit -Command "$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User'); npm.cmd start"
