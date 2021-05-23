export interface INewCopy {
    bookId: string;
}


export interface IServiceResponse {
    status: number;
    response : {
        ok: boolean;
        mensaje?: string;
        copy?: {};
        total?: number;
        copies?: {
            pagination?: {},
            copies?: {}[]
        };
    }
}
