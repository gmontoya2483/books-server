export interface INewUser {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
}

export interface IValidateEmail {
    _id: string;
}

export interface IChangePasswordRequest {
    email: string;
}

export interface IChangePassword {
    password: string;
}

export interface IDeleteUser {
    isDeleted: boolean;
}

export interface IValidateUser {
    isValidated: boolean;
}

export interface IAdminUser {
    isAdmin: boolean;
}

export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        usuario?: {};
        total?: number;
        users?: {
            pagination?: {},
            users?: {}[]
        };
    }
}


