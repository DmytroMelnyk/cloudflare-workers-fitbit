import './__global';
import { AutoRouter } from 'itty-router';
import { fromIttyRouter } from 'chanfana';
import { ClientAuth, ClientCallback, ClientWeight, ClientActivity, ClientLatestHeartRate } from "./router/fitbit";
import { CronHandler } from './cron/fitbit';
import { FitbitApiData } from './fitbit/FitbitApiData';
import { Env } from './env';
import { ActivityType } from './domain/Activity';

const router = AutoRouter();
const openApi = fromIttyRouter(router);
const bearerAuth = openApi.registry.registerComponent('securitySchemes', 'OAuth2', {
	type: 'oauth2',
	flows: {
		// https://swagger.io/docs/specification/authentication/oauth2/
		authorizationCode: {
			authorizationUrl: "https://www.fitbit.com/oauth2/authorize",
			tokenUrl: "https://api.fitbit.com/oauth2/token",
			scopes: {
				weight: "",
				activity: "",
				heartrate: "",
				sleep: "",
			}
		}
	}
});
openApi.get("/:clientId/hr", ClientLatestHeartRate);
openApi.get("/:clientId/weight", ClientWeight);
openApi.get("/:clientId/activity/:activity", ClientActivity);
openApi.get("/auth/:clientId", ClientAuth);
openApi.get("/callback/:clientId", ClientCallback);
openApi.get("/oauth2-redirect.html", () => ({ foo: 'bar' }));

// Redirect root request to the /docs page
openApi.original.get("/", (request) =>
	Response.redirect(`${request.url}docs`, 302)
);

// 404 for everything else
openApi.all("*", () => new Response("Not Found.", { status: 404 }));

export default {

	fetch: openApi.fetch,

	// https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/#syntax
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		switch (event.cron) {
			case "55 */6 * * *":
				await FitbitApiData.for_all(env, x => CronHandler.refreshToken(env, x));
				break;
			case "0-7 * * * *":
				const minute = new Date().getMinutes();
				const activities = Object.values(ActivityType);
				if (minute < activities.length) {
					const syncActivity = <ActivityType>activities[minute % activities.length];
					await FitbitApiData.for_all_keys(env, clientId => CronHandler.syncActivity(env, clientId, syncActivity));
				}
				else {
					await FitbitApiData.for_all_keys(env, clientId => CronHandler.syncWeight(env, clientId));
				}
				break;
			default:
				console.log(`unprocessed cron: ${event.cron}`);
				break;
		}
	},
};

