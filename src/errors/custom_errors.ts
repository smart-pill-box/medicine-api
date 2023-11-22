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