#!/usr/bin/env python3
"""
Lightweight GitHub webhook listener for TetrisOS auto-deploy.
Listens on port 9876, verifies signature, triggers deploy.sh on push to main.
"""

import hashlib
import hmac
import json
import subprocess
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler

WEBHOOK_SECRET = "2c5cc766dfd544a0a588c2e9201ef9e6cb7a9bc1"
DEPLOY_SCRIPT = "/home/jake/TetrisOS/deploy/deploy.sh"
PORT = 9876

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        # Verify signature
        signature = self.headers.get("X-Hub-Signature-256", "")
        expected = "sha256=" + hmac.new(
            WEBHOOK_SECRET.encode(), body, hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected):
            self.send_response(403)
            self.end_headers()
            self.wfile.write(b"Invalid signature")
            print(f"[REJECTED] Invalid signature from {self.client_address[0]}")
            return

        # Parse payload
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Bad JSON")
            return

        event = self.headers.get("X-GitHub-Event", "")
        ref = payload.get("ref", "")

        # Only deploy on push to main
        if event == "push" and ref == "refs/heads/main":
            print(f"[DEPLOY] Push to main by {payload.get('pusher', {}).get('name', 'unknown')}")
            # Run deploy in background
            subprocess.Popen(
                ["bash", DEPLOY_SCRIPT],
                stdout=open("/home/jake/TetrisOS/deploy/deploy.log", "a"),
                stderr=subprocess.STDOUT,
            )
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Deploy triggered")
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(f"Ignored: {event} {ref}".encode())

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    print(f"Webhook listener running on port {PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down")
        server.server_close()
