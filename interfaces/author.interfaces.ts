export interface INewAuthor {
    name: string;
    lastName: string;
}

export interface IUpdateAuthor {
    name: string;
    lastName: string;
}

export interface IDeleteAuthor {
    isDeleted: boolean;
}

export interface IShortAuthor {
    _id: string;
    name: string;
    lasName: string;
}

export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        author?: {};
        total?: number;
        authors?: {
            pagination?: {},
            authors?: {}[]
        };

        books?: {}[];
    }
}


