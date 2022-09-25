import Fastify from "fastify";
import { ApolloServer, ApolloServerOptions, BaseContext } from "@apollo/server";
import {
	CreateServerForIntegrationTestsOptions,
	defineIntegrationTestSuite,
} from "@apollo/server-integration-testsuite";

import { FASTIFY_LISTEN_OPTIONS, METHODS, serializerLikeBodyParser } from "./options";
import {
	fastifyApolloHandler,
	fastifyApolloDrainPlugin,
	ApolloFastifyContextFunction,
} from "../src";

defineIntegrationTestSuite(
	async (
		serverOptions: ApolloServerOptions<BaseContext>,
		testOptions?: CreateServerForIntegrationTestsOptions,
	) => {
		const fastify = Fastify();

		fastify.setSerializerCompiler(serializerLikeBodyParser);

		const apollo = new ApolloServer({
			...serverOptions,
			plugins: [...(serverOptions.plugins ?? []), fastifyApolloDrainPlugin(fastify)],
		});

		await apollo.start();

		fastify.route({
			url: "/",
			method: METHODS,
			handler: fastifyApolloHandler(apollo, {
				context: testOptions?.context as ApolloFastifyContextFunction<BaseContext>,
			}),
		});

		const url = await fastify.listen(FASTIFY_LISTEN_OPTIONS);

		return {
			server: apollo,
			url,
		};
	},
	{
		noIncrementalDelivery: true,
	},
);
