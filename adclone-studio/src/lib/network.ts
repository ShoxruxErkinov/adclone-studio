import https from 'node:https';
import dns from 'node:dns/promises';
import { isIP } from 'node:net';

export function publicIPv4(ip: string) {
  if (isIP(ip) !== 4) return false;
  const [a,b] = ip.split('.').map(Number);
  return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0) || a === 100 && b >= 64 && b <= 127 || a === 198 && (b === 18 || b === 19));
}
export function validateRemoteUrl(input: string): URL {
  let url: URL; try { url = new URL(input); } catch { throw new Error('To‘liq HTTPS mahsulot havolasini kiriting.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port && url.port !== '443' || isIP(url.hostname) || !url.hostname.includes('.') || /(^|\.)(localhost|local|internal|test|invalid)$/.test(url.hostname)) throw new Error('Faqat ochiq internetdagi HTTPS havolalar qabul qilinadi.');
  return url;
}
// Resolve once and pin the connection to the checked IPv4 address. Redirects are rechecked.
export async function safeFetch(input: string, maxBytes = 4_000_000, redirects = 0): Promise<{ body: Buffer; type: string; url: string }> {
  const url = validateRemoteUrl(input);
  const addresses = await dns.lookup(url.hostname, { family: 4, all: true });
  if (!addresses.length || addresses.some(a => !publicIPv4(a.address))) throw new Error('Bu manzilga ulanishga ruxsat yo‘q.');
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'AdCloneStudio/0.1 (product metadata importer)', Accept: 'text/html,image/*;q=0.9,*/*;q=0.5', 'Accept-Encoding': 'identity' },
      lookup: (_host, _opts, cb) => cb(null, addresses[0].address, 4),
      timeout: 15000,
    }, res => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirects >= 4) { reject(new Error('Havola juda ko‘p yo‘naltirildi.')); return; }
        safeFetch(new URL(res.headers.location, url).href, maxBytes, redirects + 1).then(resolve, reject); return;
      }
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) { res.resume(); reject(new Error(`Do‘kon javobi: HTTP ${res.statusCode}. Mahsulotni qo‘lda kiriting yoki Firecrawl’ni ulang.`)); return; }
      let size = 0; const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => { size += chunk.length; if (size > maxBytes) { req.destroy(new Error('Fayl hajmi ruxsat etilgan chegaradan katta.')); return; } chunks.push(chunk); });
      res.on('end', () => resolve({ body: Buffer.concat(chunks), type: String(res.headers['content-type'] || ''), url: url.href }));
      res.on('error', reject);
    });
    req.on('timeout', () => req.destroy(new Error('Do‘kon vaqtida javob bermadi. Qayta urinib ko‘ring yoki mahsulotni qo‘lda kiriting.')));
    req.on('error', reject);
  });
}
export function detectImage(bytes: Buffer): 'jpg' | 'png' | 'webp' {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP') return 'webp';
  throw new Error('PNG, JPG yoki WebP rasm yuklang.');
}
