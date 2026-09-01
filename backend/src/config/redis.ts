import "dotenv/config";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

export const redisConnection = redisUrl
  ? new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    })
  : new IORedis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null,
    });

redisConnection.on("ready", () => {
  console.log("Redis connection ready");
});

redisConnection.on("error", (error) => {
  console.error(
    "Redis connection error:",
    error.message
  );
});