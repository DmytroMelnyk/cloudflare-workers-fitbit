import { Env } from "../env";
import { OAuth2Token } from "./OAuth2Token";

export interface FitbitApiDataDto {
    oauth2Token: OAuth2Token | undefined;
    clientId: string;
    clientSecret: string;
}

// https://developers.cloudflare.com/workers/runtime-apis/kv/#metadata-1
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

    static async for_all<T>(environment: Env, action: (data: FitbitApiDataDto) => Promise<T>, parallelism_level: number = 5): Promise<void> {
        var iterator: KVNamespaceListResult<unknown, string> | null = null;
        do {
            iterator = await environment.WORKER_DATA.list({ prefix: "FitbitApiData", cursor: iterator?.cursor, limit: parallelism_level });
            const tokens = await Promise.all(iterator.keys.map(key => FitbitApiData.get(environment, FitbitApiData.clientId(key.name))));
            await Promise.all(tokens.filter(token => token).map(token => action(token!)));
        } while (!iterator.list_complete);
    }

    static async for_all_keys<T>(environment: Env, action: (clientId: string) => Promise<T>, parallelism_level: number = 5): Promise<void> {
        var iterator: KVNamespaceListResult<unknown, string> | null = null;
        do {
            iterator = await environment.WORKER_DATA.list({ prefix: "FitbitApiData:", cursor: iterator?.cursor, limit: parallelism_level });
            await Promise.all(iterator.keys.map(key => action(FitbitApiData.clientId(key.name))));
        } while (!iterator.list_complete);
    }

    private static key(clientId: string) {
        return `FitbitApiData:${clientId}`;
    }

    private static clientId(key: string) {
        return key.replace("FitbitApiData:", "");
    }
}
