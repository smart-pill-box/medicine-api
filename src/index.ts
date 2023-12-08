import "reflect-metadata";
import fastify, { FastifyInstance } from "fastify";
import { AppDataSource } from "./db_connection";
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts'
import { accountRoutes } from "./routes/account_routes";
import CustomError from "./errors/custom_error";
import Ajv from "ajv"
import { profileRoutes } from "./routes/profile_routes";
import { deviceRoutes } from "./routes/device_routes";
import { profileDeviceRoutes } from "./routes/profile_device_routes";
import { pillRoutineRoutes } from "./routes/pill_routine_routes";
import { modifiedPillRoutes } from "./routes/modified_pill_routes";

interface SchemaCompilers {
  body: Ajv;
  params: Ajv;
  querystring: Ajv;
  headers: Ajv;
}

export const server: FastifyInstance = fastify().withTypeProvider<JsonSchemaToTsProvider>();

const schemaCompilers: SchemaCompilers = {
  body: new Ajv({
    removeAdditional: false,
    coerceTypes: true,
    allErrors: true
  }),
  params: new Ajv({
    removeAdditional: false,
    coerceTypes: true,
    allErrors: true
  }),
  querystring: new Ajv({
    removeAdditional: false,
    coerceTypes: true,
    allErrors: true
  }),
  headers: new Ajv({
    removeAdditional: false,
    coerceTypes: true,
    allErrors: true
  })
}

server.setValidatorCompiler(req => {
    if (!req.httpPart) {
      throw new Error('Missing httpPart')
    }
    const compiler = schemaCompilers[req.httpPart as keyof SchemaCompilers]
    if (!compiler) {
      throw new Error(`Missing compiler for ${req.httpPart}`)
    }
    return compiler.compile(req.schema)
})

AppDataSource.initialize()
  .then(() => {
    server.setErrorHandler(async (err, req, resp)=>{
      console.log("Error Hapend");
      await req.transaction.rollbackTransaction();

      if (err instanceof CustomError){
        resp.status(err.statusCode).send({
          code: err.code,
          description: err.description
        });
      }
      else if (err.validation) {
        resp.status(400).send({
          code: "SCHEMA_ERR",
          description: err.validation
        });
      }
      else {
        console.error(`Unexpected internal error ${err}`);
        resp.status(500).send({
          code: "INT_ERR",
          description: "Internal Error, sorry about that"
        })
      }
    })

    server.addHook("onRequest", async (req, resp)=>{
      console.log("\n---------------------")
      console.log("Req ", req.method, " ", req.url);
      console.log(req.body)

      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      req.transaction = queryRunner;
  
    });

    server.addHook("onSend", async (req, resp, payload) => {
      console.log("Resp ", resp.statusCode, " ", payload);
      console.log("---------------------\n");

      if (resp.statusCode < 300){
        await req.transaction.commitTransaction();
      }
      await req.transaction.release();
    });
  
    server.register(accountRoutes);
    server.register(profileRoutes);
    server.register(deviceRoutes);
    server.register(profileDeviceRoutes);
    server.register(pillRoutineRoutes);
    server.register(modifiedPillRoutes);

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
