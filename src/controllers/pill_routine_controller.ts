import { QueryRunner } from "typeorm";
import { FromSchema } from "json-schema-to-ts";
import { createPillRoutineSchema } from "../schemas/pill_routine_schemas";
import { PillRoutine, PillRoutineStatus, PillRoutineStatusEvent, PillRoutineType, Profile } from "../models";
import { NotFoundPillRoutineType, NotFoundProfile } from "../errors/custom_errors";
import { v4 as uuidv4 } from "uuid"
import RoutineFactory from "../utils/routine_factory";

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
        }: FromSchema<typeof createPillRoutineSchema.body>
    ){
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

        const routine = RoutineFactory.createRoutine(pillRoutineType, pillRoutineData);

        if(!routine){
            throw Error("This Routine was not implemented yet");
        }

        routine.validateRoutineData()

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
        pillRoutine.type = pillRoutineTypeModel;
        pillRoutine.status = newStatus;

        const pillRoutineStatusEvent = new PillRoutineStatusEvent();
        pillRoutineStatusEvent.status = newStatus;

        pillRoutine.statusEvents = [pillRoutineStatusEvent];

        this.transaction.manager.save(pillRoutine);
    }
}
