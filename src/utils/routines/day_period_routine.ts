import { addDays, differenceInDays, isAfter, isBefore, isEqual } from "date-fns";
import { SchemaError } from "../../errors/custom_errors";
import { PillRoutine } from "../../models";
import DateUtils from "../date_utils";
import { Routine } from "./routine";
import Ajv from "ajv";
import { Pill } from "../../concepts/pill";

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

    getQuantityOfPillsByDatetime(pillDatetime: Date, pillRoutine: PillRoutine){
        const { pillRoutineData, startDatetime, expirationDatetime, status, statusEvents } = pillRoutine;
        const dayDifference = differenceInDays(startDatetime, pillDatetime);
        if(dayDifference % pillRoutineData.periodInDays != 0){
            return 0;
        }

        if(!this.isDatetimeInRoutineRange(pillRoutine, pillDatetime)){
            return 0;
        }

        const sentPillTimeString = DateUtils.getHourString(pillDatetime);
        console.log("sent string is " + sentPillTimeString);

        let quantity = 0;
        pillRoutineData.pillsTimes.forEach(((pillTimeString: string)=>{
            if(pillTimeString == sentPillTimeString){
                quantity += 1;
            }
        }))

        return quantity;
    }

    public getPillsOrderedByDatetimeAsc(fromDate: Date, toDate: Date, pillRoutine: PillRoutine){
        const pills: Pill[] = [];

        const { pillRoutineData, name, startDatetime } = pillRoutine;
        const { periodInDays, pillsTimes } = pillRoutineData;

        let initialDate: Date;
        if (isAfter(fromDate, startDatetime)){
            const daysUntilNextPill = differenceInDays(startDatetime, fromDate) % periodInDays;

            initialDate = addDays(fromDate, daysUntilNextPill);
        }
        else {
            initialDate = new Date(startDatetime);
            initialDate.setUTCHours(0, 0, 0, 0);
        }
        console.log("Start datetime is ", startDatetime.toISOString());
        console.log("From date is ", fromDate.toISOString());

        console.log("Initial date is ", initialDate.toISOString());

        for(let dateIter = initialDate; differenceInDays(dateIter, toDate) <= 0; dateIter = addDays(dateIter, periodInDays)){
            if(!this.isDatetimeInRoutineRange(pillRoutine, dateIter)){
                continue
            }

            const pillsDatetimesSorted: Date[] = pillsTimes
                .map((timeString: string) => DateUtils.sameDateOtherHour(dateIter, timeString))
                .sort((first: Date, next: Date)=> first.getTime()-next.getTime());

            let quantity = 1;
            console.log("Pills datetimes ", pillsDatetimesSorted);
            pillsDatetimesSorted.forEach((pillDatetime, index)=>{
                if(!this.isDatetimeInRoutineRange(pillRoutine, pillDatetime)){
                    return
                }
                if(isEqual(pillsDatetimesSorted[index+1], pillDatetime)){
                    quantity += 1;
                    return
                }

                const pill = new Pill(pillDatetime, name, pillRoutine, "pending", [], quantity);
                pills.push(pill);
                quantity = 1;
            })
        }

        return pills;
    }
}