export interface INewGenre {
    name: string;
}

export interface IUpdateGenre {
    name: string;
}

export interface IShortGenre {
    _id: string;
    name: string;
}


export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        genre?: {};
        total?: number;
        genres?: {}[];
    }
}
