import {INewGenre, IServiceResponse, IUpdateGenre} from "../interfaces/genre.interfaces";
import {Genre} from "../models/genre.model";
import {IDeleteAuthor} from "../interfaces/author.interfaces";
import {BookService} from "./book.service";

export abstract class GenreService {

    public static async newGenre ({name}: INewGenre): Promise<IServiceResponse>{
        name = name.trim().toUpperCase();
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

    public static async findGenre( genreId: string ) {
        return Genre.findById(genreId).select({_v: 0});
    }


    public static async getAllGenres(search: any= null, showDeleted: boolean = false): Promise<IServiceResponse> {

        // Generat criterio de búsqueda
        let criteria = {};
        if(search){
            criteria = {
                ...criteria,
                name: {$regex:  `.*${search}.*`, $options:'i'},
            }
        }

        // Verificar si se muestran los marcados como borrados
        if (!showDeleted){
            criteria = {
                ... criteria,
                'isDeleted.value': false
            }
        }

        const genres = await Genre.find(criteria).sort('name');
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

        if (await this.hasBooks(genreId)) return  this.BadRequestGenreMessage();

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


    public static async setDeleted (genreId: string, {isDeleted}: IDeleteAuthor): Promise<IServiceResponse>{

        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, deletedDateTime: null};

        const genre = await Genre.findByIdAndUpdate(genreId, {
            $set: {
                isDeleted: deleted,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if (!genre) return this.notFoundGenreMessage();

        const message = (isDeleted) ? `El género ha sido marcado como eliminado`
            : `El género ha sido desmarcado como eliminado`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                genre
            }

        };

    }



    public static async updateGenre (genreId: string, {name}: IUpdateGenre): Promise<IServiceResponse>{

        name = name.trim().toUpperCase();

        // TODO: TRSCL-156 - transaccion para modificar los libros y los ejemplares
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
                mensaje: `El género ha sido modificado`,
                genre
            }

        };


    }


    private static async hasBooks(genreId: string): Promise<boolean> {
        return await BookService.ExistsBooksByGenre(genreId);
    }

    private static notFoundGenreMessage(mensaje: string = "Género no encontrado"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    private static BadRequestGenreMessage(mensaje: string = `El género tiene libros asociados`): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }

}
