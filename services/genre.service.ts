import {INewGenre, IServiceResponse, IUpdateGenre} from "../interfaces/genre.interfaces";
import {Genre} from "../models/genre.model";

export abstract class GenreService {

    public static async newGenre ({name}: INewGenre): Promise<IServiceResponse>{
        const genre = new Genre({name});
        await genre.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `El género ${name} ha sido agregado`,
                genre
            }
        };
    }

    public static async getSingleGenre(genreId: string): Promise<IServiceResponse> {
        const genre = await Genre.findById(genreId);
        if (!genre) return this.notFoundGenreMessage();

        return {
            status: 200,
            response: {
                ok: true,
                genre
            }

        };

    }


    public static async getAllGenres(): Promise<IServiceResponse> {
        const genres = await Genre.find();
        const total = genres.length;
        return {
            status: 200,
            response: {
                ok: true,
                total,
                genres
            }
        };

    }

    public static async deleteGenre(genreId: string): Promise<IServiceResponse> {
        const genre: any = await Genre.findByIdAndDelete(genreId);

        if (!genre) return this.notFoundGenreMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El género ${ genre.name } ha sido eliminado`,
                genre
            }

        };

    }

    public static async updateGenre (genreId: string, {name}: IUpdateGenre): Promise<IServiceResponse>{
        const genre = await Genre.findByIdAndUpdate(genreId, {
            $set: {
                name,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if(!genre) return this.notFoundGenreMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El género  ha sido eliminado`,
                genre
            }

        };


    }


    private static notFoundGenreMessage(): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje: "Género no encontrado"
            }
        };
    }

}
