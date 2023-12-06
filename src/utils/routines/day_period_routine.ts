import { differenceInDays } from "date-fns";
import { SchemaError } from "../../errors/custom_errors";
import { PillRoutine } from "../../models";
import DateUtils from "../date_utils";
import { Routine } from "./routine";
import Ajv from "ajv";

export class DayPeriodRoutine extends Routine{
    routineDataSchema: object;

    constructor(){
        super()

        this.routineDataSchema = {
            type: "object",
            properties: {
                periodInDays: {
                    type: "integer",
                    minimum: 0
                },
                pillsTimes: {
                    type: "array",
                    items: {
                        type: "string",
                        pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
                    },
                    minItems: 1
                }
            },
            required: [
                "periodInDays",
                "pillsTimes"
            ],
            additionalProperties: false
        };
    }

    validateRoutineData(routineData: any): void {
        const ajv = new Ajv();

        const validator = ajv.compile(this.routineDataSchema);

        if (!validator(routineData)){
            if(!validator.errors){
                throw new Error();
            }
            throw new SchemaError(validator.errors)
        }
    }

    getQuantityOfPillsByDatetime(pillDatetime: Date, { pillRoutineData, startDate: startDateString }: PillRoutine){
        const startDate = DateUtils.dateStringToDate(startDateString);

        const dayDifference = differenceInDays(startDate, pillDatetime);

        console.log(startDate.toISOString());
        console.log(pillDatetime.toISOString());
        console.log(pillDatetime.getHours());
        console.log(pillDatetime.getMinutes());
        console.log(pillDatetime.getTimezoneOffset());
        console.log("Day diff is ", dayDifference);

        if (dayDifference % pillRoutineData.periodInDays != 0){
            return 0;
        }

        const sentPillTimeString = DateUtils.getHourString(pillDatetime);
        console.log("sent string is " + sentPillTimeString);

        let quantity = 0;
        pillRoutineData.pillsTimes.forEach(((pillTimeString: string)=>{
            console.log()
            if(pillTimeString == sentPillTimeString){
                quantity += 1;
            }
        }))

        return quantity;
    }
}