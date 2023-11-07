import CustomError from "./custom_error";

export class NotFoundAccount extends CustomError {
    constructor(accountKey: string){
        const code = "ERR00001";
        const description = `An account with key ${accountKey} was not found`;
        const statusCode = 404;
        super(code, description, statusCode)
    }
}