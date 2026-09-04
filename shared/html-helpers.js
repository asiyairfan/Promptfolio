const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function safeUrl(raw) {
  if (!raw) return '';
  const url = String(raw).trim();
  try {
    const parsed = new URL(url, 'https://example.com');
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) return '';
    if (parsed.protocol === 'mailto:' && !parsed.pathname.includes('@')) return '';
    return url;
  } catch {
    return '';
  }
}

export function safeImageUrl(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (/^data:image\/(jpeg|png);base64,/i.test(trimmed)) return trimmed;
  const url = safeUrl(trimmed);
  return /^https?:\/\//i.test(url) ? url : '';
}

export function joinLines(text) {
  return escapeHtml(text)
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join('');
}

export function avatarHtml(url, className = '', alt = '') {
  const safe = safeImageUrl(url);
  if (!safe) return '';
  return `<img${className ? ` class="${escapeHtml(className)}"` : ''} src="${escapeHtml(safe)}" alt="${escapeHtml(alt)}">`;
}

export function externalLinkAttributes(url) {
  return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener"' : '';
}

export function contactLink(contact) {
  const website = safeUrl(contact?.website);
  if (website) return website;
  return contact?.email ? `mailto:${contact.email}` : '';
}
