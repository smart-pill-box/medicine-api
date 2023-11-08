import { QueryRunner } from "typeorm";
import { createProfileBodySchema } from "../schemas/profile_schemas";
import { FromSchema } from "json-schema-to-ts";
import { Account, Profile } from "../models";
import { v4 as uuidv4 } from "uuid"
import { NotFoundAccount, NotFoundProfile } from "../errors/custom_errors";

export default class ProfileController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async createProfile(accounKey: string,
    {
        name
    }: FromSchema<typeof createProfileBodySchema>) {
        const account = await this.transaction.manager.findOne(Account, {
            where: {
                accountKey: accounKey
            }
        });

        if (!account) {
            throw new NotFoundAccount(accounKey);
        }

        const newProfile = new Profile();
        newProfile.name = name;
        newProfile.profileKey = uuidv4();
        newProfile.account = account;

        await this.transaction.manager.save(newProfile);

        return newProfile;
    }

    public async getProfile(accountKey: string, profileKey: string){
        const profile = await this.transaction.manager.findOne(Profile, {
            where: {
                profileKey: profileKey,
                account: {
                    accountKey: accountKey
                }
            },
            relations: {
                account: true
            }
        });

        if (!profile){
            throw new NotFoundProfile(accountKey, profileKey);
        }

        return profile;
    }
}