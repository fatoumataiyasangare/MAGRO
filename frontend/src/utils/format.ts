export function getInitials(name: string | undefined): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 3); // Max 3 characters (e.g. "Amadou Batie Sidibe" -> "ABS")
}
