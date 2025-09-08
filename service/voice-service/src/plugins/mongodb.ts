import fp from 'fastify-plugin';
import { MongoClient, Db } from 'mongodb';
import { container } from 'tsyringe';
import { DbClient } from '../client/dbClient';

declare module 'fastify' {
    interface FastifyInstance {
        mongodb: {
            client: MongoClient;
            db: Db;
        };
    }
}

let mongoClient: MongoClient | undefined;

const getMongoClient = async (): Promise<MongoClient> => {
    if (!mongoClient) {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const dbName = process.env.MONGODB_DB_NAME || 'voice-service';

        mongoClient = new MongoClient(uri);
        await mongoClient.connect();
    }
    return mongoClient;
};

export default fp(async function (fastify) {
    const client = await getMongoClient();
    const dbName = process.env.MONGODB_DB_NAME || 'voice-service';
    const db = client.db(dbName);

    const dbClient = new DbClient(db);
    container.register(DbClient, { useValue: dbClient });

    fastify.decorate('mongodb', {
        client,
        db
    });

    fastify.addHook('onClose', async () => {
        await client.close();
    });
});
