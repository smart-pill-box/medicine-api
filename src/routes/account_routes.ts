import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { AppDataSource } from "../db_connection";
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../models';
import { Profile } from '../models';
import { AccountDto } from '../dtos/account_dto';

const createAccountSchema =  {
    type: "object",
    properties: {
        mainProfileName: {
            type: "string",
            minLength: 1,
            maxLength: 255
        }
    },
    required: [
        "mainProfileName"
    ]
} as const;

export async function accountRoutes(server: FastifyInstance){
    server.post<{ Body: FromSchema<typeof createAccountSchema> }>(
        "/account",
        {
            schema: {
                body: createAccountSchema
            }
        },
        async (req, resp)=>{
            const mainProfileKey = uuidv4();

            const newAccount = new Account();
            newAccount.accountKey = uuidv4();
            newAccount.mainProfileKey = mainProfileKey;
            
            const { mainProfileName } = req.body;
            const mainProfile = new Profile();
            mainProfile.profileKey = mainProfileKey;
            mainProfile.name = mainProfileName;            
            
            newAccount.profiles = [mainProfile];
            await AppDataSource.manager.save(newAccount);
            
            resp.status(201).send(AccountDto.toClientResponse(newAccount));
    }); 
}
