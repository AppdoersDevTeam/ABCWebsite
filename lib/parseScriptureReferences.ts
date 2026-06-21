/** Bible book names and abbreviations used in the Statement of Faith source text. */
const BOOK_PATTERN =
  /^(?:(?:[1-3I]{1,3})\s+)?(?:[A-Za-z][A-Za-z.]*(?:\s+[A-Za-z][A-Za-z.]*)?)/;

function normalizeBook(book: string): string {
  return book.replace(/\.$/, '').trim();
}

function looksLikeBookPrefix(segment: string): boolean {
  const match = segment.match(BOOK_PATTERN);
  if (!match) return false;
  const candidate = normalizeBook(match[0]);
  // Continuations like "119:105" or "17:19" must not be treated as books.
  if (/^\d/.test(candidate)) return false;
  return /[A-Za-z]/.test(candidate);
}

function splitEmbeddedReference(segment: string): string[] {
  // Handles rare cases like "Titus 3:5, Ephesians 1:13-14" within one semicolon segment.
  const parts = segment.split(/,\s+(?=(?:[1-3I]{1,3}\s+)?[A-Za-z])/);
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * Parses a semicolon-delimited scripture string into individual references,
 * carrying the current book name forward for abbreviated continuations.
 */
export function parseScriptureReferences(text: string): string[] {
  const segments = text
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  const results: string[] = [];
  let currentBook = '';

  for (let segment of segments) {
    segment = segment.replace(/\.$/, '');

    for (const piece of splitEmbeddedReference(segment)) {
      if (looksLikeBookPrefix(piece)) {
        const bookMatch = piece.match(BOOK_PATTERN);
        const book = normalizeBook(bookMatch![0]);
        const remainder = piece.slice(bookMatch![0].length).trim();
        currentBook = book;
        results.push(remainder ? `${book} ${remainder}` : book);
      } else if (currentBook) {
        results.push(`${currentBook} ${piece}`);
      } else {
        results.push(piece);
      }
    }
  }

  return results;
}
