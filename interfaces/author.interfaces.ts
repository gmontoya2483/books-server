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


