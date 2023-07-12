import { OpenAPIRoute, Int, Bool, Path, Str, Header, Query, DateOnly } from "@cloudflare/itty-router-openapi";
import { Env, createFaunaClient } from "./env";
import { FitbitApiAuthorizer } from "./fitbit/FitbitApiAuthorizer";
import { ApiScope } from "./fitbit/ApiScope";
import { FitbitApiData } from "./fitbit/FitbitApiData";
import { FitbitApiClient } from "./fitbit/FitbitApiClient";

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

		const callback_url = api.getLoginUrl(`${new URL(request.url).origin}/callback/${clientId}`, ApiScope.WEIGHT);
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
		const client = new FitbitApiClient(fitbitData.oauth2Token.access_token);
		const response = await client.getWeight(from, to);
		return response;
	}
}