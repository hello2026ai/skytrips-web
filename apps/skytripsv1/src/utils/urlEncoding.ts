/**
 * URL-safe encoding/decoding utilities
 */

/**
 * Encodes data to URL-safe base64
 * @param data - The data to encode (will be JSON stringified)
 * @returns URL-safe base64 encoded string
 */
export function encodeData(data: unknown): string {
  try {
    const jsonString = JSON.stringify(data);
    // First convert to base64 using Buffer
    const base64 = Buffer.from(jsonString).toString('base64');
    // Make URL safe by replacing problematic characters
    // Make the base64 string URL-safe
    return encodeURIComponent(base64);
  } catch (error) {
    console.error('Error encoding data:', error);
    return '';
  }
}

/**
 * Decodes URL-safe base64 data
 */
export function decodeData(encoded: string): any {
  try {
    // Decode the URL-safe string back to base64
    const base64 = decodeURIComponent(encoded);

    // Decode base64 to string
    const jsonString = Buffer.from(base64, 'base64').toString();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decoding data:', error);
    return null;
  }
}
