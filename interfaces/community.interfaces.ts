export interface INewCommunity {
    name: string;
    countryId: string;
}

export interface IUpdateCommunity {
    name: string;
}

export interface IDeleteCommunity {
    isDeleted: boolean;
}

export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        community?: {};
        total?: number;
        communities?: {}[];
        users?: {
            pagination: {},
            users: {}[]
        }
    }
}
