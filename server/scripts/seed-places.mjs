import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "travelai";

async function main() {
  if (!MONGO_URL) {
    console.error("MONGO_URL missing in server/.env");
    process.exit(1);
  }

  const csvPath = path.join(__dirname, "..", "data", "places.csv");
  const raw = fs.readFileSync(csvPath, "utf8");
  const records = parse(raw, { columns: true, skip_empty_lines: true, trim: true });

  const places = records.map((row) => ({
    ...row,
    rating: parseFloat(row.rating),
    tags: String(row.tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  }));

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);
  const existing = await db.collection("places").countDocuments();
  if (existing > 0) {
    console.log(`Found ${existing} places. Skipping seed (delete collection to re-seed).`);
    await client.close();
    return;
  }

  await db.collection("places").insertMany(places);
  await db.collection("places").createIndex({ city: 1 });
  await db.collection("places").createIndex({ category: 1 });
  await db.collection("places").createIndex({ rating: -1 });
  console.log(`Seeded ${places.length} places into ${DB_NAME}.places`);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
