import { QueryRunner } from "typeorm";
import { FromSchema } from "json-schema-to-ts";
import { createPillRoutineSchema } from "../schemas/pill_routine_schemas";
import { ModifiedPill, PillRoutine, PillRoutineStatus, PillRoutineStatusEvent, PillRoutineType, Profile } from "../models";
import { NotFoundPillRoutine, NotFoundPillRoutineType, NotFoundProfile, UnauthorizedError } from "../errors/custom_errors";
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
            pillRoutineData
        }: FromSchema<typeof createPillRoutineSchema.body>,
        authorization: string
    ): Promise<PillRoutine> {
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
        pillRoutine.startDate = new Date().toISOString().split("T")[0];
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
}
