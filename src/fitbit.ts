import { OpenAPIRoute, Path, Str, Header, Query, DateOnly, Num } from "@cloudflare/itty-router-openapi";
import { Env } from "./env";
import { FitbitApiAuthorizer } from "./fitbit/FitbitApiAuthorizer";
import { ApiScope } from "./fitbit/ApiScope";
import { FitbitApiData } from "./fitbit/FitbitApiData";
import { FitbitApiClient } from "./fitbit/FitbitApiClient";
import { WeightRepository } from "./domain/WeightRepository";
import { Weight } from "./domain/Weight";
import { JSONtoXML } from "./util";

export class ClientAuth extends OpenAPIRoute {
	static schema = {
		tags: ["Registration"],
		summary: "Register Client",
		parameters: {
			clientId: Path(Str, {
				description: "Client Id",
				default: "23R87T"
			}),
			clientSecret: Header(Str, {
				description: "Client Secret",
				format: "password",
				default: "20c81880494a27594c1b3512748702ed"
			})
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		const { clientId, clientSecret } = data;

		const api = new FitbitApiAuthorizer(clientId, clientSecret);
		await FitbitApiData.put(env, clientId, clientSecret, undefined);

		const callback_url = api.getLoginUrl(
			`${new URL(request.url).origin}/callback/${clientId}`,
			ApiScope.ACTIVITY,
			ApiScope.CARDIO_FITNESS,
			ApiScope.ELECTROCARDIOGRAM,
			ApiScope.HEARTRATE,
			ApiScope.LOCATION,
			ApiScope.NUTRITION,
			ApiScope.OXYGEN_SATURATION,
			ApiScope.PROFILE,
			ApiScope.RESPIRATORY_RATE,
			ApiScope.SETTINGS,
			ApiScope.SLEEP,
			ApiScope.SOCIAL,
			ApiScope.TEMPERATURE,
			ApiScope.WEIGHT
		);
		return Response.redirect(callback_url, 302);
	}
}

export class ClientCallback extends OpenAPIRoute {
	static schema = {
		tags: ["Registration"],
		summary: "Continue Registration",
		parameters: {
			clientId: Path(Str, {
				description: "Client Id",
				default: "23R87T"
			}),
			code: Query(Str)
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		const { clientId, code } = data;
		const fitbitData = (await FitbitApiData.get(env, clientId))!;
		const client = new FitbitApiAuthorizer(fitbitData.clientId, fitbitData.clientSecret);
		const requestUrl = new URL(request.url);
		requestUrl.search = "";
		const response = await client.requestOAuth2Token(code, requestUrl.toString());

		await FitbitApiData.put(env, fitbitData.clientId, fitbitData.clientSecret, response);
		return Response.redirect(`${new URL(request.url).origin}`, 302);
	}
}

export class ClientWeight extends OpenAPIRoute {
	static schema = {
		tags: ["Data"],
		summary: "Get Weight",
		parameters: {
			clientId: Path(Str, {
				description: "Client Id",
				default: "23R87T"
			}),
			from: Path(DateOnly, {
				default: "2023-06-01"
			}),
			to: Path(DateOnly, {
				default: "2023-07-01"
			}),
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		const { clientId, from, to } = data;

		const fitbitData = (await FitbitApiData.get(env, clientId));
		if (!fitbitData || !fitbitData.oauth2Token) {
			return new Response("User not registered", { status: 400 });
		}

		const client = new FitbitApiClient(fitbitData.oauth2Token.access_token);
		const response = await client.getWeight(from, to);

		//https://www.npmjs.com/package/jstoxml
		//const jsonData = await response.json();
		//return new Response(toXML(jsonData));
		return response;
	}
}

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


// HEALTH METRICS:
// https://api.fitbit.com/1/user/-/br/date/2023-07-11/2023-07-16.json // .breathingRate
/*
In general, a higher average HRV is linked to greater overall health and fitness. A significant drop in your HRV can have many causes, including a poor night’s sleep, physical strain, diet, or being emotionally or physically stressed. 
Again, a significant drop in your HRV may mean that your body is in fight-or-flight mode, so look to see if your HRV has been trending downward over multiple nights. You could also just be in a normal recovery phase after some intense workouts! 
But, if that’s the case, you guessed it—your lower HRV is letting you know that your body is in need of rest. You may want to consider prioritizing recovery to bounce back from potential overtraining, lack of sleep, hormonal changes, psychological stress, and more
*/
// https://api.fitbit.com/1/user/-/hrv/date/2023-06-16/2023-07-16.json // .dailyRmssd 
// https://api.fitbit.com/1/user/-/temp/skin/date/2023-06-25/2023-07-15.json // .nightlyRelative
// https://api.fitbit.com/1/user/-/activities/heart/date/2023-06-15/2023-07-15.json | jq '."activities-heart"[].value.restingHeartRate'
// https://api.fitbit.com/1/user/-/activities/calories/date/2023-06-15/2023-07-15.json
// https://api.fitbit.com/1/user/-/activities/active-zone-minutes/date/2023-07-10/2023-07-16.json // .activeZoneMinutes
// https://api.fitbit.com/1/user/-/activities/steps/date/2023-06-15/2023-07-15.json
// https://api.fitbit.com/1.2/user/-/sleep/date/2023-06-05/2023-07-05.json



export class TestRoute extends OpenAPIRoute {
	static schema = {
		tags: ["Test"],
		summary: "Test",
		parameters: {
			clientId: Path(Str, {
				description: "Client Id",
				default: "23R87T"
			}),
			daysBefore: Path(Num, {
				description: "Days before current date",
				default: "7"
			})
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		const { clientId, daysBefore } = data;
		const repository = new WeightRepository(env);

		const history = await repository.getWeight(clientId, daysBefore);

		return new Response(JSONtoXML({ data: { entry: history } }));
	}
}