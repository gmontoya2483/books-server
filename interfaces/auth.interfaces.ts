export interface IAuthenticateUser{
    email: string;
    password: string;
}


export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        token?: string;
    }
}
