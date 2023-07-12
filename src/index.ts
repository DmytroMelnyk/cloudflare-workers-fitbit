import './__global';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';
import { ProductCreate, ProductDelete, ProductFetch, ProductList, ProductUpdateQuantity } from "./products";
import { ClientAuth, ClientCallback, ClientWeight } from "./fitbit";


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

router.get("/weight/:clientId/:from/:to", ClientWeight);
router.get("/auth/:clientId", ClientAuth);
router.get("/callback/:clientId", ClientCallback);
router.get("/api/products", ProductList);
router.post("/api/products", ProductCreate);
router.get("/api/products/:productId", ProductFetch);
router.delete("/api/products/:productId", ProductDelete);
router.patch("/api/products/:productId/add-quantity", ProductUpdateQuantity);

// Redirect root request to the /docs page
router.original.get("/", (request) =>
	Response.redirect(`${request.url}docs`, 302)
);

// 404 for everything else
router.all("*", () => new Response("Not Found.", { status: 404 }));

export default {
	fetch: router.handle,
};

