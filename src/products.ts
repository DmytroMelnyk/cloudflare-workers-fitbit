import {
	Bool,
	DateOnly,
	Int,
	Num,
	OpenAPIRoute,
	Path,
	Query,
	Str,
} from "@cloudflare/itty-router-openapi";
import { Env, createFaunaClient } from "./env";
import faunadb from 'faunadb';

const ProductDto = {
	serialNumber: new Str({ required: true }),
	title: new Str({ example: "peach", required: true }),
	weightLbs: new Num(),
	quantity: new Num()
};

export class ProductCreate extends OpenAPIRoute {
	static schema = {
		tags: ["Products"],
		summary: "Create a new Product",
		requestBody: ProductDto,
		responses: {
			"200": {
				schema: {
					productId: new Str(),
				},
			},
		},
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		// Retrieve the validated request body
		const { serialNumber, title, weightLbs, quantity } = data.body;

		// Actually insert the task
		const faunaClient = createFaunaClient(env);
		const result = await faunaClient.query(
			Create(
				Collection('Products'),
				{
					data: {
						serialNumber,
						title,
						weightLbs,
						quantity
					}
				}
			)
		);

		return {
			productId: result.ref.id,
		};
	}
}

export class ProductFetch extends OpenAPIRoute {
	static schema = {
		tags: ["Products"],
		summary: "Get a single Product by id",
		parameters: {
			productId: Path(Str, {
				description: "Product id",
			}),
		},
		responses: {
			"200": {
				schema: ProductDto,
			},
		},
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		// Retrieve the validated slug
		const { productId } = data;

		const faunaClient = createFaunaClient(env);
		const result = await faunaClient.query(
			Get(Ref(Collection('Products'), productId))
		);

		return result.data;
	}
}

export class ProductDelete extends OpenAPIRoute {
	static schema = {
		tags: ["Products"],
		summary: "Delete a Product",
		parameters: {
			productId: Path(Str, {
				description: "Product id",
			}),
		},
		responses: {
			"200": {
				schema: ProductDto,
			},
		},
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {

		const { productId } = data;

		const faunaClient = createFaunaClient(env);
		const result = await faunaClient.query(
			Delete(Ref(Collection('Products'), productId))
		);

		return result.data;
	}
}

export class ProductUpdateQuantity extends OpenAPIRoute {
	static schema = {
		tags: ["Products"],
		summary: "Update the Product Quantity",
		requestBody: { quantity: new Num() },
		parameters: {
			productId: Path(Str, {
				description: "Product id",
			}),
		},
		responses: {
			"200": {
				schema: {
					productId: new Str(),
				},
			},
		},
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		// Retrieve the validated request body
		const { quantity } = data.body;

		const { productId } = data;

		// Actually insert the task
		const faunaClient = createFaunaClient(env);
		const result = await faunaClient.query(
			Let(
				{
					productRef: Ref(Collection('Products'), productId),
					productDocument: Get(Var('productRef')),
					currentQuantity: Select(['data', 'quantity'], Var('productDocument'))
				},
				Update(
					Var('productRef'),
					{
						data: {
							quantity: Add(
								Var('currentQuantity'),
								quantity
							)
						}
					}
				)
			)
		);

		return result;
	}
}

export class ProductList extends OpenAPIRoute {
	static schema = {
		tags: ["Products"],
		summary: "List Products",
		parameters: {
			page: Query(Int, {
				description: "Page number",
				default: 0,
			}),
			isCompleted: Query(Bool, {
				description: "Filter by completed flag",
				required: false,
			}),
		},
		responses: {
			"200": {
				schema: {
					tasks: [ProductDto],
				},
			},
		},
	};

	async handle(
		request: Request,
		env: Env,
		context: ExecutionContext,
		data: Record<string, any>
	) {
		// Retrieve the validated parameters
		const { page, isCompleted } = data;

		const faunaClient = createFaunaClient(env);
		const result = await faunaClient.query(Map(
			Paginate(Documents(Collection('Products')), { size: 64 }),
			Lambda((x) => Get(x))
		)
		);

		return result.data.map(x => x.data);
	}
}








// router.post('/products', async (content) => {
//     try {
//       const {serialNumber, title, weightLbs} = content;

//       const result = await faunaClient.query(
//         Create(
//           Collection('Products'),
//           {
//             data: {
//               serialNumber,
//               title,
//               weightLbs,
//               quantity: 0
//             }
//           }
//         )
//       );

//       console.log(result);

//       return new Response(JSON.stringify({
//         productId: result.ref.id
//       }))
//     }
//     catch (error) {
//       console.log(error);
//       const faunaError = getFaunaError(error);
//       res.status = faunaError.status;
//       res.body = faunaError
//     }
//   })

//   router.get('/products/:productId', async ({req, res}) => {
//     try {
//       const productId = req.params.productId;

//       const result = await faunaClient.query(
//         Get(Ref(Collection('Products'), productId))
//       );

//       res.body = result;

//     } catch (error) {
//       const faunaError = getFaunaError(error);
//       res.status = faunaError.status;
//       res.body = faunaError;
//     }
//   });

//   router.delete('/products/:productId', async ({req, res}) => {

//     try {
//       const productId = req.params.productId;

//       const result = await faunaClient.query(
//         Delete(Ref(Collection('Products'), productId))
//       );

//       res.body = result;

//     } catch (error) {
//       const faunaError = getFaunaError(error);
//       res.status = faunaError.status;
//       res.body = faunaError;
//     }
//   });

//   router.patch('/products/:productId/add-quantity', async ({req, res}) => {

//     try {
//       const productId = req.params.productId;
//       const {quantity} = req.body;

//       const result = await faunaClient.query(
//         Let(
//           {
//             productRef: Ref(Collection('Products'), productId),
//             productDocument: Get(Var('productRef')),
//             currentQuantity: Select(['data', 'quantity'], Var('productDocument'))
//           },
//           Update(
//             Var('productRef'),
//             {
//               data: {
//                 quantity: Add(
//                   Var('currentQuantity'),
//                   quantity
//                 )
//               }
//             }
//           )
//         )
//       );

//       res.body = result;

//     } catch (error) {
//       const faunaError = getFaunaError(error);
//       res.status = faunaError.status;
//       res.body = faunaError;
//     }
//   });

const { Create, Collection, Match, Index, Get, Ref, Paginate, Sum, Delete, Add, Select, Let, Var, Update, Map, Documents, Lambda } = faunadb.query;