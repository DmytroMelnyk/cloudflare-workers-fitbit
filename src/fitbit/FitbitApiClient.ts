export class FitbitApiClient {
    constructor(private access_token: string) {
    }

    // https://dev.fitbit.com/build/reference/web-api/body-timeseries/get-weight-timeseries-by-date-range/
    async getWeight(from: Date, to: Date): Promise<WeightEntryDto[]> {
        const response = await this.get(`/1/user/-/body/log/weight/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<WeightDto>()).weight;
    }

    getWeightAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<WeightEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getWeight(from, to);
    }

    async getSleep(from: Date, to: Date): Promise<SleepEntryDto[]> {
        const response = await this.get(`/1.2/user/-/sleep/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<SleepDto>()).sleep;
    }

    getSleepAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<SleepEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getSleep(from, to);
    }

    async getHrv(from: Date, to: Date): Promise<HrvEntryDto[]> {
        const response = await this.get(`/1/user/-/hrv/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<HrvDto>()).hrv;
    }

    getHrvAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<HrvEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getHrv(from, to);
    }

    async getTempSkin(from: Date, to: Date): Promise<TempSkinEntryDto[]> {
        const response = await this.get(`/1/user/-/hrv/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<TempSkinDto>()).tempSkin;
    }

    getTempSkinAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<TempSkinEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getTempSkin(from, to);
    }

    async getCalories(from: Date, to: Date): Promise<CaloriesEntryDto[]> {
        const response = await this.get(`/1/user/-/activities/calories/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<CaloriesDto>()).activities_calories;
    }

    getCaloriesAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<CaloriesEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getCalories(from, to);
    }

    async getActiveZones(from: Date, to: Date): Promise<ActiveZoneEntryDto[]> {
        const response = await this.get(`/1/user/-/activities/active-zone-minutes/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<ActiveZoneDto>()).activities_active_zone_minutes;
    }

    getActiveZonesAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<ActiveZoneEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getActiveZones(from, to);
    }

    async getSteps(from: Date, to: Date): Promise<StepsEntryDto[]> {
        const response = await this.get(`/1/user/-/activities/steps/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<StepsDto>()).activities_steps;
    }

    getStepsAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<StepsEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getSteps(from, to);
    }

    async getHeart(from: Date, to: Date): Promise<HeartEntryDto[]> {
        const response = await this.get(`/1/user/-/activities/heart/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<HeartDto>()).activities_heart;
    }

    getHeartAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<HeartEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getHeart(from, to);
    }

    async getBreathingRate(from: Date, to: Date): Promise<BreathingRateEntryDto[]> {
        const response = await this.get(`/1/user/-/br/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<BreathingRateDto>()).br;
    }

    getBreathingRateAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<BreathingRateEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getBreathingRate(from, to);
    }

    private async get(url: string): Promise<Response> {
        const result = await fetch(`https://api.fitbit.com${url}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.access_token}`
            }
        });

        return result;
    }
}
