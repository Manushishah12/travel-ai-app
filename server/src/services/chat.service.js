import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config.js";
import { getModelCandidates } from "./geminiModels.js";

function isRetryableGeminiError(err) {
  const msg = String(err?.message || err);
  return (
    msg.includes("404") ||
    msg.includes("not found") ||
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("quota") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tryModels(contents, label = "chat") {
  const candidates = await getModelCandidates();
  const errors = [];

  for (const modelName of candidates) {
    const attempts = modelName.includes("-lite") ? 1 : 2;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const text = await generateWithModel(modelName, contents);
        console.log(`Gemini OK (${label}): ${modelName}`);
        return text;
      } catch (e) {
        const short = String(e.message || e).split("\n")[0].slice(0, 200);
        errors.push(`${modelName}: ${short}`);
        console.warn(`Gemini ${label} failed on ${modelName}:`, short);

        if (!isRetryableGeminiError(e)) throw e;

        const is503 = short.includes("503") || short.includes("high demand");
        if (is503 && attempt < attempts) {
          await sleep(1500);
          continue;
        }
        break;
      }
    }
  }

  const hint = errors.some((e) => e.includes("503") || e.includes("high demand"))
    ? "Google servers are busy (503). Wait 1–2 minutes, set GEMINI_MODEL=gemini-2.0-flash in server/.env (avoid *-lite), and try again."
    : errors.some((e) => e.includes("429") || e.includes("quota"))
      ? "Your API key hit quota/rate limits. Wait a few minutes or create a new key at https://aistudio.google.com/apikey"
      : errors.some((e) => e.includes("API key"))
        ? "Invalid API key. Create a new key at https://aistudio.google.com/apikey"
        : "Run: npm run gemini:models to see which models your key supports.";

  throw new Error(
    `Gemini could not generate a reply. ${hint}\nTried: ${candidates.slice(0, 8).join(", ")}.\n` +
      `Errors:\n${errors.slice(0, 5).join("\n")}`
  );
}

export const SYSTEM_PROMPT = `
You are TravelAI, a professional travel planning assistant for India and worldwide destinations.

CONVERSATION FLOW (strict order — one question per message):
1. Greet briefly, then ask destination (city or region).
2. Ask how many days.
3. Ask main interests — offer: food, historical, adventure, nature, shopping, nightlife, wellness.
4. Ask daily budget (low / mid / luxury or ₹ ranges).
5. Ask travel group: solo, couple, family, or friends.
6. Ask special needs (diet, accessibility, kids) — they may say "none".

RULES:
- ONE question per reply. Never combine two questions.
- Keep replies short (2-4 sentences) unless generating the plan.
- After all 6 answers, say exactly: "Perfect! Let me create your personalised trip plan..."
- Then output ONLY the trip plan inside a \`\`\`json code block (valid JSON, no trailing commas).
- Include one object in "days" for each day of the trip. Each day needs: day, title, hotel, places[], food[], activities[], notes.
- After the JSON block, add 2-3 warm closing sentences telling them to open the Trip plan tab.

If the user sends follow-up messages after the plan exists, answer helpfully and offer to adjust the plan.

TRIP PLAN JSON SCHEMA (repeat day object for each day):
\`\`\`json
{
  "destination": "Rajasthan",
  "duration": "5 days",
  "travel_style": "couple, mid budget",
  "summary": "Short trip summary",
  "days": [
    {
      "day": 1,
      "title": "Arrive Jaipur · Pink City walk",
      "hotel": { "name": "...", "type": "...", "price_range": "mid", "rating": 4.6, "description": "...", "address": "...", "booking_tip": "..." },
      "places": [{ "name": "...", "category": "historical", "timing": "9:00 AM", "description": "...", "entry_fee": "...", "tips": "...", "rating": 4.5 }],
      "food": [{ "name": "...", "category": "...", "meal": "Dinner", "price_range": "mid", "must_try": "...", "address": "...", "rating": 4.5 }],
      "activities": [{ "name": "...", "timing": "6:00 PM", "description": "...", "tips": "...", "rating": 4.4 }],
      "notes": "..."
    }
  ],
  "total_estimated_budget": "₹...",
  "best_time_to_visit": "...",
  "packing_tips": ["..."]
}
\`\`\`
`.trim();

function getClient() {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not set in server/.env");
  }
  return new GoogleGenerativeAI(config.geminiApiKey);
}

function extractResponseText(response) {
  const text = response?.text?.();
  if (text && text.trim()) return text;

  const parts = response?.candidates?.[0]?.content?.parts;
  if (parts?.length) {
    const joined = parts.map((p) => p.text || "").join("").trim();
    if (joined) return joined;
  }

  const reason = response?.candidates?.[0]?.finishReason;
  if (reason === "SAFETY") {
    throw new Error("Response blocked by safety filters. Please rephrase your message.");
  }
  throw new Error("Gemini returned an empty response. Check API key quota or try again.");
}

/** Ensure user/model alternation for Gemini */
function toGeminiContents(messages) {
  const contents = [];
  for (const m of messages) {
    const role = m.role === "model" || m.role === "assistant" ? "model" : "user";
    const text = (m.content || "").trim();
    if (!text) continue;

    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${text}`;
    } else {
      contents.push({ role, parts: [{ text }] });
    }
  }

  if (contents.length && contents[0].role === "model") {
    contents.unshift({
      role: "user",
      parts: [{ text: "Hello, I want to plan a trip." }],
    });
  }
  return contents;
}

async function generateWithModel(modelName, contents) {
  const model = getClient().getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 8192,
    },
  });

  const result = await model.generateContent({ contents });
  return extractResponseText(result.response);
}

export async function generateChatReply(messages) {
  const contents = toGeminiContents(messages);
  if (contents.length === 0) {
    throw new Error("No messages to send");
  }
  return tryModels(contents, "chat");
}

export async function generateWelcomeReply() {
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: "I just opened TravelAI to plan a new trip. Greet me warmly in 2 sentences and ask ONLY which destination they want to visit.",
        },
      ],
    },
  ];
  return tryModels(contents, "welcome");
}

export function extractTripPlan(aiText) {
  const start = aiText.indexOf("```json");
  if (start === -1) return null;
  const jsonStart = start + 7;
  const end = aiText.indexOf("```", jsonStart);
  if (end === -1) return null;
  try {
    return JSON.parse(aiText.slice(jsonStart, end).trim());
  } catch {
    return null;
  }
}
