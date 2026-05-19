import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db.js";
import { authRequired } from "../middleware/auth.js";
import {
  extractTripPlan,
  generateChatReply,
  generateWelcomeReply,
} from "../services/chat.service.js";

const router = Router();

async function startSession(userId, userName) {
  const db = getDb();
  const now = new Date();
  const doc = {
    user_id: userId,
    user_name: userName,
    title: "New trip",
    messages: [],
    trip_plan: null,
    created_at: now,
    updated_at: now,
  };
  const r = await db.collection("chat_sessions").insertOne(doc);
  return r.insertedId.toString();
}

router.post("/chat/session", authRequired, async (req, res) => {
  try {
    const sessionId = await startSession(req.user.user_id, req.user.name);
    return res.json({ session_id: sessionId, message: "New session started!" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: "Could not start session" });
  }
});

/** AI sends the first onboarding question (no user message required). */
router.post("/chat/welcome", authRequired, async (req, res) => {
  try {
    let { session_id: sessionId } = req.body || {};
    const db = getDb();
    const userId = req.user.user_id;

    if (!sessionId) {
      sessionId = await startSession(userId, req.user.name);
    }

    let oid;
    try {
      oid = new ObjectId(sessionId);
    } catch {
      return res.status(400).json({ detail: "Invalid session_id" });
    }

    const session = await db.collection("chat_sessions").findOne({
      _id: oid,
      user_id: userId,
    });
    if (!session) {
      return res.status(404).json({ detail: "Session not found" });
    }

    if ((session.messages || []).length > 0) {
      return res.json({
        session_id: sessionId,
        messages: session.messages,
        trip_plan: session.trip_plan || null,
        has_plan: session.trip_plan != null,
      });
    }

    const aiReply = await generateWelcomeReply();
    const history = [
      {
        role: "model",
        content: aiReply,
        timestamp: new Date().toISOString(),
      },
    ];

    await db.collection("chat_sessions").updateOne(
      { _id: oid },
      { $set: { messages: history, updated_at: new Date() } }
    );

    return res.json({
      session_id: sessionId,
      reply: aiReply,
      messages: history,
      trip_plan: null,
      has_plan: false,
    });
  } catch (e) {
    console.error("chat/welcome:", e);
    return res.status(500).json({ detail: e.message || "Could not start chat" });
  }
});

router.post("/chat", authRequired, async (req, res) => {
  try {
    let { session_id: sessionId, message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ detail: "message is required" });
    }

    const db = getDb();
    const userId = req.user.user_id;

    if (!sessionId) {
      sessionId = await startSession(userId, req.user.name);
    }

    let oid;
    try {
      oid = new ObjectId(sessionId);
    } catch {
      return res.status(400).json({ detail: "Invalid session_id" });
    }

    let session = await db.collection("chat_sessions").findOne({
      _id: oid,
      user_id: userId,
    });
    if (!session) {
      return res.status(404).json({ detail: "Session not found" });
    }

    let history = session.messages || [];
    history.push({
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    });

    const aiReply = await generateChatReply(
      history.map((m) => ({ role: m.role, content: m.content }))
    );

    history.push({
      role: "model",
      content: aiReply,
      timestamp: new Date().toISOString(),
    });

    let tripPlan = session.trip_plan || null;
    if (aiReply.includes("```json")) {
      const parsed = extractTripPlan(aiReply);
      if (parsed) tripPlan = parsed;
    }

    let title = session.title || "New trip";
    if (tripPlan?.destination) {
      const dur = tripPlan.duration ? ` · ${tripPlan.duration}` : "";
      title = `${tripPlan.destination}${dur}`;
    } else if (title === "New trip" && history.length <= 2) {
      title = message.length > 40 ? `${message.slice(0, 40)}...` : message;
    }

    await db.collection("chat_sessions").updateOne(
      { _id: oid },
      {
        $set: {
          messages: history,
          title,
          updated_at: new Date(),
          trip_plan: tripPlan,
        },
      }
    );

    return res.json({
      reply: aiReply,
      session_id: sessionId,
      trip_plan: tripPlan,
      has_plan: tripPlan != null,
      title,
    });
  } catch (e) {
    console.error(e);
    const msg = e.message || "Chat failed";
    return res.status(500).json({ detail: msg });
  }
});

router.get("/chat/sessions", authRequired, async (req, res) => {
  try {
    const db = getDb();
    const sessions = await db
      .collection("chat_sessions")
      .find({ user_id: req.user.user_id })
      .sort({ updated_at: -1 })
      .limit(50)
      .toArray();

    const list = sessions.map((s) => ({
      session_id: s._id.toString(),
      title: s.title || "New trip",
      created_at: s.created_at ? s.created_at.toISOString() : "",
      has_plan: s.trip_plan != null,
      message_count: (s.messages || []).length,
    }));

    return res.json({ sessions: list });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: "Could not list sessions" });
  }
});

router.get("/chat/sessions/:sessionId", authRequired, async (req, res) => {
  try {
    let oid;
    try {
      oid = new ObjectId(req.params.sessionId);
    } catch {
      return res.status(400).json({ detail: "Invalid session_id" });
    }

    const db = getDb();
    const session = await db.collection("chat_sessions").findOne({
      _id: oid,
      user_id: req.user.user_id,
    });
    if (!session) {
      return res.status(404).json({ detail: "Session not found" });
    }

    return res.json({
      session_id: session._id.toString(),
      title: session.title || "New trip",
      messages: session.messages || [],
      trip_plan: session.trip_plan || null,
      has_plan: session.trip_plan != null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: "Could not load session" });
  }
});

export default router;
