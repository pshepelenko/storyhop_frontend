import http from 'node:http';

const BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:3000';
const FRONTEND = process.env.FRONTEND_URL || 'http://127.0.0.1:3001';

function probe(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
    });
    req.on('error', (error) => {
      resolve({ ok: false, error: error.message });
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ ok: false, error: 'timeout' });
    });
  });
}

async function probeWithRetry(url, attempts = 4, delayMs = 2000) {
  let last = null;
  for (let i = 0; i < attempts; i += 1) {
    last = await probe(url);
    if (last.ok) return last;
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return last;
}

const backend = await probeWithRetry(`${BACKEND}/health`);
const frontend = await probeWithRetry(FRONTEND);

let failed = false;

if (!backend.ok) {
  failed = true;
  console.error(`Backend not ready at ${BACKEND}/health`, backend.error ?? `HTTP ${backend.status}`);
} else {
  console.log(`Backend OK (${BACKEND})`);
}

if (!frontend.ok) {
  failed = true;
  console.error(`Frontend not ready at ${FRONTEND}`, frontend.error ?? `HTTP ${frontend.status}`);
  if (frontend.status === 500) {
    console.error('Hint: run `npm run dev:clean` in frontend/ to reset a stuck Next dev server.');
  }
} else {
  console.log(`Frontend OK (${FRONTEND})`);
}

process.exit(failed ? 1 : 0);
