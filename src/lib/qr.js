import QRCode from 'qrcode';
import sharp from 'sharp';
import { MAYO_LOGO_PATH } from './mayoLogo.js';

const sizes = {
  small: 256,
  medium: 512,
  large: 1024
};

const colors = {
  blue: '#0055b8',
  deepBlue: '#002f6c',
  midBlue: '#3178c6',
  paleBlue: '#f7fbff',
  lineBlue: '#cfe1f7',
  ink: '#17233c',
  muted: '#536273',
  white: '#ffffff'
};

const qrOptions = {
  errorCorrectionLevel: 'H',
  margin: 4,
  color: {
    dark: colors.blue,
    light: colors.white
  }
};

export function qrSize(value) {
  return sizes[value] ? value : 'medium';
}

export function qrWidth(value) {
  return sizes[qrSize(value)];
}

export async function qrPng(targetUrl, size) {
  return QRCode.toBuffer(targetUrl, {
    ...qrOptions,
    type: 'png',
    width: qrWidth(size)
  });
}

export async function qrSvg(targetUrl, size, title = 'Branded QR code') {
  const svg = await QRCode.toString(targetUrl, {
    ...qrOptions,
    type: 'svg',
    width: qrWidth(size)
  });

  return svg
    .replace('<svg ', '<svg role="img" ')
    .replace(/<svg([^>]*)>/, `<svg$1><title>${escapeXml(title)}</title>`);
}

export async function brandedQrSvg(targetUrl, size, title = 'Branded QR code') {
  const width = qrWidth(size);
  const titleHeight = Math.round(width * 0.18);
  const footerHeight = Math.round(width * 0.1);
  const padding = Math.round(width * 0.08);
  const qrArea = width - padding * 2;
  const qr = QRCode.create(targetUrl, {
    errorCorrectionLevel: qrOptions.errorCorrectionLevel
  });
  const moduleCount = qr.modules.size;
  const quietZone = 4;
  const totalModules = moduleCount + quietZone * 2;
  const moduleSize = qrArea / totalModules;
  const moduleGap = Math.max(moduleSize * 0.12, 0.55);
  const dotSize = moduleSize - moduleGap;
  const qrTop = titleHeight + Math.round(width * 0.02);
  const qrLeft = padding;
  const imageHeight = titleHeight + qrArea + footerHeight;
  const titleText = fitText(title, 44);
  const shortText = fitText(targetUrl.replace(/^https?:\/\//, ''), 58);

  const modules = [];

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (!qr.modules.data[row * moduleCount + col]) {
        continue;
      }

      modules.push(
        `<rect x="${round(qrLeft + (col + quietZone) * moduleSize + moduleGap / 2)}" y="${round(
          qrTop + (row + quietZone) * moduleSize + moduleGap / 2
        )}" width="${round(dotSize)}" height="${round(dotSize)}" rx="${round(moduleSize * 0.24)}" />`
      );
    }
  }

  return `<svg role="img" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${imageHeight}" viewBox="0 0 ${width} ${imageHeight}">
  <title>${escapeXml(title)} branded QR code</title>
  <rect width="${width}" height="${imageHeight}" rx="${Math.round(width * 0.045)}" fill="${colors.white}" />
  <rect x="0.5" y="0.5" width="${width - 1}" height="${imageHeight - 1}" rx="${Math.round(
    width * 0.045
  )}" fill="none" stroke="${colors.lineBlue}" />
  <rect x="${padding}" y="${Math.round(width * 0.045)}" width="${width - padding * 2}" height="${Math.round(
    width * 0.01
  )}" rx="${Math.round(width * 0.005)}" fill="${colors.blue}" />
  <text x="${padding}" y="${Math.round(width * 0.11)}" fill="${colors.deepBlue}" font-family="mayo-sans, Arial, sans-serif" font-size="${Math.round(
    width * 0.048
  )}" font-weight="800">${escapeXml(titleText)}</text>
  <g fill="${colors.blue}">${modules.join('')}</g>
  ${mayoLogoMark(width / 2, qrTop + qrArea / 2, Math.round(qrArea * 0.21))}
  <text x="${width / 2}" y="${imageHeight - Math.round(width * 0.04)}" text-anchor="middle" fill="${
    colors.muted
  }" font-family="mayo-sans, Arial, sans-serif" font-size="${Math.round(width * 0.028)}" font-weight="700">${escapeXml(
    shortText
  )}</text>
</svg>`;
}

export async function brandedQrPng(targetUrl, size, title) {
  const svg = await brandedQrSvg(targetUrl, size, title);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function mayoLogoMark(centerX, centerY, size) {
  const backingSize = size * 1.28;
  const scale = size / 56;

  return `<g aria-hidden="true">
    <rect x="${round(centerX - backingSize / 2)}" y="${round(centerY - backingSize / 2)}" width="${round(
      backingSize
    )}" height="${round(backingSize)}" rx="${round(backingSize * 0.2)}" fill="${colors.white}" stroke="${colors.lineBlue}" stroke-width="${round(
      size * 0.035
    )}" />
    <g transform="translate(${round(centerX - size / 2)} ${round(centerY - size / 2)}) scale(${round(scale)})">
      <path d="${MAYO_LOGO_PATH}" fill-rule="evenodd" fill="${colors.deepBlue}" />
    </g>
  </g>`;
}

function fitText(value, maxLength) {
  const text = String(value || '').trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}

function round(value) {
  return Number(value).toFixed(2).replace(/\.?0+$/, '');
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
