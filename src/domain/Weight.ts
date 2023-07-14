
export interface Weight extends globalThis.Realm.Services.MongoDB.Document {
    _id: string;
    clientId: string;
    timestamp: Date;
    fat: number;
    weight: number;
}

