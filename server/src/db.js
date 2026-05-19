import { MongoClient } from "mongodb";
import { config } from "./config.js";

/** @type {MongoClient | null} */
let client = null;

export async function connectDb() {
  if (!config.mongoUrl) {
    throw new Error("MONGO_URL is not set in .env");
  }
  client = new MongoClient(config.mongoUrl);
  await client.connect();
  await client.db(config.dbName).command({ ping: 1 });
  console.log(`Connected to MongoDB — database: ${config.dbName}`);
}

export async function disconnectDb() {
  if (client) {
    await client.close();
    client = null;
    console.log("Disconnected from MongoDB");
  }
}

export function getDb() {
  if (!client) {
    throw new Error("Database not connected");
  }
  return client.db(config.dbName);
}
