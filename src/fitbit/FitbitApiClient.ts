export class FitbitApiClient {
    constructor(private access_token: string) {
    }

    // https://dev.fitbit.com/build/reference/web-api/body-timeseries/get-weight-timeseries-by-date-range/
    getWeight(from: Date, to: Date): Promise<Response> {
        return this.get(`/user/-/body/log/weight/date/${from.fitbitFormat()}/${to.fitbitFormat()}.json`);
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
