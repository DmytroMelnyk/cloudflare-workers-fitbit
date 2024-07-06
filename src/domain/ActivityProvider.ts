import { FitbitApiClient } from "../fitbit/FitbitApiClient";
import { ActivityType, Activity } from "./Activity";

type Predicate<T> = (item: T) => number;

export class ActivityProvider {
    constructor(private fitbitApiClient: FitbitApiClient, private clientId: string) {
    }

    async getActivity(activityType: ActivityType, from: Date, to: Date) {
        switch (activityType) {
            case ActivityType.ACTIVE_ZONE_MINUTES:
                return (await this.fitbitApiClient.getActiveZones(from, to))
                    .map(x => this.mapActivity(x, activityType, x => x.value.activeZoneMinutes));
            case ActivityType.BREATHING_RATE:
                return (await this.fitbitApiClient.getBreathingRate(from, to))
                    .map(x => this.mapActivity(x, activityType, x => x.value.breathingRate));
            case ActivityType.DAILY_CALORIES:
                return (await this.fitbitApiClient.getCalories(from, to))
                    .map(x => this.mapActivity(x, activityType, x => parseInt(x.value)));
            case ActivityType.DAILY_STEPS:
                return (await this.fitbitApiClient.getSteps(from, to))
                    .map(x => this.mapActivity(x, activityType, x => parseInt(x.value)));
            case ActivityType.HEART_RATE_VARIABILITY:
                return (await this.fitbitApiClient.getHrv(from, to))
                    .map(x => this.mapActivity(x, activityType, x => x.value.dailyRmssd));
            case ActivityType.RESTING_HEART_RATE:
                return (await this.fitbitApiClient.getHeart(from, to))
                    .map(x => this.mapActivity(x, activityType, x => x.value.restingHeartRate));
            case ActivityType.TEMP_SKIN_NIGHTLY_RELATIVE:
                return (await this.fitbitApiClient.getTempSkin(from, to))
                    .map(x => this.mapActivity(x, activityType, x => x.value.nightlyRelative));
            default:
                throw new Error(`Unknown activity type: ${activityType}`);
        }
    }

    async getActivityAt(activityType: ActivityType, to: Date, daysBefore: number) {
        switch (activityType) {
            case ActivityType.ACTIVE_ZONE_MINUTES:
                return (await this.fitbitApiClient.getActiveZonesAt(to, daysBefore))
                    .map(x => this.mapActivity(x, activityType, x => x.value.activeZoneMinutes));
            case ActivityType.BREATHING_RATE:
                return (await this.fitbitApiClient.getBreathingRateAt(to, daysBefore))
                    .map(x => this.mapActivity(x, activityType, x => x.value.breathingRate));
            case ActivityType.DAILY_CALORIES:
                return (await this.fitbitApiClient.getCaloriesAt(to, daysBefore))
                    .map(x => this.mapActivity(x, activityType, x => parseInt(x.value)));
            case ActivityType.DAILY_STEPS:
                return (await this.fitbitApiClient.getStepsAt(to, daysBefore))
                    .map(x => this.mapActivity(x, activityType, x => parseInt(x.value)));
            case ActivityType.HEART_RATE_VARIABILITY:
                return (await this.fitbitApiClient.getHrvAt(to, daysBefore))
                    .map(x => this.mapActivity(x, activityType, x => x.value.dailyRmssd));
            case ActivityType.RESTING_HEART_RATE:
                return (await this.fitbitApiClient.getHeartAt(to, daysBefore))
                    .map(x => this.mapActivity(x, activityType, x => x.value.restingHeartRate));
            case ActivityType.TEMP_SKIN_NIGHTLY_RELATIVE:
                return (await this.fitbitApiClient.getTempSkinAt(to, daysBefore))
                    .map(x => this.mapActivity(x, activityType, x => x.value.nightlyRelative));
            default:
                throw new Error(`Unknown activity type: ${activityType}`);
        }
    }

    mapActivity<T extends ActivityDto>(dto: T, activityType: ActivityType, valueSelector: Predicate<T>) {
        return <Activity>{
            _id: {
                logId: dto.dateTime,
                clientId: this.clientId,
                type: activityType,
            },
            timestamp: new Date(Date.parse(dto.dateTime)),
            value: valueSelector(dto)
        };
    }
}