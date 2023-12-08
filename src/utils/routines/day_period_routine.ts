import { addDays, differenceInDays, isBefore, isEqual } from "date-fns";
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

    getQuantityOfPillsByDatetime(pillDatetime: Date, { pillRoutineData, startDate: startDateString }: PillRoutine){
        const startDate = DateUtils.dateStringToDate(startDateString);

        const dayDifference = differenceInDays(startDate, pillDatetime);

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

    public getPillsOrderedByDatetimeAsc(fromDate: Date, toDate: Date, pillRoutine: PillRoutine){
        const pills: Pill[] = [];

        const { pillRoutineData, name, startDate: startDateString } = pillRoutine;
        const { periodInDays, pillsTimes } = pillRoutineData;
        const startDate = DateUtils.dateStringToDate(startDateString)

        let initialDate: Date;
        if (fromDate.getTime() - startDate.getTime() > 0){
            const daysUntilNextPill = differenceInDays(startDate, fromDate) % periodInDays;

            initialDate = addDays(fromDate, daysUntilNextPill);
        }
        else {
            initialDate = startDate;
        }

        console.log("Initial date is ", initialDate.toISOString());

        for(let dateIter = initialDate; differenceInDays(dateIter, toDate) <= 0; dateIter = addDays(dateIter, periodInDays)){
            console.log("Iter: " + dateIter.toISOString());
            console.log("To Date: " + toDate.toISOString());

            const pillsDatetimesSorted: Date[] = pillsTimes
                .map((timeString: string) => DateUtils.sameDateOtherHour(dateIter, timeString))
                .sort((first: Date, next: Date)=> first.getTime()-next.getTime());

            let quantity = 1;
            console.log("Pills datetimes ", pillsDatetimesSorted);
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

        return pills;
    }
}