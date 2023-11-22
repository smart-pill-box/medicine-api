import { Account, Profile } from '../models';
import { FromSchema } from "json-schema-to-ts";
import { createAccountSchema } from "../schemas/account_schemas";
import { NotFoundAccount } from "../errors/custom_errors";
import { v4 as uuidv4 } from 'uuid';
import { QueryRunner } from "typeorm";
import validateToken from '../utils/authorization_validator';

export default class AccountController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async getAccount(accountKey: string): Promise<Account>{

        const account = await this.transaction.manager.findOne(Account, {
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

    public async createAccount({ mainProfileName }: FromSchema<typeof createAccountSchema.body>, authorization: string): Promise<Account>{
        const token = await validateToken(authorization);

        const accountKey = token.sub!;
        const mainProfileKey = uuidv4();

        const newAccount = new Account();
        newAccount.accountKey = accountKey;
        newAccount.mainProfileKey = mainProfileKey;

        const mainProfile = new Profile();
        mainProfile.profileKey = mainProfileKey;
        mainProfile.name = mainProfileName;
        
        newAccount.profiles = [mainProfile];
        await this.transaction.manager.save(newAccount);
        
        return newAccount;
    } 
}