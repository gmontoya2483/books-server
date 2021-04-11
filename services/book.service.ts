import {INewBook, IServiceResponse} from "../interfaces/book.interfaces";
import {Book} from "../models/book.model";
import {AuthorService} from "./author.service";
import {GenreService} from "./genre.service";

export abstract class BookService {

    public static async newBook ({title, description, authorId, genreId }: INewBook): Promise<IServiceResponse>{

        title = title.trim();
        description = description.trim();

        // Verifica si el libro ya existe
        const duplicateBook = await Book.findOne({
            'title': {$regex:  `${title}`, $options:'i'}
        });
        if (duplicateBook) return this.BadRequestBookMessage(`El libro ${ title } ya existe`);

        // Verifica y Obtiene la información del autor
        const author: any = await AuthorService.findAuthor(authorId);
        if (!author) return this.BadRequestBookMessage(`Autor no encontrado`);

        // Verifica y Obtiene el Género
        const genre: any = await GenreService.findGenre(genreId);
        if ( !genre ) return this.BadRequestBookMessage(`Genero no encontrado`)

        // Guardar el libro
        const book = new Book({title, description, author, genre});
        await book.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `El libro ${ title } ha sido agregado`,
                book
            }
        }
    }






    private static hasCopy(bookId: string): Boolean {

        // TODO: agregar lógica para buscar un libro del autor devolver true si encuntra un libro,
        //  devolver false si es null

        return false;
    }



    private static notFoundBookMessage(mensaje: string = "Libro no encontrado"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    public static BadRequestBookMessage(mensaje: string = `El libro tiene Ejemplares asociados`): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }



}
