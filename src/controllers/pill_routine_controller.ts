import { QueryRunner } from "typeorm";
import { FromSchema } from "json-schema-to-ts";
import { createPillRoutineSchema, updatePillRoutineSchema } from "../schemas/pill_routine_schemas";
import { ModifiedPill, PillRoutine, PillRoutineStatus, PillRoutineStatusEvent, PillRoutineType, PillRoutineVersion, Profile } from "../models";
import { CantCreateRoutineStartingOnThePast, ExpirationDateCantBeBeforeStartDate, NotFoundPillRoutine, NotFoundPillRoutineType, NotFoundProfile, UnauthorizedError } from "../errors/custom_errors";
import { v4 as uuidv4 } from "uuid"
import RoutineFactory from "../utils/routine_factory";
import validateToken from "../utils/authorization_validator";

export default class PillRoutineController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async createPillRoutine(accountKey: string, profileKey: string,
        {
            pillRoutineType,
            name,
            pillRoutineData,
            startDatetime: startDatetimeStr,
            expirationDatetime: expirationDatetimeStr
        }: FromSchema<typeof createPillRoutineSchema.body>,
        authorization: string
    ): Promise<PillRoutine> {
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

        const startDatetime = startDatetimeStr ? new Date(startDatetimeStr) : new Date();
        if(startDatetimeStr && startDatetime.getTime() < (new Date()).getTime()){
            throw new CantCreateRoutineStartingOnThePast();
        }
        const expirationDatetime = expirationDatetimeStr ? new Date(expirationDatetimeStr) : undefined;
        if(expirationDatetime && (expirationDatetime.getTime() < startDatetime.getTime())){
            throw new ExpirationDateCantBeBeforeStartDate();
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
        })

        if (!profile){
            throw new NotFoundProfile(accountKey, profileKey);
        }

        const pillRoutineTypeModel = await this.transaction.manager.findOne(PillRoutineType, {
            where: {
                enumerator: pillRoutineType
            }
        });

        if (!pillRoutineTypeModel){
            throw new NotFoundPillRoutineType(pillRoutineType);
        }

        const routine = RoutineFactory.createRoutine(pillRoutineType);

        if(!routine){
            throw Error("This Routine was not implemented yet");
        }

        routine.validateRoutineData(pillRoutineData)

        const newStatus = await this.transaction.manager.findOneOrFail(PillRoutineStatus, {
            where: {
                enumerator: "active"
            }
        });

        const pillRoutine = new PillRoutine();
        pillRoutine.startDatetime = startDatetime;
        if(expirationDatetime){
            pillRoutine.expirationDatetime = expirationDatetime;
        }
        pillRoutine.pillRoutineKey = uuidv4();
        pillRoutine.pillRoutineData = pillRoutineData;
        pillRoutine.name = name;
        pillRoutine.pillRoutineType = pillRoutineTypeModel;
        pillRoutine.status = newStatus;
        pillRoutine.profile = profile;

        const pillRoutineStatusEvent = new PillRoutineStatusEvent();
        pillRoutineStatusEvent.status = newStatus;
        pillRoutineStatusEvent.eventDatetime = new Date();

        pillRoutine.statusEvents = [pillRoutineStatusEvent];

        await this.transaction.manager.save(pillRoutine);

        return pillRoutine;
    }

    public async getPillRoutineModifiedPills(accountKey: string, profileKey: string, pillRoutineKey: string, authorization: string){
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

        const pillRoutine = await this.transaction.manager.findOne(PillRoutine, {
            where: {
                pillRoutineKey: pillRoutineKey,
                profile: {
                    profileKey: profileKey,
                    account: {
                        accountKey: accountKey
                    }
                }
            }
        });

        if(!pillRoutine){
            throw new NotFoundPillRoutine();
        };

        const modifiedPills = await this.transaction.manager.find(ModifiedPill, {
            where: {
                pillRoutine: pillRoutine
            }
        });

        return modifiedPills;
    }

    public async updatePillRoutine(accountKey: string, profileKey: string, pillRoutineKey: string,
        {
            pillRoutineType: routineTypeEnum,
            pillRoutineData,
            startDatetime: startDatetimeStr,
            expirationDatetime: expirationDatetimeStr
        }: FromSchema<typeof updatePillRoutineSchema.body>,
        authorization: string
    ): Promise<PillRoutine> {
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

        const pillRoutine = await this.transaction.manager.findOne(PillRoutine, {
            where: {
                profile: {
                    profileKey: profileKey,
                    account: {
                        accountKey: accountKey
                    }
                }
            },
            relations: {
                profile: true
            }
        })

        if (!pillRoutine){
            throw new NotFoundPillRoutine();
        }

        let pillRoutineType = pillRoutine.pillRoutineType;
        if(routineTypeEnum){
            const sentType = await this.transaction.manager.findOne(PillRoutineType, {
                where: {
                    enumerator: routineTypeEnum
                }
            })
            if(!sentType){
                throw new NotFoundPillRoutineType(routineTypeEnum);
            }

            pillRoutineType = sentType;
        }

        let startDatetime = startDatetimeStr ? new Date(startDatetimeStr) : new Date();
        let expirationDatetime = expirationDatetimeStr ? new Date(expirationDatetimeStr) : pillRoutine.expirationDatetime;

        if(startDatetimeStr && startDatetime.getTime() < (new Date()).getTime()){
            throw new CantCreateRoutineStartingOnThePast();
        }
        if(expirationDatetime && (expirationDatetime.getTime() < startDatetime.getTime())){
            throw new ExpirationDateCantBeBeforeStartDate();
        }

        if(!pillRoutineData){
            pillRoutineData = pillRoutine.pillRoutineData;
        }

        const routine = RoutineFactory.createRoutine(pillRoutineType.enumerator);
        routine.validateRoutineData(pillRoutineData);

        const newRoutineStatus = await this.transaction.manager.findOneOrFail(PillRoutineStatus, {
            where: {
                enumerator: "active"
            }
        })
        const updatedRoutineStatus = await this.transaction.manager.findOneOrFail(PillRoutineStatus, {
            where: {
                enumerator: "updated"
            }
        })
        pillRoutine.status = updatedRoutineStatus;
        const updatedStatusEvent = new PillRoutineStatusEvent();
        updatedStatusEvent.pillRoutine = pillRoutine;
        updatedStatusEvent.status = updatedRoutineStatus;
        updatedStatusEvent.eventDatetime = new Date();

        pillRoutine.statusEvents.push(updatedStatusEvent);

        const newPillRoutine = new PillRoutine();
        newPillRoutine.name = pillRoutine.name;
        newPillRoutine.pillRoutineData = pillRoutineData;
        newPillRoutine.pillRoutineKey = uuidv4();
        newPillRoutine.pillRoutineType = pillRoutineType;
        newPillRoutine.profile = pillRoutine.profile;
        newPillRoutine.startDatetime = startDatetime;
        newPillRoutine.expirationDatetime = expirationDatetime;
        newPillRoutine.status = newRoutineStatus;

        const newPillRoutineStatusEvent = new PillRoutineStatusEvent()
        newPillRoutineStatusEvent.pillRoutine = newPillRoutine;
        newPillRoutineStatusEvent.status = newRoutineStatus;
        newPillRoutineStatusEvent.eventDatetime = new Date();

        newPillRoutine.statusEvents = [newPillRoutineStatusEvent];

        const pillRoutineVersion = new PillRoutineVersion();
        pillRoutineVersion.originRoutine = pillRoutine;
        pillRoutineVersion.updatedRoutine = newPillRoutine;

        await this.transaction.manager.save([pillRoutine, newPillRoutine, pillRoutineVersion])

        return newPillRoutine;
    }

}
