import { QueryRunner } from "typeorm";
import { createProfileSchema } from "../schemas/profile_schemas";
import { FromSchema } from "json-schema-to-ts";
import { Account, Device, PillRoutine, Profile } from "../models";
import { v4 as uuidv4 } from "uuid"
import { NotFoundAccount, NotFoundProfile, UnauthorizedError } from "../errors/custom_errors";
import validateToken from "../utils/authorization_validator";

export default class ProfileController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async createProfile(accountKey: string,
    {
        name
    }: FromSchema<typeof createProfileSchema.body>, authorization: string) {
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

        const account = await this.transaction.manager.findOne(Account, {
            where: {
                accountKey: accountKey
            }
        });

        if (!account) {
            throw new NotFoundAccount(accountKey);
        }

        const newProfile = new Profile();
        newProfile.name = name;
        newProfile.profileKey = uuidv4();
        newProfile.account = account;

        await this.transaction.manager.save(newProfile);

        return newProfile;
    }

    public async getProfile(accountKey: string, profileKey: string, authorization: string){
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

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

    public async getAllProfileDevices(accountKey: string, profileKey: string, authorization: string){
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

        const profile = await this.transaction.manager.findOne(Profile, {
            where: {
                profileKey: profileKey,
                account: {
                    accountKey: accountKey
                }
            }
        });

        if (!profile){
            throw new NotFoundProfile(accountKey, profileKey);
        }

        const profileDevices = await this.transaction.manager.find(Device, {
            where: {
                profileDevice: {
                    profile: profile
                }
            }
        });

        return profileDevices;
    }

    public async getAllProfilePillRoutines(accountKey: string, profileKey: string, authorization: string): Promise<PillRoutine[]>{
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

        const profile = await this.transaction.manager.findOne(Profile, {
            where: {
                profileKey: profileKey,
                account: {
                    accountKey: accountKey
                }
            }
        });

        if (!profile){
            throw new NotFoundProfile(accountKey, profileKey);
        }

        const profilePillRoutines = await this.transaction.manager.find(PillRoutine, {
            where: {
                profile: profile
            }
        })

        return profilePillRoutines;
    }
}