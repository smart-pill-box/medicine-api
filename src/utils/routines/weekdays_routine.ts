import { SchemaError } from "../../errors/custom_errors";
import { Routine } from "./routine";
import Ajv from "ajv";

export class WeekdaysRoutine extends Routine{
    routineData: object
    routineDataSchema: object;

    constructor(routineData: object){
        super(routineData)

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