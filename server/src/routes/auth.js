import { Router } from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db.js";
import { authRequired, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ detail: "name, email, and password are required" });
    }

    const db = getDb();
    const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ detail: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection("users").insertOne({
      name,
      email: email.toLowerCase(),
      password: hashed,
    });

    const token = signToken({
      user_id: result.insertedId.toString(),
      email: email.toLowerCase(),
      name,
    });

    return res.status(201).json({
      message: "Account created successfully!",
      token,
      name,
      email: email.toLowerCase(),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ detail: "email and password are required" });
    }

    const db = getDb();
    const user = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ detail: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ detail: "Invalid email or password" });
    }

    const token = signToken({
      user_id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return res.json({
      message: "Login successful!",
      token,
      name: user.name,
      email: user.email,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: "Login failed" });
  }
});

router.get("/me", authRequired, (req, res) => {
  return res.json({
    message: `Hello ${req.user.name}!`,
    user: req.user,
  });
});

export default router;
