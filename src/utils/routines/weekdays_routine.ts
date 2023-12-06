import { SchemaError, WeekdaysPillRoutineNeedOneDay } from "../../errors/custom_errors";
import { PillRoutine } from "../../models";
import DateUtils from "../date_utils";
import { Routine } from "./routine";
import Ajv from "ajv";

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

    validateRoutineData(routineData: object): void {
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

    getQuantityOfPillsByDatetime(pillDatetime: Date, { pillRoutineData, startDate }: PillRoutine){
        const pillTimesStrings: string[]|undefined = pillRoutineData[dayNumberToString[pillDatetime.getDay()]]

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
}