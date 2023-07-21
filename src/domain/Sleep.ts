export interface Sleep extends globalThis.Realm.Services.MongoDB.Document {
    _id: string;
    clientId: string;
    timestamp: Date;
    // More data
}