const http = require('http');
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const h = url.startsWith('https') ? https : http;
    const req = h.get(url, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    });
    req.on('error', reject);
  });
}

(async () => {
  const base = process.env.SMOKE_BASE || 'http://localhost:3000';
  try {
    // Providers
    const p = await fetchUrl(`${base}/api/providers`);
    if (p.status !== 200) throw new Error('providers status');
    const providers = JSON.parse(p.body.toString('utf-8'));
    if (!providers.providers || !Array.isArray(providers.providers)) throw new Error('providers shape');
    console.log('Providers OK', providers.providers.map((x) => x.id));

    // QR
    const q = await fetchUrl(`${base}/api/qr?text=test@example.com`);
    if (q.status !== 200) throw new Error('qr status');
    if (!q.body || q.body.length < 100) throw new Error('qr too small');
    console.log('QR OK', q.body.length);

    console.log('Smoke test passed');
    process.exit(0);
  } catch (e) {
    console.error('Smoke test failed', e.message);
    process.exit(1);
  }
})();
