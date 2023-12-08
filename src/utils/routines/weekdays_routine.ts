import { addDays, differenceInDays, isEqual } from "date-fns";
import { SchemaError, WeekdaysPillRoutineNeedOneDay } from "../../errors/custom_errors";
import { PillRoutine } from "../../models";
import DateUtils from "../date_utils";
import { Routine } from "./routine";
import Ajv from "ajv";
import { Pill } from "../../concepts/pill";

const dayNumberToString: {[key: number]: string} = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
}

export class WeekdaysRoutine extends Routine{
    routineDataSchema: object;

    constructor(){
        super()

        this.routineDataSchema = {
            type: "object",
            properties: {
                monday: {
                    type: "array",
                    items: {
                        type: "string",
                        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                    },
                    minItems: 1
                },
                tuesday: {
                    type: "array",
                    items: {
                        type: "string",
                        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                    },
                    minItems: 1
                },
                wednesday: {
                    type: "array",
                    items: {
                        type: "string",
                        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                    },
                    minItems: 1
                },
                thursday: {
                    type: "array",
                    items: {
                        type: "string",
                        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                    },
                    minItems: 1
                },
                friday: {
                    type: "array",
                    items: {
                        type: "string",
                        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                    },
                    minItems: 1
                },
                saturday: {
                    type: "array",
                    items: {
                        type: "string",
                        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                    },
                    minItems: 1
                },
                sunday: {
                    type: "array",
                    items: {
                        type: "string",
                        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                    },
                    minItems: 1
                }
            },
            additionalProperties: false
        };
    }

    public validateRoutineData(routineData: object): void {
        const ajv = new Ajv();

        const validator = ajv.compile(this.routineDataSchema);

        if (!validator(routineData)){
            if(!validator.errors){
                throw new Error();
            }
            throw new SchemaError(validator.errors)
        }

        if(Object.keys(routineData).length == 0){
            throw new WeekdaysPillRoutineNeedOneDay();
        }
    }

    public getQuantityOfPillsByDatetime(pillDatetime: Date, { pillRoutineData, startDate }: PillRoutine){
        const dayString = DateUtils.dayNumberToString(pillDatetime.getDay());
        const pillTimesStrings: string[]|undefined = pillRoutineData[dayString]

        if(!pillTimesStrings){
            return 0;
        }

        const sentPillTimeString = DateUtils.getHourString(pillDatetime);

        let quantity = 0;
        pillTimesStrings.forEach(((pillTimeString: string)=>{
            if(pillTimeString == sentPillTimeString){
                quantity += 1;
            }
        }))

        return quantity;
    }

    public getPillsOrderedByDatetimeAsc(fromDate: Date, toDate: Date, pillRoutine: PillRoutine){
        const pills: Pill[] = []
        const { pillRoutineData, name } = pillRoutine;

        for(let dateIter = fromDate; differenceInDays(dateIter, toDate) <= 0; dateIter = addDays(dateIter, 1)){

            const dayString = DateUtils.dayNumberToString(dateIter.getUTCDay());

            const pillsTimeStrings: string[] = pillRoutineData[dayString];
    
            if(!pillsTimeStrings){
                continue
            }

            const pillsDatetimesSorted = pillsTimeStrings
                .map(timeString => DateUtils.sameDateOtherHour(dateIter, timeString))
                .sort((first, next)=> first.getTime()-next.getTime());

            let quantity = 1;
            pillsDatetimesSorted.forEach((pillDatetime, index)=>{
                if(isEqual(pillsDatetimesSorted[index+1], pillDatetime)){
                    quantity += 1;
                    return
                }

                const pill = new Pill(pillDatetime, name, pillRoutine, "pending", [], quantity);
                pills.push(pill);
                quantity = 1;
            })
        }

        return pills
    }
}