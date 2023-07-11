import { Env } from "../env";
import { OAuth2Token } from "./OAuth2Token";

export interface FitbitApiDataDto {
    oauth2Token: OAuth2Token | undefined;
    clientId: string;
    clientSecret: string;
}

export class FitbitApiData implements FitbitApiDataDto {
    constructor(public oauth2Token: OAuth2Token | undefined, public clientId: string, public clientSecret: string) {
    }

    static async put(environment: Env, clientId: string, clientSecret: string, oauth2Token: OAuth2Token | undefined): Promise<undefined> {
        const data = new FitbitApiData(oauth2Token, clientId, clientSecret);
        await environment.WORKER_DATA.put(FitbitApiData.key(clientId), JSON.stringify(data));
    }

    static async get(environment: Env, clientId: string): Promise<FitbitApiDataDto | undefined> {
        const data = await environment.WORKER_DATA.get(FitbitApiData.key(clientId));

        if (!data) {
            return undefined;
        }

        return <FitbitApiDataDto>JSON.parse(data);
    }

    private static key(clientId: string) {
        return `FitbitApiData#${clientId}`;
    }
}
