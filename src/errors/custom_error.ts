type CustomErrorResponse = {
    description: string;
    code: string;
};

export default class CustomError extends Error {
    code: string;
    description: string;
    statusCode: number;

    constructor(code: string, description: string, statusCode: number){
        super(description);
        this.code = code;
        this.description = description;
        this.statusCode = statusCode;
    }

    public getResponse (): CustomErrorResponse {
        return {
            description: this.description,
            code: this.code
        }
    };

    public getStatusCode (): number {
        return this.statusCode
    };
}