import { QueryRunner } from "typeorm";
import { FromSchema } from "json-schema-to-ts";
import { ModifiedPill, ModifiedPillStatus, ModifiedPillStatusEvent, PillReeschadule, PillRoutine } from "../models";
import { DontHaveAPillInThatTime, DuplicatedPill, InvalidPillStatusForReeschadule, InvalidStatusForPillUpdate, InvalidTimestampString, NotFoundModifiedPillStatus, NotFoundPill, NotFoundPillReeschadule, NotFoundPillRoutine, NotFoundPillRoutineType, NotFoundProfile, UnauthorizedError } from "../errors/custom_errors";
import RoutineFactory from "../utils/routine_factory";
import validateToken from "../utils/authorization_validator";
import { updatePillStatusSchema, createResschadulePillSchema } from '../schemas/pill_schemas';
import { PillStatus } from "../concepts/pill";
import DateUtils from "../utils/date_utils";

export default class PillController {
    transaction: QueryRunner;

    constructor(transaction: QueryRunner){
        this.transaction = transaction;
    }

    public async updatePillStatus(accountKey: string, profileKey: string, pillRoutineKey: string, pillDatetimeStr: string, {
        status
    }: FromSchema<typeof updatePillStatusSchema.body>, authorization: string){
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
                enumerator: status as PillStatus
            }
        });
        if(!modifiedPillStatus){
            throw new NotFoundModifiedPillStatus(status);
        }

        const validStatuses = ["canceled", "manualyConfirmed"]
        if(!validStatuses.includes(status)){
            throw new InvalidStatusForPillUpdate(status);
        }

        if(!DateUtils.isDateStringValid(pillDatetimeStr)){
            throw new InvalidTimestampString(pillDatetimeStr);
        }
        const pillDatetime = new Date(pillDatetimeStr);

        
        let modifiedPill = await this.transaction.manager.findOne(ModifiedPill, {
            where: {
                pillDatetime: pillDatetime,
                pillRoutine: pillRoutine
            }
        })
        
        if(!modifiedPill){
            const routine = RoutineFactory.createRoutine(
                pillRoutine.pillRoutineType.enumerator
            );
            
            const quantity = routine.getQuantityOfPillsByDatetime(pillDatetime, pillRoutine)
    
            if (quantity == 0){
                throw new DontHaveAPillInThatTime(pillDatetimeStr);
            }

            modifiedPill = new ModifiedPill();
            modifiedPill.pillDatetime = pillDatetime;
            modifiedPill.quantity = quantity;
            modifiedPill.statusEvents = []
        }
        
        if(status == "manualyConfirmed" || status == "pillBoxConfirmed"){
            modifiedPill.confirmationDatetime = new Date();
        }
        
        modifiedPill.status = modifiedPillStatus;
        modifiedPill.pillRoutine = pillRoutine;

        const modifiedPillStatusEvent = new ModifiedPillStatusEvent();
        modifiedPillStatusEvent.status = modifiedPillStatus;
        modifiedPillStatusEvent.eventDatetime = new Date();
        
        modifiedPill.statusEvents.push(modifiedPillStatusEvent);

        await this.transaction.manager.save(modifiedPill);

        return modifiedPill;
    }

    public async reeschadulePill(accountKey: string, profileKey: string, pillRoutineKey: string, pillDatetimeStr: string, {
        newPillDatetime: newPillDatetimeStr
    }: FromSchema<typeof createResschadulePillSchema.body>, authorization: string){
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

        if(!DateUtils.isDateStringValid(pillDatetimeStr)){
            throw new InvalidTimestampString(pillDatetimeStr);
        }
        const pillDatetime = new Date(pillDatetimeStr);

        if(!DateUtils.isDateStringValid(newPillDatetimeStr)){
            throw new InvalidTimestampString(newPillDatetimeStr);
        }
        const newPillDatetime = new Date(newPillDatetimeStr);
        
        const routine = RoutineFactory.createRoutine(
            pillRoutine.pillRoutineType.enumerator
        );

        if(routine.getQuantityOfPillsByDatetime(newPillDatetime, pillRoutine) != 0){
            throw new DuplicatedPill(newPillDatetime.toISOString());
        }

        const duplicatedPill = await this.transaction.manager.findOne(ModifiedPill, {
            where: {
                pillDatetime: newPillDatetime,
                pillRoutine: pillRoutine
            }
        })
        if(duplicatedPill){
            throw new DuplicatedPill(newPillDatetime.toISOString());
        }

        let pillToReeschadule = await this.transaction.manager.findOne(ModifiedPill, {
            where: {
                pillRoutine: pillRoutine,
                pillDatetime: pillDatetime
            }
        });

        if(!pillToReeschadule){
            let quantity = routine.getQuantityOfPillsByDatetime(pillDatetime, pillRoutine)
    
            if (quantity == 0){
                throw new NotFoundPill(pillDatetimeStr);
            }

            pillToReeschadule = new ModifiedPill();
            pillToReeschadule.pillRoutine = pillRoutine;
            pillToReeschadule.quantity = quantity;
            pillToReeschadule.status = await this.transaction.manager.findOneOrFail(ModifiedPillStatus, {
                where: { enumerator: "created" }
            })
            pillToReeschadule.pillDatetime = pillDatetime;
            pillToReeschadule.statusEvents = [];
        }

        const notPermitedStatuses: PillStatus[] = ["canceled", "manualyConfirmed", "pillBoxConfirmed", "reeschaduled"]
        if(notPermitedStatuses.includes(pillToReeschadule.status.enumerator)){
            throw new InvalidPillStatusForReeschadule(pillToReeschadule.status.enumerator)
        }

        const reeschaduledStatus = await this.transaction.manager.findOneOrFail(ModifiedPillStatus, {
            where: { enumerator: "reeschaduled" }
        })
        pillToReeschadule.status = reeschaduledStatus;

        const statusEvent = new ModifiedPillStatusEvent();
        statusEvent.status = reeschaduledStatus;
        statusEvent.eventDatetime = new Date();
        pillToReeschadule.statusEvents.push(statusEvent);

        const pendingStatus = await this.transaction.manager.findOneOrFail(ModifiedPillStatus, {
            where: { enumerator: "pending" }
        })
        const newPill = new ModifiedPill();
        newPill.pillRoutine = pillRoutine;
        newPill.pillDatetime = newPillDatetime;
        newPill.status = pendingStatus;
        newPill.quantity = pillToReeschadule.quantity;

        const newPillStatusEvent = new ModifiedPillStatusEvent();
        newPillStatusEvent.eventDatetime = new Date();
        newPillStatusEvent.status = pendingStatus;
        newPill.statusEvents = [newPillStatusEvent];

        const pillReeschadule = new PillReeschadule();
        pillReeschadule.newPill = newPill;
        pillReeschadule.reeschaduledPill = pillToReeschadule;

        await this.transaction.manager.save([pillToReeschadule, newPill, pillReeschadule]);

        return pillReeschadule;
    }

    public async getPillReeschadule(accountKey: string, profileKey: string, pillRoutineKey: string, pillDatetimeStr: string, authorization: string){
        const token = await validateToken(authorization);
        if (token.sub! != accountKey){
            throw new UnauthorizedError()
        }

        if(!DateUtils.isDateStringValid(pillDatetimeStr)){
            throw new InvalidTimestampString(pillDatetimeStr);
        }
        const pillDatetime = new Date(pillDatetimeStr);

        const modifiedPill = await this.transaction.manager.findOne(ModifiedPill, {
            where: {
                pillDatetime: pillDatetime,
                pillRoutine: {
                    pillRoutineKey: pillRoutineKey,
                    profile: {
                        profileKey: profileKey,
                        account: {
                            accountKey: accountKey
                        }
                    }
                }
            }
        })

        if(!modifiedPill){
            throw new NotFoundPill(pillDatetimeStr);
        }

        const pillReeschadule = await this.transaction.manager.findOne(PillReeschadule, {
            where: {
                reeschaduledPill: modifiedPill
            }
        });

        if(!pillReeschadule){
            throw new NotFoundPillReeschadule();
        }

        return pillReeschadule;
    }
}
