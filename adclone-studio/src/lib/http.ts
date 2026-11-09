export function guardLocal(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get('host')?.split(':')[0];
  if (!host || !['localhost','127.0.0.1'].includes(host)) throw new Error('Bu versiya faqat mahalliy foydalanish uchun.');
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin && origin !== `http://${request.headers.get('host')}`) throw new Error('Begona saytdan so‘rovga ruxsat yo‘q.');
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new Error('Begona saytdan so‘rovga ruxsat yo‘q.');
}
export async function limitedBody(request: Request, limit = 1000000) {
  if (Number(request.headers.get('content-length') || 0) > limit) throw new Error('So‘rov hajmi juda katta.');
  const reader = request.body?.getReader(); if (!reader) throw new Error('So‘rov bo‘sh.');
  const chunks: Uint8Array[] = []; let size=0;
  while (true) { const {done,value}=await reader.read(); if(done) break; size+=value.length; if(size>limit){await reader.cancel();throw new Error('So‘rov hajmi juda katta.');} chunks.push(value); }
  return Buffer.concat(chunks);
}
