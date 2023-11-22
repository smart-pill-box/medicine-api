import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { AccountDto } from '../dtos/account_dto';
import { getAccountSchema, createAccountSchema } from '../schemas/account_schemas';
import AccountController from '../controllers/account_controller';

export async function accountRoutes(server: FastifyInstance){
    server.get<{ Params: FromSchema<typeof getAccountSchema.params> }>(
        "/account/:accountKey",
        {
            schema: getAccountSchema
        },
        async (req, resp)=>{
            const accountController = new AccountController(req.transaction);

            const account = await accountController.getAccount(req.params.accountKey);
            resp.status(200).send(AccountDto.toClientResponse(account));
        })

    server.post<{ Body: FromSchema<typeof createAccountSchema.body>, Headers: FromSchema<typeof createAccountSchema.headers>}>(
        "/account",
        {
            schema: createAccountSchema
        },
        async (req, resp)=>{
            const accountController = new AccountController(req.transaction);
        
            const newAccount = await accountController.createAccount(req.body, req.headers.authorization);

            resp.status(201).send(AccountDto.toClientResponse(newAccount));
    }); 
}
