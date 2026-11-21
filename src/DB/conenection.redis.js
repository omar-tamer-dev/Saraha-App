import { createClient } from "redis"
import { RADIS_URL } from "../../config/config.service.js";

export const  redis_client = createClient({
   url: RADIS_URL
});

redis_client.on("error", (err) => console.log("Redis error:", err.code || err.message));

export default async function connectionRedis() {
  try {
    await redis_client.connect();
    console.log("redis connected...........");
  } catch (error) {
    console.log("Failed to connect to redis:", error.message);
  }
}