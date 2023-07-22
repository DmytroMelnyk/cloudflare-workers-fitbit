import { Env } from "../env";
import { Activity, ActivityKey, ActivityType } from "./Activity";
import * as Realm from "realm-web";

export class ActivityRepository {
    app: Realm.App;
    credentials: Realm.Credentials;
    collection!: globalThis.Realm.Services.MongoDB.MongoDBCollection<Activity>;

    constructor(env: Env) {
        this.app = new Realm.App({ id: env.ATLAS_APP_ID });
        this.credentials = Realm.Credentials.apiKey(env.ATLAS_APP_KEY);
    }

    async getLatest(activityType: ActivityType, clientId: string): Promise<[key: ActivityKey, timestamp: Date] | undefined> {
        const collection = await this.getCollection();
        const results = await collection.aggregate([
            {
                $match: {
                    $and: [
                        { '_id.type': activityType },
                        { '_id.clientId': clientId }
                    ]
                }
            },
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

        if (results[0]) {
            return [results[0].entryId, results[0].timestamp];
        }

        return undefined;
    }

    async insertMany(entries: Activity[]) {
        if (!entries.length) {
            return;
        }

        const collection = await this.getCollection();
        return await collection.insertMany(entries);
    }

    async upsert(entry: Activity) {
        const collection = await this.getCollection();
        return await collection.findOneAndReplace({
            _id: entry._id,
        }, entry, { upsert: true });
    }

    async get(activityType: ActivityType, clientId: string, from: Date) {
        const collection = await this.getCollection();
        return collection.find({
            $and: [
                { "_id.clientId": clientId },
                { "_id.type": activityType }
            ],
            timestamp: {
                "$gte": from
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
            .collection<Activity>('activity-collection'));
    }
}
