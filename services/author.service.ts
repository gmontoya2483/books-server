import {
    IDeleteAuthor,
    INewAuthor,
    IServiceResponse,
    IUpdateAuthor
} from "../interfaces/author.interfaces";
import {Author} from "../models/author.model";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Pagination} from "../classes/pagination.class";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";

import {BookService} from "./book.service";
import {Genre} from "../models/genre.model";
import {IUpdateBooksOutput} from "../interfaces/book.interfaces";
import {IUpdateCopiesOutput} from "../interfaces/copy.interfaces";
import {CopyService} from "./copy.service";



export abstract class AuthorService {

    public static async newAuthor (newAuthor: INewAuthor): Promise<IServiceResponse>{

        const name = newAuthor.name.trim().toUpperCase();
        const lastName = newAuthor.lastName.trim().toUpperCase();

        const duplicateAuthor = await Author.findOne({
            'name': {$regex:  `${name}`, $options:'i'},
            'lastName': {$regex:  `${lastName}`, $options:'i'}
        });
        if (duplicateAuthor) return this.BadRequestAuthorMessage(`El autor ${ name } ${ lastName} ya existe`);

        const author = new Author({name, lastName});
        await author.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `El autor ${name} ${lastName} ha sido agregado`,
                author
            }
        }
    }

    public static async getAllAuthors(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
                                      , showDeleted: boolean = false): Promise<IServiceResponse> {

        // Generat criterio de búsqueda
        let criteria = {};
        if(search){
            criteria = {
                ...criteria,
                $or: [
                    {name: {$regex:  `.*${search}.*`, $options:'i'}},
                    {lastName: {$regex: `.*${search}.*`, $options:'i'}}
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

        const totalAuthors = await Author.countDocuments(criteria);
        const pagination = await new Pagination(totalAuthors,pageNumber, pageSize).getPagination();
        // Actualiza page number de acuerdo a la paginación
        const currentPageNumber = pagination.currentPage;

        const authors = await Author.find(criteria)
            .skip((currentPageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({lastName: 1, name: 1}).select({ password: 0});


        return {
            status: 200,
            response: {
                ok: true,
                authors: {
                    pagination: pagination,
                    authors
                }
            }
        };
    }

    public static async getSingleAuthor(authorId: string): Promise<IServiceResponse> {
        const author = await Author.findById(authorId);
        if (!author) return this.notFoundAuthorMessage();

        return {
            status: 200,
            response: {
                ok: true,
                author
            }

        };
    }

    public static async findAuthor( authorId: string ) {
        return Author.findById(authorId).select({_v: 0});
    }


    public static async setDeleted (authorId: string, {isDeleted}: IDeleteAuthor): Promise<IServiceResponse>{

        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, deletedDateTime: null};

        const author = await Author.findByIdAndUpdate(authorId, {
            $set: {
                isDeleted: deleted,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if (!author) return this.notFoundAuthorMessage();

        const message = (isDeleted) ? `El autor ha sido marcado como eliminado`
            : `El autor ha sido desmarcado como eliminado`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                author
            }

        };

    }


    public static async deleteAuthor(authorId: string): Promise<IServiceResponse> {

        if (await this.hasBooks(authorId)) return  this.BadRequestAuthorMessage();

        const author: any = await Author.findByIdAndDelete(authorId);

        if (!author) return this.notFoundAuthorMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El Autor ${ author.name } ${author.lastName} ha sido eliminado`,
                author
            }

        };

    }


    public static async updateAuthor (authorId: string, {name, lastName}: IUpdateAuthor): Promise<IServiceResponse> {

        name = name.trim().toUpperCase();
        lastName = lastName.trim().toUpperCase();

        // Busca si el autor esta duplicado
        const duplicateAuthor = await Author.findOne({
            'name': {$regex:  `${name}`, $options:'i'},
            'lastName': {$regex:  `${lastName}`, $options:'i'},
            '_id': { $ne: authorId }
        });
        if (duplicateAuthor) return this.BadRequestAuthorMessage(`El autor ${ name } ${ lastName} ya existe`);

        const session = await Genre.startSession();
        session.startTransaction();

        try {
            const opts = {session};

            const author = await Author.findByIdAndUpdate(authorId, {
                $set: {
                    name,
                    lastName,
                    dateTimeUpdated: Date.now()
                }
            }, {new: true, session: session}); // Si es local host sacar el session: session

            if (!author) {
                session.endSession();
                return this.notFoundAuthorMessage();
            }

            // Modifica los Libros del autor
            const updateBooksResult: IUpdateBooksOutput = await BookService.UpdateBooksByAuthorId(authorId, opts, name, lastName);
            if (!updateBooksResult.ok) throw (`Hubo problemas al modificar los libros: ${JSON.stringify(updateBooksResult)}`);

            // Modifica las Copias del autor
            const updateCopiesResult: IUpdateCopiesOutput = await CopyService.UpdateCopiesByAuthorId(authorId, opts, name, lastName);
            if (!updateCopiesResult.ok) throw (`Hubo problemas al modificar las copias: ${JSON.stringify(updateCopiesResult)}`);

            // Confirmo la transaccion
            await session.commitTransaction();
            session.endSession();

            return {
                status: 200,
                response: {
                    ok: true,
                    mensaje: `El autor ha sido modificado`,
                    author
                }

            };

        } catch (e) {
            console.log('Genre: salio por aca')
            await session.abortTransaction();
            session.endSession();
            throw e;
        }

    }

    public static async getBooks(authorId: string,  showDeleted: boolean = false): Promise<IServiceResponse> {
        const author= await Author.findById(authorId);
        if (!author) return this.notFoundAuthorMessage();

        const books: any [] =  await BookService.getBooksByAuthor(authorId, showDeleted);

        return {
            status: 200,
            response: {
                ok: true,
                books
            }

        };

    }



    private static async hasBooks(authorId: string): Promise<boolean> {
        return await BookService.ExistsBooksByAuthor(authorId);
    }



    private static notFoundAuthorMessage(mensaje: string = "Autor no encontrado"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    public static BadRequestAuthorMessage(mensaje: string = `El author tiene libros asociados`): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }

}
