import {IShortAuthor} from "./author.interfaces";
import {IShortGenre} from "./genre.interfaces";

export interface INewCopy {
    bookId: string;
}


export interface ICriteria {
    userId?: string | null,
    communityId?: string | null
}

export interface IUpdateCopies {
    title: string;
    description: string;
    author: IShortAuthor;
    genre: IShortGenre;
}

export interface IUpdateCopiesOutput {
    ok: boolean;
    totalCopiesToUpdate: number;
    totalUpdatedCopies: number;
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
