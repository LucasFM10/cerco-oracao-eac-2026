import Redis from 'ioredis';

const redisGlobal = global as typeof global & {
  redis: Redis | undefined;
};

export const redis =
  redisGlobal.redis ??
  new Redis(process.env.REDIS_URL || '', {
    maxRetriesPerRequest: null,
  });

if (process.env.NODE_ENV !== 'production') {
  redisGlobal.redis = redis;
}

export default redis;
