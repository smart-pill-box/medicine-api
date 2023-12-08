import { isEqual } from "date-fns";
import { ModifiedPill, ModifiedPillStatusEvent, PillRoutine } from "../models";

export type PillStatus = "pending" | "loaded" | "canceled" | "manualyConfirmed" | "pillBoxConfirmed"; 

export class Pill {
    status: PillStatus;
    statusEvents: ModifiedPillStatusEvent[];
    pillDatetime: Date;
    pillRoutineKey: string;
    pillRoutineId: number;
    quantity: number;
    name: string;

    constructor (pillDatetime: Date, name: string, pillRoutine: PillRoutine, status: PillStatus, statusEvents: ModifiedPillStatusEvent[], quantity: number){
        this.status = status;
        this.statusEvents = statusEvents;
        this.pillDatetime = pillDatetime;
        this.pillRoutineKey = pillRoutine.pillRoutineKey;
        this.pillRoutineId = pillRoutine.id;
        this.quantity = quantity
        this.name = name;
    }

    static fromModifiedPill(modifiedPill: ModifiedPill){
        const pill = new Pill(
            modifiedPill.pillDatetime, 
            modifiedPill.pillRoutine.name,
            modifiedPill.pillRoutine,
            modifiedPill.status.enumerator,
            modifiedPill.statusEvents,
            modifiedPill.quantity,
        );

        return pill;
    }

    public isGreaterThen(otherPill: Pill){
        if(this.pillRoutineId > otherPill.pillRoutineId){
            return true
        }
        else if(this.pillRoutineId < otherPill.pillRoutineId){
            return false
        }

        return this.pillDatetime > otherPill.pillDatetime;
    }

    public isGreaterOrEqual(otherPill: Pill){
        if(this.pillRoutineId >= otherPill.pillRoutineId){
            return true
        }
        else if(this.pillRoutineId < otherPill.pillRoutineId){
            return false
        }

        return this.pillDatetime >= otherPill.pillDatetime;
    }

    public isEqual(otherPill: Pill){
        return (
            this.pillRoutineId == otherPill.pillRoutineId 
            && this.pillRoutineKey == otherPill.pillRoutineKey
            && isEqual(this.pillDatetime, otherPill.pillDatetime)
        )
    }
}