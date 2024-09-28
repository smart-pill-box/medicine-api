import { isAfter, isEqual } from "date-fns";
import { ModifiedPill, ModifiedPillStatusEvent, PillRoutine } from "../models";
import DateUtils from "../utils/date_utils";

export type PillStatus = "pending" | "loaded" | "canceled" | "manualyConfirmed" | "pillBoxConfirmed" | "created" | "reeschaduled"; 

export class Pill {
    status: PillStatus;
    statusEvents: ModifiedPillStatusEvent[];
    pillDatetime: Date;
    reeschaduledTo?: Pill;
    pillRoutineKey: string;
    pillRoutineId: number;
    index: number;
    name: string;

    constructor (pillDatetime: Date, name: string, pillRoutine: PillRoutine, status: PillStatus, statusEvents: ModifiedPillStatusEvent[], index: number, reeschaduledTo?: Pill){
        this.status = status;
        this.statusEvents = statusEvents;
        this.pillDatetime = pillDatetime;
        this.pillRoutineKey = pillRoutine.pillRoutineKey;
        this.pillRoutineId = pillRoutine.id;
        this.index = index;
        this.name = name;
    }

    static fromModifiedPill(modifiedPill: ModifiedPill): Pill{
        const pill = new Pill(
            modifiedPill.pillDatetime, 
            modifiedPill.pillRoutine.name,
            modifiedPill.pillRoutine,
            modifiedPill.status.enumerator,
            modifiedPill.statusEvents,
            modifiedPill.index
        );

        return pill;
    }

		static parsePillString(pillString: string): {
			pillDatetimeStr: string,
			pillIndex: number
		} | undefined {
			const splited = pillString.split("I");
			let datetime = splited.at(0);
			let index = splited.at(1);

			if(!datetime || !index){
				return undefined;
			}

			if(!DateUtils.isDateStringValid(datetime)){
				return undefined;
			}

			return {
				pillDatetimeStr: datetime,
				pillIndex: parseInt(index)
			}
		}

    public isGreaterThen(otherPill: Pill){
        if(this.pillRoutineId > otherPill.pillRoutineId){
            return true
        }
        else if(this.pillRoutineId < otherPill.pillRoutineId){
            return false
        }

		if(this.pillDatetime.getTime() == otherPill.pillDatetime.getTime()){
			if(this.index > otherPill.index){
				return true;
			} else {
				return false;
			}
		}

        return isAfter(this.pillDatetime, otherPill.pillDatetime);
    }

    public isGreaterOrEqual(otherPill: Pill){
		if(this.isEqual(otherPill)){
			return true;
		}

		return this.isGreaterThen(otherPill);
    }

    public isEqual(otherPill: Pill){
        return (
            this.pillRoutineId == otherPill.pillRoutineId 
            && this.pillRoutineKey == otherPill.pillRoutineKey
            && isEqual(this.pillDatetime, otherPill.pillDatetime)
			&& this.index == otherPill.index
        )
    }
}
