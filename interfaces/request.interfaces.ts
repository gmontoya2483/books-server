import { Request } from "express";

export interface RequestWithUser extends Request {
    user: {
        _id: string,
        nombre: string,
        apellido: string,
        email: string,
        isValidated: {
            value: boolean,
            validatedDateTime: Date | null
        },
        isAdmin: boolean,
        img: string,
        paisResidencia: {
            _id: string,
            name: string
        },
        comunidad: {
            _id: string,
            name: string
        }

    }

}
