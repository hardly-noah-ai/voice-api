import { injectable } from 'tsyringe';
import { Db, Collection, ObjectId, Document } from 'mongodb';

export type BaseDocument = {
    _id: ObjectId;
    createdAt: Date;
    updatedAt: Date;
};

@injectable()
export class DbClient {
    constructor(private db: Db) { }

    async create<T extends BaseDocument>(collectionName: string, document: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        const collection = this.db.collection<T>(collectionName);
        const docWithTimestamps = {
            ...document,
            createdAt: new Date(),
            updatedAt: new Date()
        } as Omit<T, '_id'>;
        const result = await collection.insertOne(docWithTimestamps as any);
        return { ...docWithTimestamps, _id: result.insertedId } as unknown as T;
    }

    async findById<T extends BaseDocument>(collectionName: string, id: string): Promise<T | undefined> {
        const collection = this.db.collection<T>(collectionName);
        return await collection.findOne({ _id: new ObjectId(id) } as any) as T | undefined;
    }

    async findOne<T extends BaseDocument>(collectionName: string, filter: Partial<T>): Promise<T | undefined> {
        const collection = this.db.collection<T>(collectionName);
        return await collection.findOne(filter as any) as T | undefined;
    }

    async findMany<T extends BaseDocument>(collectionName: string, filter: Partial<T> = {}): Promise<T[]> {
        const collection = this.db.collection<T>(collectionName);
        return await collection.find(filter as any).toArray() as T[];
    }

    async updateById<T extends BaseDocument>(collectionName: string, id: string, update: Partial<Omit<T, '_id' | 'createdAt'>>): Promise<T | undefined> {
        const collection = this.db.collection<T>(collectionName);
        const updateWithTimestamp = {
            ...update,
            updatedAt: new Date()
        };
        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) } as any,
            { $set: updateWithTimestamp as any },
            { returnDocument: 'after' }
        );
        return (result as T);
    }

    async deleteById(collectionName: string, id: string): Promise<boolean> {
        const collection = this.db.collection(collectionName);
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }

    getCollection<T extends BaseDocument>(collectionName: string): Collection<T> {
        return this.db.collection<T>(collectionName);
    }

    async count<T extends BaseDocument>(collectionName: string, filter: Partial<T> = {}): Promise<number> {
        const collection = this.db.collection<T>(collectionName);
        return await collection.countDocuments(filter as any);
    }

    async exists<T extends BaseDocument>(collectionName: string, filter: Partial<T>): Promise<boolean> {
        const collection = this.db.collection<T>(collectionName);
        const count = await collection.countDocuments(filter as any, { limit: 1 });
        return count > 0;
    }
}
