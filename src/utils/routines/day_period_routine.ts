import { SchemaError } from "../../errors/custom_errors";
import { Routine } from "./routine";
import Ajv from "ajv";

export class DayPeriodRoutine extends Routine{
    routineData: object
    routineDataSchema: object;

    constructor(routineData: object){
        super(routineData)

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

    validateRoutineData(): void {
        const ajv = new Ajv();

        const validator = ajv.compile(this.routineDataSchema);

        if (!validator(this.routineData)){
            if(!validator.errors){
                throw new Error();
            }
            throw new SchemaError(validator.errors)
        }
    }
}