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

		return new Response(JSONtoXML({ entry: history }));
	}
}