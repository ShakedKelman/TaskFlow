import { StatusCode } from "./statusEnum";

export abstract class AppExcption {
    readonly message: string;
    readonly status: number;

    constructor(message: string, status: number) {
        this.message = message;
        this.status = status;
    }
}

export class ValidationError extends AppExcption {
    constructor(message: string) {
        super(message, StatusCode.BadRequest);
    }
}

export class NotDeletedError extends AppExcption {
    constructor(message: string) {
        super(message, StatusCode.IOerror);
    }
}

export class NotFoundError extends AppExcption {
    constructor(message: string) {
        super(message, StatusCode.NotFound);
    }
}

export class UnknownError extends AppExcption {
    constructor(message: string = "Unknown Error!", status = StatusCode.ServerError) {
        super(message, status)
    }
}

export class UnauthorizedError extends AppExcption {
    constructor(message: string){
        super(message, StatusCode.Unauthorized);
    }
}