import { OpenAPIRoute } from "chanfana";
import { z } from 'zod';
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
	schema = {
		tags: ["Registration"],
		summary: "Register Client",
		request: {
			params: z.object({ clientId: z.string().default("23R87T").describe("Client Id") }),
			headers: z.object({ clientSecret: z.string().describe("Client Secret") })
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext
	) {
		const data = await this.getValidatedData<typeof this.schema>();
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
	schema = {
		tags: ["Registration"],
		summary: "Continue Registration",
		request: {
			params: z.object({ clientId: z.string().default("23R87T").describe("Client Id") }),
			query: z.object({ code: z.string() })
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext
	) {
		const data = await this.getValidatedData<typeof this.schema>();
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
	schema = {
		tags: ["Data"],
		summary: "Get Weight",
		request: {
			params: z.object({ clientId: z.string().default("23R87T").describe("Client Id") }),
			query: z.object({ from: z.string().date().default("2023-06-01") })
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext
	) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { clientId, from } = data;

		const repository = new WeightRepository(env);

		const history = await repository.getWeight(clientId, from);

		return new Response(JSONtoXML({ data: { entry: history } }));
	}
}

export class ClientActivity extends OpenAPIRoute {
	schema = {
		tags: ["Data"],
		summary: "Get Activity",
		request: {
			params: z.object({ clientId: z.string().default("23R87T").describe("Client Id").optional(), from: z.string().date().default("2024-01-30") }),
			path: z.object({ activity: z.nativeEnum(ActivityType).default(ActivityType.ACTIVE_ZONE_MINUTES).describe("Activity type") }),
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext
	) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { clientId, activity, from } = data;
		const repository = new ActivityRepository(env);

		const history = await repository.get(activity, clientId, from);

		return new Response(JSONtoXML({ data: { entry: history } }));
	}
}

export class ClientLatestHeartRate extends OpenAPIRoute {
	schema = {
		tags: ["Data"],
		summary: "Get Latest Heart Rate",
		request: {
			params: z.object({ clientId: z.string().default("23R87T").describe("Client Id") }),
		}
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext
	) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { clientId } = data;
		const token = await FitbitApiData.get(env, clientId);
		const client = new FitbitApiClient(token?.oauth2Token?.access_token!);
		const hr = await client.getHeartLatest();
		return new Response(JSONtoXML({ data: { entry: hr } }));
	}
}