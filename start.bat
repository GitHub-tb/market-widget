@echo off
echo 正在启动 Market Widget 应用...
echo.

REM 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到npm，请先安装npm
    pause
    exit /b 1
)

REM 安装依赖
echo 正在安装依赖...
npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

REM 启动开发模式
echo 正在启动开发模式...
npm run dev

pause 