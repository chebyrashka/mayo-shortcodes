import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
const defaultStorePath = './data/links.json';

function storePath() {
  const configuredPath = process.env.LINK_STORE_PATH || defaultStorePath;
  return path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath);
}

async function ensureStore() {
  const filePath = storePath();
  await mkdir(path.dirname(filePath), { recursive: true });

  try {
    await readFile(filePath, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    await writeFile(filePath, '[]\n');
  }
}

async function readLinks() {
  await ensureStore();
  const raw = await readFile(storePath(), 'utf8');
  return JSON.parse(raw);
}

async function writeLinks(links) {
  await ensureStore();
  await writeFile(storePath(), `${JSON.stringify(links, null, 2)}\n`);
}

export async function listLinks() {
  const links = await readLinks();
  return links.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getLinkByCode(code) {
  const normalizedCode = normalizeSlug(code);
  const links = await readLinks();
  return links.find((link) => link.code === normalizedCode) || null;
}

export async function createLink(input) {
  const links = await readLinks();
  const code = input.customSlug
    ? normalizeSlug(input.customSlug)
    : generateCode(links);

  if (!code) {
    throw problem('Choose a custom slug with letters, numbers, or hyphens.', 400);
  }

  if (links.some((link) => link.code === code)) {
    throw problem('That short code is already in use.', 409);
  }

  const now = new Date().toISOString();
  const link = {
    id: randomUUID(),
    code,
    title: requiredText(input.title, 'Title'),
    destinationUrl: normalizeUrl(input.destinationUrl),
    expiresAt: normalizeDateTime(input.expiresAt),
    active: Boolean(input.active),
    owner: optionalText(input.owner),
    notes: optionalText(input.notes),
    createdAt: now,
    updatedAt: now
  };

  links.push(link);
  await writeLinks(links);
  return link;
}

export async function updateLink(id, input) {
  const links = await readLinks();
  const index = links.findIndex((link) => link.id === id);

  if (index === -1) {
    throw problem('Link not found.', 404);
  }

  const current = links[index];
  const updated = {
    ...current,
    title: requiredText(input.title, 'Title'),
    destinationUrl: normalizeUrl(input.destinationUrl),
    expiresAt: normalizeDateTime(input.expiresAt),
    active: Boolean(input.active),
    owner: optionalText(input.owner),
    notes: optionalText(input.notes),
    updatedAt: new Date().toISOString()
  };

  links[index] = updated;
  await writeLinks(links);
  return updated;
}

export function getBaseUrl(request) {
  const configuredBase = process.env.PUBLIC_BASE_URL;
  const base = configuredBase || new URL(request.url).origin;
  return base.replace(/\/+$/, '');
}

export function shortUrlFor(link, request) {
  return `${getBaseUrl(request)}/${link.code}`;
}

export function isExpired(link) {
  if (!link?.expiresAt) {
    return false;
  }

  return new Date(link.expiresAt).getTime() <= Date.now();
}

export function availabilityFor(link) {
  if (!link) {
    return {
      status: 'missing',
      label: 'Unavailable',
      reason: 'This branded short link could not be found.'
    };
  }

  if (!link.active) {
    return {
      status: 'inactive',
      label: 'Inactive',
      reason: 'This branded short link has been paused by its owner.'
    };
  }

  if (isExpired(link)) {
    return {
      status: 'expired',
      label: 'Expired',
      reason: 'This branded short link has reached its scheduled expiration.'
    };
  }

  return {
    status: 'active',
    label: 'Active',
    reason: 'This branded short link is available.'
  };
}

export function normalizeSlug(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

function generateCode(existingLinks) {
  const existingCodes = new Set(existingLinks.map((link) => link.code));

  for (let attempt = 0; attempt < 50; attempt += 1) {
    let code = '';

    for (let index = 0; index < 5; index += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    if (!existingCodes.has(code)) {
      return code;
    }
  }

  throw problem('Could not generate a unique code. Try a custom slug.', 500);
}

function requiredText(value, label) {
  const text = optionalText(value);

  if (!text) {
    throw problem(`${label} is required.`, 400);
  }

  return text;
}

function optionalText(value) {
  return String(value || '').trim();
}

function normalizeUrl(value) {
  const text = requiredText(value, 'Destination URL');
  let url;

  try {
    url = new URL(text);
  } catch {
    throw problem('Destination URL must be a valid absolute URL.', 400);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw problem('Destination URL must begin with http:// or https://.', 400);
  }

  return url.toString();
}

function normalizeDateTime(value) {
  const text = optionalText(value);

  if (!text) {
    return '';
  }

  const timestamp = new Date(text).getTime();

  if (Number.isNaN(timestamp)) {
    throw problem('Expiration date must be valid.', 400);
  }

  return text;
}

function problem(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}
