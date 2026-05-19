/** Stable image URL from place name + category (no API key). */
export function placeImageUrl(name, city = "", category = "travel") {
  const q = encodeURIComponent(`${name} ${city} ${category} india travel`);
  return `https://source.unsplash.com/640x400/?${q}`;
}

export function formatSessionDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function mockReviewCount(rating = 4.5) {
  return Math.round((rating || 4) * 180 + 42);
}

export function starsDisplay(rating) {
  const r = Math.min(5, Math.max(0, Number(rating) || 0));
  const full = Math.floor(r);
  const half = r - full >= 0.5;
  return { full, half, empty: 5 - full - (half ? 1 : 0) };
}

/** Strip ```json blocks from chat display */
export function chatDisplayText(content) {
  if (!content) return "";
  const idx = content.indexOf("```json");
  if (idx === -1) return content;
  const before = content.slice(0, idx).trim();
  const afterEnd = content.indexOf("```", idx + 7);
  const after =
    afterEnd === -1 ? "" : content.slice(afterEnd + 3).trim();
  return [before, after].filter(Boolean).join("\n\n");
}
