export interface INewBook {
    title: string;
    description: string;
    authorId: string;
    genreId: string
}

export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        book?: {};
        total?: number;
        books?: {
            pagination?: {},
            books?: {}[]
        };
        copies?: {}[];
    }
}
