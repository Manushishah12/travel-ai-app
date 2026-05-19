import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { connectDb, disconnectDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import placesRoutes from "./routes/places.js";
import chatRoutes from "./routes/chat.js";

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(
  cors({
    origin: config.frontendOrigins,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ message: "Travel AI API is running", health: "/health" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(authRoutes);
app.use(placesRoutes);
app.use(chatRoutes);

async function main() {
  await connectDb();
  app.listen(config.port, () => {
    console.log(`Server listening on http://127.0.0.1:${config.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await disconnectDb();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await disconnectDb();
  process.exit(0);
});
