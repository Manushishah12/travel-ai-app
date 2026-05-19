/**
 * Lists Gemini models your API key can use.
 * Run from server folder: npm run gemini:models
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("Missing GEMINI_API_KEY in server/.env");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
const res = await fetch(url);
const data = await res.json();

if (!res.ok) {
  console.error("API error:", data?.error?.message || res.status);
  process.exit(1);
}

const models = (data.models || [])
  .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
  .map((m) => m.name.replace(/^models\//, ""))
  .sort();

console.log("\nModels that support generateContent for YOUR key:\n");
for (const name of models) {
  if (/gemini/i.test(name)) console.log(" ", name);
}
console.log("\nRecommended GEMINI_MODEL in server/.env:");
const pick =
  models.find((n) => /^gemini-2\.5-flash$/i.test(n)) ||
  models.find((n) => /^gemini-2\.0-flash$/i.test(n)) ||
  models.find((n) => /flash/i.test(n));
console.log(pick ? `  GEMINI_MODEL=${pick}` : "  (no flash model found — check API key)");
console.log("");
