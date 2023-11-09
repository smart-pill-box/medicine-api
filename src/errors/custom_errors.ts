import CustomError from "./custom_error";
import { ErrorObject } from "ajv";

export class NotFoundAccount extends CustomError {
    constructor(accountKey: string){
        const code = "ERR00001";
        const description = `An account with key ${accountKey} was not found`;
        const statusCode = 404;
        super(code, description, statusCode)
    }
}

export class NotFoundProfile extends CustomError {
    constructor(accountKey: string, profileKey: string){
        const code = "ERR00002";
        const description = `The account ${accountKey} does not have a profile with key ${profileKey}`;
        const statusCode = 404;
        super(code, description, statusCode)
    }
}

export class NotFoundDevice extends CustomError {
    constructor(deviceKey: string){
        const code = "ERR00003";
        const description = `Not found device with key ${deviceKey}`;
        const statusCode = 404;
        super(code, description, statusCode)
    }
}

export class NotFoundPillRoutineType extends CustomError {
    constructor(pillRoutineTypeEnum: string){
        const code = "ERR00004";
        const description = `The pill routine type ${pillRoutineTypeEnum} does not exists`;
        const statusCode = 404;
        super(code, description, statusCode)
    }
}

export class WeekdaysPillRoutineNeedOneDay extends CustomError {
    constructor(){
        const code = "ERR00005";
        const description = "A weekday pill routine type needs at least one weekday";
        const statusCode = 400;
        super(code, description, statusCode)
    }
}

export class SchemaError extends CustomError {
    constructor(errors: ErrorObject[]){
        const code = "SCHEMA_ERR";
        const description = JSON.stringify(errors);
        const statusCode = 400;
        super(code, description, statusCode)
    }
}


