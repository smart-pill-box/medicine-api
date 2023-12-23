import { Pill } from "../../concepts/pill";
import { PillRoutine } from "../../models";

export abstract class Routine {

    abstract routineDataSchema: object;
    abstract validateRoutineData(routineData: any): void;
    abstract getQuantityOfPillsByDatetime(pillDatetime: Date, pillRoutine: PillRoutine): number;
    abstract getPillsOrderedByDatetimeAsc(fromDate: Date, toDate: Date, pillRoutine: PillRoutine): Pill[];

    public isDatetimeInRoutineRange(pillRoutine: PillRoutine, datetime: Date){
        if(datetime.getTime() < pillRoutine.startDatetime.getTime()){
            return false;
        }

        if(pillRoutine.expirationDatetime && (datetime.getTime() > pillRoutine.expirationDatetime.getTime())){
            return false;
        }

        const canceledStatuses = ["updated", "canceled"];
        if(canceledStatuses.includes(pillRoutine.status.enumerator)){
            const routineStatus = pillRoutine.status.enumerator;
            for (let statusEvent of pillRoutine.statusEvents){
                if(statusEvent.status.enumerator == routineStatus){
                    if(statusEvent.eventDatetime.getTime() < datetime.getTime()){
                        return false;
                    }
                }
            }
        }

        return true;
    }
}