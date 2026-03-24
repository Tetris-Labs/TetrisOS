import http from 'node:http';

type CallbackResult =
  | { success: true; code: string }
  | { success: false; error: string };

type CallbackServer = {
  port: number;
  callbackUrl: string;
  waitForCallback: () => Promise<CallbackResult>;
  close: () => void;
};

const TWENTY_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 96 96">
<rect width="96" height="96" rx="11.3" fill="#8A2BE2"/>
<!-- Tetris T piece -->
<rect x="24" y="24" width="48" height="16" fill="#E6E6FA"/>
<rect x="40" y="40" width="16" height="32" fill="#E6E6FA"/>
</svg>`;

const pageHtml = ({
  title,
  message,
  isSuccess,
}: {
  title: string;
  message: string;
  isSuccess: boolean;
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} — TetrisOS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100dvh;
      color: #333;
    }
    .card {
      background: #fff;
      border-radius: 8px;
      box-shadow: 2px 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
      padding: 32px;
      width: 400px;
      max-width: calc(100vw - 32px);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .logo { margin-bottom: 4px; }
    .icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-success { background: #f0faf0; }
    .icon-error { background: #fef0f0; }
    .icon svg { width: 24px; height: 24px; }
    h2 {
      font-size: 1.23rem;
      font-weight: 600;
      color: #333;
    }
    p {
      font-size: 0.92rem;
      color: #666;
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">${TWENTY_LOGO_SVG}</div>
    <div class="icon ${isSuccess ? 'icon-success' : 'icon-error'}">
      ${
        isSuccess
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      }
    </div>
    <h2>${title}</h2>
    <p>${message}</p>
  </div>
</body>
</html>`;

const SUCCESS_HTML = pageHtml({
  title: 'Authentication successful',
  message: 'You can close this window and return to the terminal.',
  isSuccess: true,
});

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const errorHtml = (error: string) =>
  pageHtml({
    title: 'Authentication failed',
    message: `${escapeHtml(error)}<br>Please return to the terminal and try again.`,
    isSuccess: false,
  });

export const startCallbackServer = (options?: {
  timeoutMs?: number;
}): Promise<CallbackServer> => {
  const timeoutMs = options?.timeoutMs ?? 120_000;

  return new Promise((resolve, reject) => {
    let callbackResolve: (result: CallbackResult) => void;
    let timeoutHandle: ReturnType<typeof setTimeout>;

    const callbackPromise = new Promise<CallbackResult>((res) => {
      callbackResolve = res;
    });

    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://127.0.0.1`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');

        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      const headers = {
        'Content-Type': 'text/html',
        Connection: 'close',
      };

      if (code) {
        res.writeHead(200, headers);
        res.end(SUCCESS_HTML);
        callbackResolve({ success: true, code });
      } else {
        const errorMessage =
          error ?? url.searchParams.get('error_description') ?? 'Unknown error';

        res.writeHead(200, headers);
        res.end(errorHtml(errorMessage));
        callbackResolve({ success: false, error: errorMessage });
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        reject(new Error('Failed to start callback server'));

        return;
      }

      const port = address.port;

      resolve({
        port,
        callbackUrl: `http://127.0.0.1:${port}/callback`,
        waitForCallback: () => {
          timeoutHandle = setTimeout(() => {
            callbackResolve({
              success: false,
              error: `Timed out waiting for authorization (${timeoutMs / 1000}s)`,
            });
          }, timeoutMs);

          return callbackPromise.finally(() => {
            clearTimeout(timeoutHandle);
          });
        },
        close: () => {
          clearTimeout(timeoutHandle);
          server.closeAllConnections();
          server.close();
        },
      });
    });

    server.on('error', reject);
  });
};
