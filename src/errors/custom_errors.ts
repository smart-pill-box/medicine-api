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

export class UnauthorizedError extends CustomError {
    constructor(){
        const code = "UNAUTHORIZED";
        const description = "You are not authorized to access that endpoint"
        const statusCode = 401;
        super(code, description, statusCode)
    }
}

export class MalformatedToken extends CustomError {
    constructor(){
        const code = "JWT_ERROR";
        const description = "Your JWT Token is malformated"
        const statusCode = 401;
        super(code, description, statusCode)
    }
}

export class ExpiredTokenError extends CustomError {
    constructor(){
        const code = "EXPIRED_ERR";
        const description = "Your token is expired"
        const statusCode = 401;
        super(code, description, statusCode)
    }
}

export class TokenNotBeforeNBF extends CustomError {
    constructor(){
        const code = "NBF_ERR";
        const description = "Your token is not active yet"
        const statusCode = 401;
        super(code, description, statusCode)
    }
}

export class NotFoundModifiedPillStatus extends CustomError {
    constructor(status: string){
        const code = "ERR00006";
        const description = `The modified pill status ${status} does not exists`
        const statusCode = 404;
        super(code, description, statusCode)
    }
}

export class InvalidTimestampString extends CustomError {
    constructor(timestamp: string){
        const code = "ERR00007";
        const description = `The given timestamp ${timestamp} string is not valid or is not ISO `
        const statusCode = 400;
        super(code, description, statusCode)
    }
}

export class DontHaveAPillInThatTime extends CustomError {
    constructor(givenDatetime: string){
        const code = "ERR00008";
        const description = `The given pill datetime ${givenDatetime} is not a valid datetime for that pillRoutine, so is impossible to modify it`
        const statusCode = 400;
        super(code, description, statusCode)
    }
}

export class NotFoundPillRoutine extends CustomError {
    constructor(){
        const code = "ERR00009";
        const description = "Not found pill routine on that account and profile";
        const statusCode = 404;
        super(code, description, statusCode)
    }
}

export class InvalidStatusForPillUpdate extends CustomError {
    constructor(status: string){
        const code = "ERR00010";
        const description = `You can't manualy update the status of a pill to ${status}`;
        const statusCode = 400;
        super(code, description, statusCode)
    }
}

export class DuplicatedPill extends CustomError {
    constructor(pillDatetime: string){
        const code = "ERR00011";
        const description = `A pill in the datetime ${pillDatetime} already exists`;
        const statusCode = 408;
        super(code, description, statusCode)
    }
}

export class NotFoundPill extends CustomError {
    constructor(pillDatetime: string){
        const code = "ERR00012";
        const description = `A pill in the time ${pillDatetime} was not found`
        const statusCode = 404;
        super(code, description, statusCode)
    }
}

export class InvalidPillStatusForReeschadule extends CustomError {
    constructor(pillStatus: string){
        const code = "ERR00013";
        const description = `You can't reeschadule a pill with status ${pillStatus}`
        const statusCode = 400;
        super(code, description, statusCode)
    }
}

export class NotFoundPillReeschadule extends CustomError {
    constructor(){
        const code = "ERR00014";
        const description = "The selected pill was never reeschaduled"
        const statusCode = 404;
        super(code, description, statusCode)
    }
}