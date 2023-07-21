export interface Activity extends globalThis.Realm.Services.MongoDB.Document {
    _id: string;
    clientId: string;
    timestamp: Date;
    value: number;
    type: ActivityType;
}

export enum ActivityType {
    TEMP_SKIN_NIGHTLY_RELATIVE = "nightly-relative",
    ACTIVE_ZONE_MINUTES = "active-zone-minutes",
    BREATHING_RATE = "breathing-rate",
    DAILY_CALORIES = "daily-calories",
    RESTING_HEART_RATE = "resting-heart-rate",
    HEART_RATE_VARIABILITY = "daily-rmssd",
    DAILY_STEPS = "steps"
}