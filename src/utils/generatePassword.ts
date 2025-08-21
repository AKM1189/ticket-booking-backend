import crypto from "crypto";

export function generatePassword(length = 12) {
  return crypto
    .randomBytes(length)
    .toString("base64") // convert to readable chars
    .slice(0, length) // trim to desired length
    .replace(/\+/g, "A") // avoid special chars that can cause issues
    .replace(/\//g, "B");
}
