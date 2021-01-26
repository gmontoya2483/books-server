
export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        me?: {};
        token?: string;
    }
}

export interface IUpdateMe {
    nombre: string;
    apellido: string;
    paisResidenciaId: string;
}
