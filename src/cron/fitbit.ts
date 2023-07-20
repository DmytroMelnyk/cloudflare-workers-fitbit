import { Env } from "../env";
import { FitbitApiAuthorizer } from "../fitbit/FitbitApiAuthorizer";
import { FitbitApiData } from "../fitbit/FitbitApiData";
import { FitbitApiClient } from "../fitbit/FitbitApiClient";
import { WeightRepository } from "../domain/WeightRepository";
import { Weight } from "../domain/Weight";

export class CronHandler {

	static async refreshToken(env: Env, data: FitbitApiData) {
		if (!data.oauth2Token) {
			return;
		}

		const authorizer = new FitbitApiAuthorizer(data.clientId, data.clientSecret);
		const token = await authorizer.extendAccessToken(data.oauth2Token!.refresh_token);
		await FitbitApiData.put(env, data.clientId, data.clientSecret, token);
	}

	static async syncWeight(
		env: Env,
		clientId: string
	) {
		//TODO: Timezone is defined at
		//https://api.fitbit.com/1/user/-/profile.json .timezone //America/Toronto
		const timezone = "-04:00";
		const fitbitData = (await FitbitApiData.get(env, clientId));
		if (!fitbitData || !fitbitData.oauth2Token) {
			return new Response("User not registered", { status: 400 });
		}

		const client = new FitbitApiClient(fitbitData.oauth2Token.access_token);
		const repository = new WeightRepository(env);
		const latest = await repository.getLatest(clientId);
		const historyDtos = latest[1] ?
			await client.getWeight(latest[1], new Date()) :
			await client.getWeightAt(new Date());

		if (!historyDtos.length) {
			return;
		}

		const history = historyDtos
			.filter(x => x.logId > latest[0])
			.map(x => <Weight>{
				_id: String(x.logId),
				clientId,
				fat: x.fat,
				weight: x.weight,
				timestamp: new Date(Date.parse(`${x.date}T${x.time}${timezone}`))
			});

		await repository.insertMany(history);
	}
}
