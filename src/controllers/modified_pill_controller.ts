import { QueryRunner } from "typeorm";
import { FromSchema } from "json-schema-to-ts";
import { createPillRoutineSchema } from "../schemas/pill_routine_schemas";
import { ModifiedPill, ModifiedPillStatus, ModifiedPillStatusEvent, PillRoutine, PillRoutineStatus, PillRoutineStatusEvent, PillRoutineType, Profile } from "../models";
import { DontHaveAPillInThatTime, InvalidTimestampString, NotFoundModifiedPillStatus, NotFoundPillRoutine, NotFoundPillRoutineType, NotFoundProfile, UnauthorizedError } from "../errors/custom_errors";
import { v4 as uuidv4 } from "uuid"
import RoutineFactory from "../utils/routine_factory";
import validateToken from "../utils/authorization_validator";
import { createModifiedPillSchema } from "../schemas/modified_pill_schemas";
import DateUtils from "../utils/date_utils";

export default class ModifiedPillController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async createModifiedPill(accountKey: string, profileKey: string, pillRoutineKey: string,
        {
            status,
            pillDatetime: pillDatetimeStr
        }: FromSchema<typeof createModifiedPillSchema.body>,
        authorization: string
    ){
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
        }

        const modifiedPillStatus = await this.transaction.manager.findOne(ModifiedPillStatus, {
            where: {
                enumerator: status
            }
        });
        if(!modifiedPillStatus){
            throw new NotFoundModifiedPillStatus(status);
        }

        if(!DateUtils.isDateStringValid(pillDatetimeStr)){
            throw new InvalidTimestampString(pillDatetimeStr);
        }
        const pillDatetime = new Date(pillDatetimeStr);

        const routine = RoutineFactory.createRoutine(
            pillRoutine.pillRoutineType.enumerator
        );
        const quantity = routine.getQuantityOfPillsByDatetime(pillDatetime, pillRoutine)

        if (quantity == 0){
            throw new DontHaveAPillInThatTime(pillDatetimeStr);
        }

        const modifiedPill = new ModifiedPill();
        modifiedPill.pillDatetime = pillDatetime;
        modifiedPill.quantity = quantity;
        modifiedPill.status = modifiedPillStatus;
        
        if(status == "manualConfirmed" || status == "pillBoxConfirmed"){
            modifiedPill.confirmationDatetime = new Date();
        }

        modifiedPill.pillRoutine = pillRoutine;

        const modifiedPillStatusEvent = new ModifiedPillStatusEvent();
        modifiedPillStatusEvent.status = modifiedPillStatus;
        modifiedPillStatusEvent.eventDatetime = new Date();
        
        modifiedPill.statusEvents = [modifiedPillStatusEvent];

        await this.transaction.manager.save(modifiedPill);

        return modifiedPill;

        // TODO implementar reeschadule
    }
}
