import { Router } from "express";
import jwt from "jsonwebtoken";
import { getDb } from "../db.js";
import { config } from "../config.js";
import { fetchPersonalizedRecommendations } from "../services/mlClient.js";

const router = Router();

router.post("/places", async (req, res) => {
  try {
    const place = req.body || {};
    const required = ["name", "city", "category", "rating", "description", "tags"];
    for (const k of required) {
      if (place[k] === undefined || place[k] === null) {
        return res.status(400).json({ detail: `Missing field: ${k}` });
      }
    }
    const db = getDb();
    await db.collection("places").insertOne({
      ...place,
      price_range: place.price_range || "mid",
    });
    return res.json({ message: "Place added!" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: "Could not add place" });
  }
});

router.get("/places", async (req, res) => {
  try {
    const { city, category } = req.query;
    const query = {};
    if (city) query.city = { $regex: city, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };

    const db = getDb();
    const places = await db
      .collection("places")
      .find(query)
      .sort({ rating: -1 })
      .limit(100)
      .toArray();

    for (const p of places) {
      p._id = p._id.toString();
    }

    return res.json({ places, count: places.length });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: "Could not load places" });
  }
});

/**
 * Personalized ranking via Python ML service (TF-IDF + signals).
 * Optional auth: if Bearer token present, loads user activity from Mongo for signals.
 */
router.post("/recommend", async (req, res) => {
  try {
    const { city, category, limit = 15, user_signals: bodySignals } = req.body || {};
    const db = getDb();
    const query = {};
    if (city) query.city = { $regex: city, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };

    let places = await db
      .collection("places")
      .find(query)
      .sort({ rating: -1 })
      .limit(200)
      .toArray();

    places = places.map((p) => ({
      ...p,
      _id: p._id.toString(),
      tags: Array.isArray(p.tags) ? p.tags : String(p.tags || "").split(",").map((t) => t.trim()),
    }));

    if (places.length === 0) {
      return res.json({ recommendations: [], count: 0, source: "none" });
    }

    let user_signals = bodySignals || { preferred_categories: [], query_text: "" };

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const payload = jwt.verify(authHeader.slice(7), config.jwtSecret);
        const uid = payload.user_id;
        const sessions = await db
          .collection("chat_sessions")
          .find({ user_id: uid })
          .project({ messages: 1 })
          .limit(20)
          .toArray();

        const texts = [];
        const cats = new Set(user_signals.preferred_categories || []);
        for (const s of sessions) {
          for (const m of s.messages || []) {
            if (m.role === "user" && m.content) texts.push(m.content);
          }
        }
        user_signals = {
          preferred_categories: [...cats],
          query_text: [user_signals.query_text, ...texts].filter(Boolean).join(" ").slice(0, 2000),
        };
      } catch {
        /* invalid token — ignore and use body-only signals */
      }
    }

    const ml = await fetchPersonalizedRecommendations(places, user_signals, Number(limit) || 15);
    if (ml) {
      return res.json({
        recommendations: ml.recommendations,
        count: ml.recommendations.length,
        source: "ml-service",
      });
    }

    const fallback = places.slice(0, Number(limit) || 15);
    return res.json({
      recommendations: fallback.map((p) => ({ place: p, score: p.rating / 5 })),
      count: fallback.length,
      source: "rating-fallback",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: "Recommendation failed" });
  }
});

export default router;
