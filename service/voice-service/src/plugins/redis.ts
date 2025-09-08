import fp from 'fastify-plugin';
import IORedis from 'ioredis';

declare module 'fastify' {
    interface FastifyInstance {
        redis: IORedis;
    }
}

let redisInstance: IORedis | undefined;

const getRedis = (): IORedis => {
    if (!redisInstance) {
        redisInstance = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    return redisInstance;
};

export default fp(async function (fastify) {
    const redis = getRedis();

    fastify.decorate('redis', redis);

    fastify.addHook('onClose', async () => {
        await redis.quit();
    });
});
