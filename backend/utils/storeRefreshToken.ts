import { redis } from "../lib/redis.js";

export async function storeRefreshToken ( userId: string, refreshToken: string ) {
  await redis.set(`refresh_token: ${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60)
}