import { AppDataSource } from "../db_connection";
import { Account, Profile } from '../models';
import { FromSchema } from "json-schema-to-ts";
import { getAccounParamsSchema, createAccountBodySchema } from "../schemas/account_schemas";
import { NotFoundAccount } from "../errors/custom_errors";
import { v4 as uuidv4 } from 'uuid';

const accountRepository = AppDataSource.getRepository(Account);
const profileRepository = AppDataSource.getRepository(Profile);

export async function getAccount({ accountKey }: FromSchema<typeof getAccounParamsSchema>): Promise<Account>{

    const account = await accountRepository.findOne({
        where: {
            accountKey: accountKey
        },
        relations: {
            profiles: true
        }
    });

    if (!account) {
        throw new NotFoundAccount(accountKey);
    }

    return account;
}

export async function createAccount({ mainProfileName }: FromSchema<typeof createAccountBodySchema>): Promise<Account>{

    const mainProfileKey = uuidv4();

    const newAccount = new Account();
    newAccount.accountKey = uuidv4();
    newAccount.mainProfileKey = mainProfileKey;

    const mainProfile = new Profile();
    mainProfile.profileKey = mainProfileKey;
    mainProfile.name = mainProfileName;            
    
    newAccount.profiles = [mainProfile];
    await accountRepository.save(newAccount);

    return newAccount
} 