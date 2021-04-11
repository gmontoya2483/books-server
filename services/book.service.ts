import {INewBook, IServiceResponse, IUpdateBook} from "../interfaces/book.interfaces";
import {Book} from "../models/book.model";
import {AuthorService} from "./author.service";
import {GenreService} from "./genre.service";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Author} from "../models/author.model";
import {Pagination} from "../classes/pagination.class";

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

    public static async getAllBooks(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
        , showDeleted: boolean = false): Promise<IServiceResponse> {

        // Generat criterio de búsqueda
        let criteria = {};
        if(search){
            criteria = {
                ...criteria,
                $or: [
                    {title: {$regex:  `.*${search}.*`, $options:'i'}},
                    {'author.name': {$regex: `.*${search}.*`, $options:'i'}},
                    {'author.lastName': {$regex: `.*${search}.*`, $options:'i'}},
                    {'genre.name': {$regex: `.*${search}.*`, $options:'i'}}
                ]
            }
        }

        // Verificar si se muestran los marcados como borrados
        if (!showDeleted){
            criteria = {
                ... criteria,
                'isDeleted.value': false
            }
        }

        const totalBooks = await Book.countDocuments(criteria);
        const pagination = await new Pagination(totalBooks,pageNumber, pageSize).getPagination();
        // Actualiza page number de acuerdo a la paginación
        const currentPageNumber = pagination.currentPage;

        const books = await Book.find(criteria)
            .skip((currentPageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort('title').select({ password: 0});


        return {
            status: 200,
            response: {
                ok: true,
                books: {
                    pagination: pagination,
                    books
                }
            }
        };
    }

    public static async getSingleBook( bookId: string): Promise<IServiceResponse> {
        const book = await Book.findById(bookId);
        if(!book) return this.notFoundBookMessage();

        return {
            status: 200,
            response: {
                ok: true,
                book
            }
        }
    }

    public static async updateBook (bookId: string, { title, description, authorId, genreId }: IUpdateBook): Promise<IServiceResponse> {
        //TODO: Agregar transaccion para modificar los  ejemplares

        // Verifica si el nuevo titulo ya existe
        const duplicateBook = await Book.findOne({
            'title': {$regex:  `${title}`, $options:'i'},
            '_id': { $ne: bookId}
        });
        if (duplicateBook) return this.BadRequestBookMessage(`El libro ${ title } ya existe`);

        // Verifica y Obtiene la información del autor
        const author: any = await AuthorService.findAuthor(authorId);
        if (!author) return this.BadRequestBookMessage(`Autor no encontrado`);

        // Verifica y Obtiene el Género
        const genre: any = await GenreService.findGenre(genreId);
        if ( !genre ) return this.BadRequestBookMessage(`Genero no encontrado`)

        const book = await Book.findByIdAndUpdate(
            bookId,
            {
                title,
                description,
                author,
                genre,
                dateTimeUpdated: Date.now()
            }, {new: true});

        if(!book) return this.notFoundBookMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El libro ha sido modificado`,
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
