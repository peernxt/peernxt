import { Redis } from '@upstash/redis';
import { env } from './env.js';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    if (!env.redis.url || !env.redis.token) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
    }
    _redis = new Redis({ url: env.redis.url, token: env.redis.token });
  }
  return _redis;
}
