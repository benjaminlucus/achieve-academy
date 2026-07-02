// Basic XSS sanitization function
export function sanitizeXSS(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .replace(/javascript:/gi, "&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;:")
    .replace(/on\w+=/gi, "&#111;&#110;");
}

// Sanitize an object's string fields recursively
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeXSS(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item: any) =>
        typeof item === "string" ? sanitizeXSS(item) :
        typeof item === "object" && item !== null ? sanitizeObject(item) : item
      );
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}
