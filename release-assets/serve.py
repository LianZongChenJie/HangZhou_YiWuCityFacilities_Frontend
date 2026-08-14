#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""配套费征收审批系统 · 本地静态服务（无需安装 Node）"""
import os
import sys
import time
import socket
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(ROOT, "web")
HOST = "127.0.0.1"
PORT = 8080


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB, **kwargs)

    def log_message(self, fmt, *args):
        sys.stdout.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))
        sys.stdout.flush()

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def port_free(port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.bind((HOST, port))
        return True
    except OSError:
        return False
    finally:
        s.close()


def main():
    if not os.path.isdir(WEB):
        print("未找到 web 目录，请勿拆散压缩包内文件。")
        input("按回车退出...")
        sys.exit(1)

    port = PORT
    if not port_free(port):
        port = 8088
        if not port_free(port):
            print("8080 / 8088 端口都被占用，请关闭占用程序后重试。")
            input("按回车退出...")
            sys.exit(1)

    httpd = ThreadingHTTPServer((HOST, port), Handler)
    url = "http://%s:%s/" % (HOST, port)
    print("=" * 48)
    print("  义乌市城市基础设施配套费征收审批系统")
    print("  请勿关闭本窗口，关闭即停止系统。")
    print("  访问地址：%s" % url)
    print("=" * 48)

    def open_browser():
        time.sleep(0.6)
        webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
        httpd.shutdown()


if __name__ == "__main__":
    main()
