/**
 * Utilities for embedding image hashes inside letter body text.
 *
 * Format appended to the end of the body:
 *   \n\n[LETTER_IMAGE:sha256:<64-hex-chars>]
 */

const IMAGE_MARKER_PATTERN = /\[LETTER_IMAGE:(sha256:[a-f0-9]{64})\]/i;

/**
 * Encodes a letter body by optionally appending an image hash marker.
 *
 * @param text      The user-facing letter text.
 * @param imageHash The SHA-256 hash from StorageClient, or null if no image.
 * @returns         The encoded body string to persist to the backend.
 */
export function encodeLetterBody(
  text: string,
  imageHash: string | null,
): string {
  if (!imageHash) {
    return text;
  }
  return `${text}\n\n[LETTER_IMAGE:${imageHash}]`;
}

/**
 * Decodes a stored letter body, extracting the clean text and image hash.
 *
 * @param body  The raw body string retrieved from the backend.
 * @returns     An object with `text` (clean body without the marker) and
 *              `imageHash` (the extracted hash, or null if not present).
 */
export function decodeLetterBody(body: string): {
  text: string;
  imageHash: string | null;
} {
  const match = body.match(IMAGE_MARKER_PATTERN);
  if (!match) {
    return { text: body, imageHash: null };
  }

  const imageHash = match[1];
  // Remove the marker (and the preceding \n\n) from the text
  const text = body
    .replace(/\n\n\[LETTER_IMAGE:sha256:[a-f0-9]{64}\]/i, "")
    .trimEnd();
  return { text, imageHash };
}
