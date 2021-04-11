import {IShortGenre} from "./genre.interfaces";
import {IShortAuthor} from "./author.interfaces";

export interface INewBook {
    title: string;
    description: string;
    authorId: string;
    genreId: string
}

export interface IUpdateBook {
    title: string;
    description: string;
    authorId: string;
    genreId: string
}

export interface IShortBook {
    _id: string;
    title: string;
    description: string;
    img?: string | null;
    genre: IShortGenre;
    author: IShortAuthor
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
