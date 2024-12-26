export default function sanitizeFileName(input: string): string {
  // Define a regex for invalid characters
  const invalidCharacters = /[^\w!#$&'()*+,.\/:;=?@[\]_~-]+/g;

  // Replace invalid characters with a safe character (e.g., "-")
  let sanitized = input.replace(invalidCharacters, "-");

  // Ensure the key length does not exceed 1024 characters
  if (sanitized.length > 1024) {
    sanitized = sanitized.substring(0, 1024);
  }

  // Ensure the key is non-empty
  if (sanitized.trim().length === 0) {
    throw new Error(
      "Invalid S3 object key: must not be empty after sanitization."
    );
  }

  return sanitized;
}
