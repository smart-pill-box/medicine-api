import "reflect-metadata";
import fastify, { FastifyInstance } from "fastify";
import { AppDataSource } from "./db_connection";
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import { accountRoutes } from "./routes/account_routes";

const server: FastifyInstance = fastify().withTypeProvider<JsonSchemaToTsProvider>();

// server.addHook("onRequest", createTransaction);
// server.addHook("onError", rollbackTransaction);

AppDataSource.initialize()
  .then(() => {
    server.register(accountRoutes);

    server.listen({ port: 8080, host: "0.0.0.0" })
      .then((address) => console.log(`server listening on ${address}`))
      .catch((err: Error) => {
        console.log('Error starting server:', err);
        process.exit(1);
      });
  })
  .catch((err: Error) => {
    console.error("Unable to connect to database", err);
  });
