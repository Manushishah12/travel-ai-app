import { config } from "../config.js";

/** Prefer full flash models; *-lite tiers hit 503 "high demand" more often. */
const PREFERRED_PATTERNS = [
  /^gemini-2\.5-flash$/i,
  /^gemini-2\.0-flash$/i,
  /^gemini-2\.5-flash-preview/i,
  /^gemini-2\.0-flash-/i,
  /^gemini-flash(?!-lite)/i,
  /^gemini-2\.5-pro/i,
  /^gemini-2\.0-pro/i,
  /^gemini-2\.0-flash-lite/i,
  /^gemini-2\.5-flash-lite/i,
];

const STATIC_FALLBACKS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
];

let cachedModels = null;

function stripModelsPrefix(name) {
  return String(name || "").replace(/^models\//, "");
}

/**
 * Fetch models your API key can actually use (avoids 404 on retired names).
 */
export async function discoverGeminiModels() {
  if (cachedModels) return cachedModels;

  const key = config.geminiApiKey;
  if (!key) return [...STATIC_FALLBACKS];

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.warn("ListModels failed:", data?.error?.message || res.status);
      cachedModels = [...STATIC_FALLBACKS];
      return cachedModels;
    }

    const available = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => stripModelsPrefix(m.name))
      .filter(Boolean);

    const ranked = [];
    const isLite = (id) => /-lite$/i.test(id);

    for (const pattern of PREFERRED_PATTERNS) {
      for (const id of available) {
        if (pattern.test(id) && !isLite(id) && !ranked.includes(id)) ranked.push(id);
      }
    }
    for (const id of available) {
      if (!ranked.includes(id) && /gemini/i.test(id) && !isLite(id)) ranked.push(id);
    }
    for (const id of available) {
      if (isLite(id) && !ranked.includes(id)) ranked.push(id);
    }

    cachedModels = ranked.length ? ranked : [...STATIC_FALLBACKS];
    console.log("Gemini models for this API key:", cachedModels.slice(0, 6).join(", "));
    return cachedModels;
  } catch (e) {
    console.warn("discoverGeminiModels:", e.message);
    cachedModels = [...STATIC_FALLBACKS];
    return cachedModels;
  }
}

export async function getModelCandidates() {
  const fromEnv = stripModelsPrefix(config.geminiModel?.trim());
  const discovered = await discoverGeminiModels();
  const list = [];

  if (fromEnv) list.push(fromEnv);
  for (const m of discovered) list.push(m);
  for (const m of STATIC_FALLBACKS) list.push(m);

  return [...new Set(list)];
}
