export class FitbitApiClient {
    constructor(private access_token: string) {
    }

    // https://dev.fitbit.com/build/reference/web-api/body-timeseries/get-weight-timeseries-by-date-range/
    async getWeight(from: Date, to: Date): Promise<WeightEntryDto[]> {
        const response = await this.get(`/user/-/body/log/weight/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
        return (await response.json<WeightDto>()).weight;
    }

    getWeightAt(to: Date, daysBefore: number = 30 /*max days for fitbit api*/): Promise<WeightEntryDto[]> {
        const from = to.subtract(daysBefore);
        return this.getWeight(from, to);
    }

    private async get(url: string): Promise<Response> {
        const result = await fetch(`https://api.fitbit.com/1${url}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${this.access_token}`
            }
        });

        return result;
    }
}
