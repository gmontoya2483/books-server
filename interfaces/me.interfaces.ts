
export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        me?: {};
        token?: string;
        community?: {};
        users?: {};
    }
}

export interface IUpdateMe {
    nombre: string;
    apellido: string;
    paisResidenciaId: string;
}

export interface ISetMyCommunity {
    comunidadId: string;
}
