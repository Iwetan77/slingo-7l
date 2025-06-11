export function generateShortId(length = 5): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")
}
