import axios from "axios";
import { config } from "../config.js";

/**
 * @param {object[]} places
 * @param {{ preferred_categories?: string[], query_text?: string }} user_signals
 * @param {number} limit
 */
export async function fetchPersonalizedRecommendations(places, user_signals, limit) {
  try {
    const { data } = await axios.post(
      `${config.mlServiceUrl}/recommend`,
      { places, user_signals, limit },
      { timeout: 15000, headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (e) {
    console.warn("ML service unavailable:", e.message);
    return null;
  }
}
