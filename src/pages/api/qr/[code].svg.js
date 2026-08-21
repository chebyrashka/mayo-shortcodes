import { getLinkByCode, shortUrlFor } from '../../../lib/links.js';
import { brandedQrSvg, qrSize, qrSvg } from '../../../lib/qr.js';

export async function GET({ params, request, url }) {
  const link = await getLinkByCode(params.code);

  if (!link) {
    return new Response('QR code not found.', { status: 404 });
  }

  const size = qrSize(url.searchParams.get('size'));
  const variant = url.searchParams.get('variant') === 'branded' ? 'branded' : 'plain';
  const shortUrl = shortUrlFor(link, request);
  const svg =
    variant === 'branded'
      ? await brandedQrSvg(shortUrl, size, link.title)
      : await qrSvg(shortUrl, size, `${link.title} QR code`);

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'content-disposition': `inline; filename="${link.code}-${variant}-${size}.svg"`,
      'cache-control': 'no-store'
    }
  });
}
