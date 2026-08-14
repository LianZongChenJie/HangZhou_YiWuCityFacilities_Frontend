#!/bin/bash
cd "$(dirname "$0")"
echo "正在启动配套费征收审批系统..."
if command -v python3 >/dev/null 2>&1; then
  python3 serve.py
elif command -v python >/dev/null 2>&1; then
  python serve.py
else
  echo "未检测到 Python。请安装 Python 3 后再双击本文件。"
  echo "或在终端执行：python3 serve.py"
  read -r _
fi
