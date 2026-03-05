import crypto from "crypto";

/**
 * Generates a secure, random alphanumeric string.
 * @param {number} length - The length of the short ID.
 * @returns {string}
 */
export function generateShortId(length = 6) {
  const charset =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }

  return result;
}
