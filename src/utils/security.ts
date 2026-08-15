/**
 * Sanitizes raw text string to avoid XSS vulnerabilities and control character injection.
 */
export function sanitizeString(str: string | undefined | null): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[\u200B-\u200D\uFEFF\u202E\u202D]/g, '') // Strip zero-width & RTL override control characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validates if a string is a safe HTTP or HTTPS URL (rejects javascript:, data:, file:, etc.).
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Returns a safe URL string or fallback if invalid or dangerous scheme detected.
 */
export function getSafeUrl(url: string | undefined | null, fallback = '#'): string {
  if (isValidUrl(url)) {
    return url!.trim();
  }
  return fallback;
}

