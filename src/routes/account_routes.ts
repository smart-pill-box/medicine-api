import { FastifyInstance } from 'fastify';
import { FromSchema } from "json-schema-to-ts";
import { AppDataSource } from "../db_connection";
import { v4 as uuidv4 } from 'uuid';
import { Account } from '../models';
import { Profile } from '../models';
import { AccountDto } from '../dtos/account_dto';

const createAccountBodySchema =  {
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
    ],
    additionalProperties: false
} as const;

const getAccounParamsSchema = {
    type: "object",
    properties: {
        accountKey: {
            type: "string",
            minLength: 36,
            maxLength: 36
        }
    },
    required: ["accountKey"],
    additionalProperties: false
} as const;

export async function accountRoutes(server: FastifyInstance){
    const accountRepository = AppDataSource.getRepository(Account);
    const profileRepository = AppDataSource.getRepository(Profile);

    server.get<{ Params: FromSchema<typeof getAccounParamsSchema> }>(
        "/account/:accountKey",
        {
            schema: {
                params: getAccounParamsSchema
            }
        },
        async (req, resp)=>{

            const { accountKey } = req.params;
            const account = await accountRepository.findOne({
                where: {
                    accountKey: accountKey
                },
                relations: {
                    profiles: true
                }
            });

            if (!account) {
                resp.status(404).send();
                return
            }

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
            const mainProfileKey = uuidv4();

            const newAccount = new Account();
            newAccount.accountKey = uuidv4();
            newAccount.mainProfileKey = mainProfileKey;
            
            const { mainProfileName } = req.body;
            const mainProfile = new Profile();
            mainProfile.profileKey = mainProfileKey;
            mainProfile.name = mainProfileName;            
            
            newAccount.profiles = [mainProfile];
            await accountRepository.save(newAccount);
            
            resp.status(201).send(AccountDto.toClientResponse(newAccount));
    }); 
}
