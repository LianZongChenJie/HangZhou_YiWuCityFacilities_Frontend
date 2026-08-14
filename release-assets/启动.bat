@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo 正在启动配套费征收审批系统...
where python >nul 2>&1 && python serve.py && goto :eof
where py >nul 2>&1 && py serve.py && goto :eof
where python3 >nul 2>&1 && python3 serve.py && goto :eof
echo 未检测到 Python。请先安装 Python 3（安装时勾选 Add python.exe to PATH），
echo 然后再双击「启动.bat」。
pause
