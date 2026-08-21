import { getLinkByCode, shortUrlFor } from '../../../lib/links.js';
import { brandedQrPng, qrPng, qrSize } from '../../../lib/qr.js';

export async function GET({ params, request, url }) {
  const link = await getLinkByCode(params.code);

  if (!link) {
    return new Response('QR code not found.', { status: 404 });
  }

  const size = qrSize(url.searchParams.get('size'));
  const variant = url.searchParams.get('variant') === 'branded' ? 'branded' : 'plain';
  const shortUrl = shortUrlFor(link, request);
  const buffer = variant === 'branded' ? await brandedQrPng(shortUrl, size, link.title) : await qrPng(shortUrl, size);

  return new Response(buffer, {
    headers: {
      'content-type': 'image/png',
      'content-disposition': `inline; filename="${link.code}-${variant}-${size}.png"`,
      'cache-control': 'no-store'
    }
  });
}
