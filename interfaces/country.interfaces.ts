export interface INewCountry {
    name: string;
}

export interface IUpdateCountry{
    name: string;
}

export interface IDeleteCountry {
    isDeleted: boolean;
}

export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        country?: {};
        total?: number;
        countries?: {}[];
        communities?: {}[];
    }
}
