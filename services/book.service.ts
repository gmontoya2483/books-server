import {INewBook, IServiceResponse, IUpdateBook} from "../interfaces/book.interfaces";
import {Book} from "../models/book.model";
import {AuthorService} from "./author.service";
import {GenreService} from "./genre.service";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Pagination} from "../classes/pagination.class";
import {IDeleteAuthor} from "../interfaces/author.interfaces";

export abstract class BookService {

    public static async newBook ({title, description, authorId, genreId }: INewBook): Promise<IServiceResponse>{

        title = title.trim().toUpperCase();
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
            .sort({title: 1});


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

    public static async findBook( bookId: string) {
        const book = await Book.findById(bookId);
        return book;
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
        //TODO: TRSCL-154 - Agregar transaccion para modificar los  ejemplares

        title = title.trim().toUpperCase();
        description = description.trim();

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


    public static async deleteBook( bookId: string): Promise<IServiceResponse> {
        if(this.hasCopies(bookId)) return this.BadRequestBookMessage();

        const book: any = await Book.findByIdAndDelete(bookId);
        if(!book) return this.notFoundBookMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El libro ${ book.title } ha sido eliminado`,
                book
            }
        };
    }

    public static async setDeleted (bookId: string, {isDeleted}: IDeleteAuthor): Promise<IServiceResponse>{

        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, deletedDateTime: null};

        const book = await Book.findByIdAndUpdate(bookId, {
            $set: {
                isDeleted: deleted,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if (!book) return this.notFoundBookMessage();

        const message = (isDeleted) ? `El libro ha sido marcado como eliminado`
            : `El libro ha sido desmarcado como eliminado`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                book
            }

        };

    }


    private static hasCopies(bookId: string): Boolean {

        // TODO: TRSCL-155 - Agregar lógica para buscar una Copia del libro. Devolver true si encuntra un libro,
        //  devolver false si es null

        return false;
    }

    public static notFoundBookMessage(mensaje: string = "Libro no encontrado"): IServiceResponse {
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

    public static async ExistsBooksByAuthor(authorId: string): Promise<boolean>{
        const book = await Book.findOne({'author._id': authorId});
        if(!book) return false;

        return true;
    }

    public static async ExistsBooksByGenre(genreId: string): Promise<boolean>{
        const book = await Book.findOne({'genre._id': genreId});
        if(!book) return false;

        return true;
    }


    public static async getBooksByAuthor(authorId: string, showDeleted = false): Promise<any[]>{
        // Generar criterio de búsqueda
        let criteria: {} = {
            'author._id': authorId
        };

        if (!showDeleted){
            criteria = {
                ... criteria,
                'isDeleted.value': false
            }
        }
        return Book.find(criteria).sort({'title': 1});
    }
}
