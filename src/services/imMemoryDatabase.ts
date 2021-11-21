const Redis = require("ioredis");
const redis = new Redis({
    port: process.env.REDIS_DB_PORT,
    host: process.env.REDIS_DB_HOST,
    password: process.env.REDIS_KEY
});

interface InMemoryStore {
    store(key: string, data:string);
    retrieve(key:string);
}

export function RedisInMemoryStore():InMemoryStore {
    return {
       async store(key: string, data: string){
            return await redis.set(key, data, "EX", 86400, "NX");
        },

        async retrieve(key: string){
           return await redis.get(key)
        }

    }
}

export const redisStore = RedisInMemoryStore();
