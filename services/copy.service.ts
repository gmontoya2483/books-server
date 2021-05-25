
import {ICriteria, INewCopy, IServiceResponse} from "../interfaces/copy.interfaces";
import {UserService} from "./user.service";
import {BookService} from "./book.service";
import { Copy } from "../models/copy.model";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {IHelmetPermittedCrossDomainPoliciesConfiguration} from "helmet";
import {Book} from "../models/book.model";
import {Pagination} from "../classes/pagination.class";



export abstract class CopyService {


    public static async newCopy (meId: string, {bookId}: INewCopy): Promise<IServiceResponse>{

        const owner: any = await UserService.findUser(meId);
        if (!owner) return this.badRequestCopyMessage("Usario no encontrado");

        const book: any = await BookService.findBook(bookId);
        if (!book) return this.badRequestCopyMessage("libro no encontrado");


        const copy: any = new Copy({book, owner});
        await copy.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `El libro ${ book.title } fue agregado a la biblioteca`,
                copy
            }
        }
    }


    public static async getAllCopies(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
    , showDeleted: boolean = false, {userId = null, communityId = null}: ICriteria): Promise<IServiceResponse> {

        // Generat criterio de búsqueda
        let criteria = {};

        // Agregar UserId
        if(userId){
            criteria = {
                ...criteria,
                'owner._id': userId
            }
        }

        // Agregar UserId
        if(communityId){
            criteria = {
                ...criteria,
                'owner.comunidad._id': communityId
            }
        }

        // Agregar search
        if(search){
            criteria = {
                ...criteria,
                $or: [
                    {'book.title': {$regex:  `.*${search}.*`, $options:'i'}},
                    {'book.author.name': {$regex: `.*${search}.*`, $options:'i'}},
                    {'book.author.lastName': {$regex: `.*${search}.*`, $options:'i'}},
                    {'book.genre.name': {$regex: `.*${search}.*`, $options:'i'}}
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

        const totalCopies = await Copy.countDocuments(criteria);
        const pagination = await new Pagination(totalCopies,pageNumber, pageSize).getPagination();
        // Actualiza page number de acuerdo a la paginación
        const currentPageNumber = pagination.currentPage;

        const copies = await Copy.find(criteria)
            .skip((currentPageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({'book.title': 1});


        return {
            status: 200,
            response: {
                ok: true,
                copies: {
                    pagination: pagination,
                    copies
                }
            }
        };


    }



    public static badRequestCopyMessage(mensaje: string): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }



}
