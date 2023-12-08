import { Between, MoreThan, MoreThanOrEqual, QueryRunner } from "typeorm";
import { createProfileSchema, getProfilePillsSchema } from "../schemas/profile_schemas";
import { FromSchema } from "json-schema-to-ts";
import { Account, Device, ModifiedPill, PillRoutine, Profile } from "../models";
import { v4 as uuidv4 } from "uuid"
import { NotFoundAccount, NotFoundProfile, UnauthorizedError } from "../errors/custom_errors";
import validateToken from "../utils/authorization_validator";
import { Pill } from "../concepts/pill";
import RoutineFactory from "../utils/routine_factory";
import { addDays } from "date-fns";

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
    };

    public async getProfilePills(accountKey: string, profileKey: string, {
        fromDate: fromDateString,
        toDate: toDateString
    }: FromSchema<typeof getProfilePillsSchema.querystring>, authorization: string){
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

        const fromDate = new Date(fromDateString);
        const toDate = new Date(toDateString);

        const modifiedPills = await this.transaction.manager.find(ModifiedPill, {
            where: {
                pillRoutine: {
                    profile: profile
                },
                pillDatetime: Between(fromDate, addDays(toDate, 1))
            },
            order: {
                pillRoutine: {
                    id: "ASC"
                },
                pillDatetime: "ASC"
            },
            relations: {
                pillRoutine: true
            }
        });

        const modifiedPillsStack = modifiedPills.map(modifiedPill=>Pill.fromModifiedPill(modifiedPill));
        let routinePillsStack: Pill[] = []

        const pillRoutines = await this.transaction.manager.find(PillRoutine, {
            where: {
                profile: profile
            },
            order: {
                id: "ASC"
            }
        });

        pillRoutines.forEach(pillRoutine=>{
            const routine = RoutineFactory.createRoutine(pillRoutine.pillRoutineType.enumerator);
            routinePillsStack = routinePillsStack.concat(routine.getPillsOrderedByDatetimeAsc(fromDate, toDate, pillRoutine));
        });

        const pills: Pill[] = []

        console.log("Routine Pills Stack: \n" + routinePillsStack.map(pill=>pill.pillDatetime.toISOString()));
        console.log("Modified Pills Stack: \n" + modifiedPillsStack.map(pill=>pill.pillDatetime.toISOString()));        

        while(modifiedPillsStack.length != 0 || routinePillsStack.length != 0){
            console.log("Modifieds length " , modifiedPillsStack.length);
            console.log("Routines length ", routinePillsStack.length);
            console.log("Last modified pill ", typeof modifiedPillsStack[-1]);
            console.log("Last routine pill ", typeof routinePillsStack[-1]);
            if(modifiedPillsStack.length == 0){
                pills.push(routinePillsStack.pop()!)
                continue;
            }
            else if(routinePillsStack.length == 0){
                pills.push(modifiedPillsStack.pop()!)
                continue;
            }

            if(modifiedPillsStack[modifiedPillsStack.length-1].isEqual(routinePillsStack[routinePillsStack.length-1])){
                pills.push(modifiedPillsStack.pop()!);
                routinePillsStack.pop()
            }
            else {
                pills.push(routinePillsStack.pop()!);
            }
        }
        
        return pills;
    }
}