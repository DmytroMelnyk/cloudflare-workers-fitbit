import './__global';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';
import { ClientAuth, ClientCallback, ClientWeight, ClientActivity } from "./router/fitbit";
import { CronHandler } from './cron/fitbit';
import { FitbitApiData } from './fitbit/FitbitApiData';
import { Env } from './env';
import { ActivityType } from './domain/Activity';


const router = OpenAPIRouter({
	// https://github.com/cloudflare/itty-router-openapi/blob/main/src/types.ts
	schema: {
		info: {
			title: "Worker OpenAPI Example",
			version: "1.0"
		},
		oauth2RedirectUrl: "http://localhost:5000/swagger-ui/oauth2-redirect.html",
		components: {
			securitySchemes: {
				OAuth2: {
					type: 'oauth2',
					flows: {
						// https://swagger.io/docs/specification/authentication/oauth2/
						authorizationCode: {
							authorizationUrl: "https://www.fitbit.com/oauth2/authorize",
							tokenUrl: "https://api.fitbit.com/oauth2/token",
							scopes: {
								weight: ""
							}
						}
					}
				},
			},
		},
		security: [
			{
				OAuth2: [],
			},
		],
	}
});

router.get("/:clientId/activity/:activity", ClientActivity);
router.get("/:clientId/weight", ClientWeight);
router.get("/auth/:clientId", ClientAuth);
router.get("/callback/:clientId", ClientCallback);

// Redirect root request to the /docs page
router.original.get("/", (request) =>
	Response.redirect(`${request.url}docs`, 302)
);

// 404 for everything else
router.all("*", () => new Response("Not Found.", { status: 404 }));

export default {

	fetch: router.handle,

	// https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/#syntax
	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
		switch (event.cron) {
			case "55 */6 * * *":
				await FitbitApiData.for_all(env, x => CronHandler.refreshToken(env, x));
				break;
			case "0-7 * * * *":
				const minute = new Date().getMinutes();
				if (minute < 7) {
					const syncActivity = <ActivityType>Object.values(ActivityType)[minute % 7];
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

