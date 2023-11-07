import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { AccountDto } from '../dtos/account_dto';
import { getAccounParamsSchema, createAccountBodySchema } from '../schemas/account_schemas';
import { getAccount, createAccount } from "../controllers/account_controller"

export async function accountRoutes(server: FastifyInstance){
    server.get<{ Params: FromSchema<typeof getAccounParamsSchema> }>(
        "/account/:accountKey",
        {
            schema: {
                params: getAccounParamsSchema
            }
        },
        async (req, resp)=>{
            const account = await getAccount(req.params);
            resp.status(200).send(AccountDto.toClientResponse(account));
        })

    server.post<{ Body: FromSchema<typeof createAccountBodySchema> }>(
        "/account",
        {
            schema: {
                body: createAccountBodySchema
            }
        },
        async (req, resp)=>{
            const newAccount = await createAccount(req.body);

            resp.status(201).send(AccountDto.toClientResponse(newAccount));
    }); 
}
