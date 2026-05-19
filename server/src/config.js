import dotenv from "dotenv";

dotenv.config();

const origins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const config = {
  port: Number(process.env.PORT) || 8000,
  mongoUrl: process.env.MONGO_URL,
  dbName: process.env.DB_NAME || "travelai",
  jwtSecret: process.env.JWT_SECRET || "changeme",
  jwtExpireDays: Number(process.env.JWT_EXPIRE_DAYS) || 7,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: (process.env.GEMINI_MODEL || "gemini-2.0-flash").trim(),
  mlServiceUrl: (process.env.ML_SERVICE_URL || "http://127.0.0.1:5050").replace(/\/$/, ""),
  frontendOrigins: origins,
};
