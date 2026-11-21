import dns from "node:dns";
import mongoose from "mongoose";
import { DB_URI_ONLINE } from "../../config/config.service.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export default async function connectionDB() {
  try {
    await mongoose.connect(DB_URI_ONLINE, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB connected...........");
  } catch (error) {
    console.log("Failed to connect to DB:", error.message);
    process.exit(1);
  }
}




