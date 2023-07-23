import { OpenAPIRoute, Path, Str, Header, Query, DateOnly, Num, Enumeration } from "@cloudflare/itty-router-openapi";
import { Env } from "../env";
import { FitbitApiAuthorizer } from "../fitbit/FitbitApiAuthorizer";
import { ApiScope } from "../fitbit/ApiScope";
import { FitbitApiData } from "../fitbit/FitbitApiData";
import { FitbitApiClient } from "../fitbit/FitbitApiClient";
import { WeightRepository } from "../domain/WeightRepository";
import { JSONtoXML } from "../util";
import { ActivityType } from "../domain/Activity";
import { ActivityRepository } from "../domain/ActivityRepository";

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
			from: Query(DateOnly, {
				default: "2023-06-01"
			})
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		const { clientId, from } = data;

		const repository = new WeightRepository(env);

		const history = await repository.getWeight(clientId, from);

		return new Response(JSONtoXML({ data: { entry: history } }));
	}
}

export class ClientActivity extends OpenAPIRoute {
	static schema = {
		tags: ["Data"],
		summary: "Get Activity",
		parameters: {
			clientId: Path(Str, {
				description: "Client Id",
				default: "23R87T"
			}),
			activity: Path(new Enumeration({ values: ActivityType }), {
				description: "Activity type",
				default: ActivityType.ACTIVE_ZONE_MINUTES,
			}),
			from: Query(DateOnly)
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		const { clientId, activity, from } = data;
		const repository = new ActivityRepository(env);

		const history = await repository.get(activity, clientId, from);

		return new Response(JSONtoXML({ data: { entry: history } }));
	}
}

export class ClientLatestHeartRate extends OpenAPIRoute {
	static schema = {
		tags: ["Data"],
		summary: "Get Latest Heart Rate",
		parameters: {
			clientId: Path(Str, {
				description: "Client Id",
				default: "23R87T"
			})
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		const { clientId } = data;
		const token = await FitbitApiData.get(env, clientId);
		const client = new FitbitApiClient(token?.oauth2Token?.access_token!);
		const hr = await client.getHeartLatest();
		return new Response(JSONtoXML({ data: { entry: hr } }));
	}
}