import http.server
import socketserver
import webbrowser
import os

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

print("=" * 55)
print("  LIGHTMARK PRO - TRÌNH GHÉP LOGO HÀNG LOẠT (LIGHTROOM)")
print("=" * 55)
print(f"Server đang chạy tại: http://localhost:{PORT}")
print("Nhấn Ctrl + C để dừng server.")
print("=" * 55)

webbrowser.open(f"http://localhost:{PORT}")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã tắt server.")

