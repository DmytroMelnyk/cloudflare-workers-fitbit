import { Env } from "../env";
import { Weight } from "./Weight";
import * as Realm from "realm-web";

export class WeightRepository {
    app: Realm.App;
    credentials: Realm.Credentials;
    collection!: globalThis.Realm.Services.MongoDB.MongoDBCollection<Weight>;

    constructor(env: Env) {
        this.app = new Realm.App({ id: env.ATLAS_APP_ID });
        this.credentials = Realm.Credentials.apiKey(env.ATLAS_APP_KEY);
    }

    async getLatest(clientId: string): Promise<[logId: number, timestamp: Date | undefined]> {
        const collection = await this.getCollection();
        const results = await collection.aggregate([
            {
                $sort: { timestamp: 1 }
            },
            {
                $group: {
                    _id: "$clientId",
                    timestamp: { $last: "$timestamp" },
                    entryId: { $last: "$_id" }
                }
            }
        ]);

        return [Number(results[0]?.entryId), results[0].timestamp];
    }

    async insertMany(entries: Weight[]) {
        if (!entries.length) {
            return;
        }

        const collection = await this.getCollection();
        //collection.findOneAndReplace({ _id: entries[0]._id }, entries[0], { upsert: true });
        return await collection.insertMany(entries);
    }

    async getWeight(clientId: string, daysBefore: number) {
        const collection = await this.getCollection();
        console.log(new Date().subtract(daysBefore));
        return collection.find({
            clientId: clientId,
            timestamp: {
                "$gte": new Date().subtract(daysBefore)
            }
        });
    }

    private async getCollection() {
        if (this.collection) {
            return this.collection;
        }

        const user = await this.app.logIn(this.credentials);
        return (this.collection = user
            .mongoClient('mongodb-atlas')
            .db('test-db')
            .collection<Weight>('test-collection'));
    }
}
