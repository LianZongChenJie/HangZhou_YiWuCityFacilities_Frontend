#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import shutil
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
ASSETS = os.path.join(ROOT, "release-assets")
STAGE = os.path.join(ROOT, "release-staging", "义乌配套费征收审批系统-桌面版")
ZIP_PATH = os.path.join(ROOT, "义乌配套费征收审批系统-桌面版.zip")


def main():
    if not os.path.isdir(DIST):
        raise SystemExit("请先执行 npm run build")
    shutil.rmtree(os.path.dirname(STAGE), ignore_errors=True)
    os.makedirs(os.path.join(STAGE, "web"), exist_ok=True)
    shutil.copytree(DIST, os.path.join(STAGE, "web"), dirs_exist_ok=True)
    for name in ("serve.py", "启动.command", "启动.bat", "使用说明.txt"):
        shutil.copy2(os.path.join(ASSETS, name), os.path.join(STAGE, name))
    os.chmod(os.path.join(STAGE, "启动.command"), 0o755)
    os.chmod(os.path.join(STAGE, "serve.py"), 0o755)
    if os.path.exists(ZIP_PATH):
        os.remove(ZIP_PATH)
    with zipfile.ZipFile(ZIP_PATH, "w", zipfile.ZIP_DEFLATED) as zf:
        for dirpath, _, filenames in os.walk(STAGE):
            for fn in filenames:
                if fn.startswith("._") or fn == ".DS_Store":
                    continue
                full = os.path.join(dirpath, fn)
                rel = os.path.relpath(full, os.path.dirname(STAGE))
                zf.write(full, rel)
    print("已生成：", ZIP_PATH)


if __name__ == "__main__":
    main()
