/**
 * Utility functions for generating URLs with descriptive slugs
 */

/**
 * Generate a URL for an author profile
 * Prefers slug if available, falls back to ID
 */
export function getAuthorUrl(author: { id: string; slug?: string | null }) {
  return author.slug ? `/author/${author.slug}` : `/profile/${author.id}`;
}

/**
 * Generate a URL for a book/QR code
 * Prefers book slug if available, falls back to QR code ID
 */
export function getBookUrl(qrCode: { id: string; book_slug?: string | null }) {
  return qrCode.book_slug ? `/book/${qrCode.book_slug}` : `/qr/${qrCode.id}`;
}

/**
 * Generate a URL for an author's QR code (author dashboard view)
 * Prefers book slug if available, falls back to QR code ID
 */
export function getAuthorBookUrl(qrCode: { id: string; book_slug?: string | null }) {
  return qrCode.book_slug ? `/author/qr/${qrCode.book_slug}` : `/author/qr/${qrCode.id}`;
}

/**
 * Generate a URL for an author's profile (author dashboard view)
 * Prefers slug if available, falls back to ID
 */
export function getAuthorProfileUrl(author: { id: string; slug?: string | null }) {
  return author.slug ? `/author/profile/${author.slug}` : `/author/profile/${author.id}`;
}

/**
 * Generate a canonical URL for SEO purposes
 * Always uses the most descriptive URL available
 */
export function getCanonicalUrl(type: 'author' | 'book', data: any) {
  switch (type) {
    case 'author':
      return data.slug 
        ? `https://quilltips.co/author/${data.slug}`
        : `https://quilltips.co/profile/${data.id}`;
    case 'book':
      return data.book_slug 
        ? `https://quilltips.co/book/${data.book_slug}`
        : `https://quilltips.co/qr/${data.id}`;
    default:
      return '';
  }
} 