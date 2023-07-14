import { Env } from "../env";
import { Weight } from "./Weight";
import * as Realm from "realm-web";

export class WeightRepository {
    app: Realm.App;
    credentials: Realm.Credentials;
    collection!: globalThis.Realm.Services.MongoDB.MongoDBCollection<Weight>;

    constructor(env: Env) {
        console.log(`${env.ATLAS_APP_ID}:${env.ATLAS_APP_KEY}`);
        this.app = new Realm.App({ id: env.ATLAS_APP_ID });
        this.credentials = Realm.Credentials.apiKey(env.ATLAS_APP_KEY);
    }

    async getLatest(clientId: string): Promise<Date> {
        const collection = await this.getCollection();
        const results = await collection.aggregate([
            {
                $sort: { timestamp: 1 }
            },
            {
                $group: {
                    _id: "$clientId",
                    timestamp: { $last: "$timestamp" }
                }
            }
        ]);

        return results[0]?.timestamp;
    }

    async insertMany(entries: Weight[]) {
        const collection = await this.getCollection();
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
