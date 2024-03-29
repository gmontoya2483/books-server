import {
    ICriteria,
    IDeleteCopy,
    INewCopy,
    IServiceResponse,
    ISetCopyStatus,
    IUpdateCommunity,
    IUpdateCopies,
    IUpdateCopiesOutput
} from "../interfaces/copy.interfaces";
import {UserService} from "./user.service";
import {BookService} from "./book.service";
import {Copy} from "../models/copy.model";
import {DEFAULT_PAGE_SIZE, MAX_ALLOWED_BORROWED} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Pagination} from "../classes/pagination.class";
import {FollowService} from "./follow.service";
import {MeService} from "./me.service";
import {currentLoanStatusEnum, LoanHistory} from "../models/loan.model";
import {Notification} from "../classes/notification.class";
import logger from "../startup/logger.startup";
import {SendGrid} from "../classes/sendgrid.class";
import {Book} from "../models/book.model";
import {LoanHistoryService} from "./loanHistory.service";


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

    public static async getSingleCopy(copyId: string) : Promise<IServiceResponse> {
        const copy = await  Copy.findById(copyId);
        if(!copy) return this.notFoundCopyMessage();

        return {
            status: 200,
            response: {
                ok: true,
                copy
            }
        }

    }


    public static async getAllCopiesByCommunity(search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
        , showDeleted: boolean = false, { communityId }: ICriteria, meId: string): Promise<IServiceResponse> {

        const result = await this.getAllCopies(search, {pageNumber, pageSize}, showDeleted, {userId: null, communityId});

        // Agregar informacion si el Owner esta siendo seguido por "me"
        const copiesWithFollowing: any [] = [];
        let i = 0;
        const totalCopies =  result.response.copies?.copies?.length || 0;

        while (i < totalCopies){
            const currentCopy = result.response.copies!.copies![i];
            // @ts-ignore
            const isOwnerFollowedByMe = await FollowService.getIfUserAFollowsUserB(meId, currentCopy.owner._id, true);
            // @ts-ignore
            copiesWithFollowing.push({...currentCopy._doc, isOwnerFollowedByMe: isOwnerFollowedByMe});

            i++;
        }
        result.response.copies!.copies = copiesWithFollowing;

        return result;

    }


    public static async getAllCopiesByUser(search: any = null,
                                           {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination,
                                           showDeleted: boolean = false,
                                           { userId }: ICriteria,
                                           showOnlyBorrowed: boolean = false): Promise<IServiceResponse> {
        return await this.getAllCopies(search, {pageNumber, pageSize}, showDeleted, {userId, communityId: null}, showOnlyBorrowed);
    }


    public static async getAllCopiesByUserIsFollowing(userId: string,
                                                      search: any = null,
                                                      {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination,
                                                      showDeleted: boolean = false,
                                                      showOnlyBorrowedToMe: boolean =  false){

        const myCommunityId = await MeService.getMyCommunityId(userId);
        if (!myCommunityId){
            return this.noCopiesResult(pageSize);
        }

        const owners = await FollowService.getArrayAllFollowedByMeConfirmed(userId);
        return await this.getAllCopies(search,
            {pageNumber, pageSize},
            showDeleted,
            {userId: null, communityId: myCommunityId, owners},
            false,
            showOnlyBorrowedToMe,
            userId);
    }



    private static async getAllCopies(search: any = null,
                                      {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination,
                                      showDeleted: boolean = false,
                                      {userId = null, communityId = null, owners = null}: ICriteria,
                                      showOnlyBorrowed: boolean = false,
                                      showOnlyBorrowedToMe: boolean = false,
                                      requesterUserId: string | null = null): Promise<IServiceResponse> {

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

        // Agregar Owners
        if(owners) {
            criteria = {
                ... criteria,
                'owner._id': { $in: owners}
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
                    {'book.genre.name': {$regex: `.*${search}.*`, $options:'i'}},
                    {'owner.nombre': {$regex: `.*${search}.*`, $options:'i'}},
                    {'owner.apellido': {$regex: `.*${search}.*`, $options:'i'}}
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

        // Verificar si se muestran sólo lo ejemplares prestados
        if (showOnlyBorrowed) {
            criteria = {
                ... criteria,
                'currentLoan': {$ne: null}
            }
        }

        // Verificar si se muestran sólo lo ejemplares que me han prestado
        if (showOnlyBorrowedToMe) {
            criteria = {
                ... criteria,
                'currentLoan.user._id': requesterUserId
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


    public static async ExistsCopiesByBook(bookId: string): Promise<boolean>{
        const copy = await Copy.findOne({'book._id': bookId});
        if(!copy) return false;

        return true;
    }

    public static async UpdateCopiesByBookId (bookId: string, opts: any ,{title, description, author, genre}: IUpdateCopies)
        : Promise<IUpdateCopiesOutput> {

        const CopiesToUpdate: any [] = await Copy.find({'book._id': bookId});
        const totalCopiesToUpdate = CopiesToUpdate.length;
        // console.log(totalCopiesToUpdate);

        let totalUpdatedCopies = 0;
        let ok = false

        for (const copy of CopiesToUpdate) {
            copy.book.title = title;
            copy.book.description = description;
            copy.book.genre = genre;
            copy.book.author = author;
            copy.dateTimeUpdated = Date.now();
            try {
                await copy.save(opts);
                //await copy.save(); // localhost
                totalUpdatedCopies ++;
            } catch (e) {
                console.log(e)
                break;
            }
        }

        ok = (totalUpdatedCopies == totalCopiesToUpdate);
        return {ok, totalCopiesToUpdate, totalUpdatedCopies}

    }


    public static async UpdateCopiesOwnerCommunityByOwnerId(ownerId: string, opts: any, community: IUpdateCommunity | null): Promise<IUpdateCopiesOutput> {
        const CopiesToUpdate: any [] = await Copy.find({'owner._id': ownerId});
        const totalCopiesToUpdate = CopiesToUpdate.length;
        // console.log(totalCopiesToUpdate);

        let totalUpdatedCopies = 0;
        let ok = false

        for (const copy of CopiesToUpdate) {
            copy.owner.comunidad = community
            copy.dateTimeUpdated = Date.now()
            try {
                await copy.save(opts);
                //await copy.save(); // localhost
                totalUpdatedCopies ++;
            } catch (e) {
                console.log(e)
                break;
            }
        }
        ok = (totalUpdatedCopies == totalCopiesToUpdate);
        return {ok, totalCopiesToUpdate, totalUpdatedCopies}
    }

    public static async UpdateCopiesByGenreId (genreId: string, opts: any , name: string)
        : Promise<IUpdateCopiesOutput> {

        const CopiesToUpdate: any [] = await Copy.find({'book.genre._id': genreId});
        const totalCopiesToUpdate = CopiesToUpdate.length;

        let totalUpdatedCopies = 0;
        let ok = false

        for (const copy of CopiesToUpdate) {
            copy.book.genre.name = name
            copy.dateTimeUpdated = Date.now();
            try {
                await copy.save(opts);
                //await copy.save(); // localhost
                totalUpdatedCopies ++;
            } catch (e) {
                console.log(e)
                break;
            }
        }
        ok = (totalUpdatedCopies == totalCopiesToUpdate);
        return {ok, totalCopiesToUpdate, totalUpdatedCopies}
    }


    public static async UpdateCopiesByAuthorId (authorId: string, opts: any , authorName: string, authorLastName: string)
        : Promise<IUpdateCopiesOutput> {

        const CopiesToUpdate: any [] = await Copy.find({'book.author._id': authorId});
        const totalCopiesToUpdate = CopiesToUpdate.length;

        let totalUpdatedCopies = 0;
        let ok = false

        for (const copy of CopiesToUpdate) {
            copy.book.author.name = authorName;
            copy.book.author.lastName = authorLastName;
            copy.dateTimeUpdated = Date.now();
            try {
                await copy.save(opts);
                //await copy.save(); // localhost
                totalUpdatedCopies ++;
            } catch (e) {
                console.log(e)
                break;
            }
        }
        ok = (totalUpdatedCopies == totalCopiesToUpdate);
        return {ok, totalCopiesToUpdate, totalUpdatedCopies}
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

    private static notFoundCopyMessage(mensaje: string = "Ejemplar no encontrado"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }



    public static noCopiesResult(pageSize: number) {
        return {
            status: 200,
            response: {
                ok: true,
                copies: {
                    pagination: {
                        previousPage: null,
                        currentPage: 1,
                        nextPage: null,
                        totalPages: 1,
                        pageSize,
                        pages: [1],
                        showing: {
                            from: 0,
                            to: 0,
                            of: 0
                        }
                    },
                    copies: []
                }
            }
        };
    }


    public static async setDeleted(copyId: string, {isDeleted}: IDeleteCopy, ownerId: string | null = null): Promise<IServiceResponse> {

        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, deletedDateTime: null};

        let criteria = {};

        criteria = {
            ... criteria,
            _id: copyId,
            currentLoan: null
        }

        // Si existe el owner ID
        if (ownerId) {
            criteria = {
                ... criteria,
                'owner._id': ownerId
            }
        }


        const copy = await Copy.findOneAndUpdate(criteria, {
            $set: {
                isDeleted: deleted,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if(!copy) return this.notFoundCopyMessage("Ejemplar no encontrado o en proceso de prestámo");

        const message = (isDeleted) ? `El ejemplar ha sido marcado como eliminado`
            : `El ejemplar ha sido desmarcado como eliminado`


        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                copy
            }

        };


    }

    public static async getQtyOfActiveBorrowsByRequester(requesterId: string): Promise<number> {
        return Copy.countDocuments({'currentLoan.user._id': requesterId});
    }

    public static async setCopyLoanStatus(userId: string, copyId: string, {setStatus}: ISetCopyStatus): Promise<IServiceResponse> {
        switch (setStatus) {
            case currentLoanStatusEnum.requested:
                return this.setCopyLoanStatusRequested(userId, copyId);
            case currentLoanStatusEnum.cancelled:
                return this.setCopyLoanStatusCancelled(userId, copyId);
            case currentLoanStatusEnum.accepted:
                return this.setCopyLoanStatusAccepted(userId, copyId);
            case currentLoanStatusEnum.rejected:
                return this.setCopyLoanStatusRejected(userId, copyId);
            case currentLoanStatusEnum.borrowed:
                return this.setCopyLoanStatusBorrowed(userId, copyId);
            case currentLoanStatusEnum.claimed:
                return this.setCopyLoanStatusClaimed(userId, copyId);
            case currentLoanStatusEnum.returned:
                return this.setCopyLoanStatusReturned(userId, copyId);
            case currentLoanStatusEnum.returnedConfirmation:
                return this.setCopyLoanStatusReturnedConfirmation(userId, copyId);
            default:
                return this.badRequestCopyMessage("Estado del préstamo no válido");
        }
    }


    private static async  setCopyLoanStatusRequested(RequesterUserId: string, copyId: string):  Promise<IServiceResponse> {
        // Buscar la copia
        const copy = await Copy.findOne({_id: copyId, 'isDeleted.value': false});
        if(!copy) return this.notFoundCopyMessage();

        // Verificar que la copia no tenga un currentLoan
        if(copy.currentLoan)
            return this.badRequestCopyMessage("El ejemplar ya ha sido prestado");

        // Buscar el usuario
        const requester = await UserService.findUser(RequesterUserId);
        if(!requester)
            return this.badRequestCopyMessage("Usuario no encontrado");

        // verificar que la comunidad del usuario sea igual a la comunidad del owner de la copia
        if(!copy.owner.comunidad._id.equals(requester.comunidad._id))
            return this.badRequestCopyMessage("El Usuario no pertenece a la misma comunidad que el dueño del ejemplar");

        // Verificar que el usuario este siguiendo al owner y que este confirmada
        if(!await FollowService.getIfUserAFollowsUserB(RequesterUserId, copy.owner._id))
            return this.badRequestCopyMessage("El usuario no sigue al dueño del ejemplar");

        // Verficar que el requester no haya alcanzado la cantidad máxima de prestamos
        if (await this.getQtyOfActiveBorrowsByRequester(RequesterUserId) >= MAX_ALLOWED_BORROWED)
            return this.badRequestCopyMessage("El usuario alcanzó la cantidad máxima de prestamos.");


        // Agregar el loan request a la copia
        const currentLoan = {
            user : requester,
            status: currentLoanStatusEnum.requested,
            dateTimeRequested: Date.now()
        }
        copy.currentLoan = currentLoan;
        copy.dateTimeUpdated = Date.now();

        // Guardar copia marcada como pedida en prestamo
        await copy.save();

        // Crear notificación
        const emailMessage: any = Notification.getRequestCopyLoan(
            `${requester.nombre} ${requester.apellido}`,
            requester.email,
            copy.owner.nombre,
            copy.owner.email,
            copy.book.title
        );

        // Enviar Notificacion
        logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
        const sendGrid = new SendGrid();
        await sendGrid.sendSingleEmail(emailMessage);

        // Respuesta
        const message = `El ejemplar ${ copy.book.title } ha sido pedido prestado a ${ copy.owner.nombre } ${ copy.owner.apellido }`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                copy
            }
        };
    }


    private static async  setCopyLoanStatusCancelled(requesterUserId: string, copyId: string):  Promise<IServiceResponse> {
        // Buscar la copia
        const copy = await Copy.findOne({_id: copyId, 'isDeleted.value': false});
        if(!copy) return this.notFoundCopyMessage();

        // Verificar que la copia tenga un currentLoan
        if(!copy.currentLoan)
            return this.badRequestCopyMessage("No existe un pedido de prestamo del ejemplar");

        // Verificar que el Requester haya pedido prestado el ejemplar
        if (copy.currentLoan && !copy.currentLoan.user._id.equals(requesterUserId))
            return this.badRequestCopyMessage("No tienes un pedido de prestamo de este ejemplar");

        // Verificar que el Prestamo se encuentré en estado solicitado
        if (copy.currentLoan && copy.currentLoan.status !== currentLoanStatusEnum.requested)
            return this.badRequestCopyMessage("El estado del presatamo no es Solicitado");

        copy.currentLoan = null;
        copy.dateTimeUpdated = Date.now();

        // Guardar copia marcada como pedida en prestamo
        await copy.save();

        const message = `El pedido de prestamo del ejemplar ${ copy.book.title } a ${ copy.owner.nombre } ${ copy.owner.apellido } ha sido cancelado.`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                copy
            }
        };
    }


    private static async  setCopyLoanStatusAccepted(ownerId: string, copyId: string):  Promise<IServiceResponse> {

        // Buscar la copia
        const copy = await Copy.findOne({_id: copyId, 'isDeleted.value': false});
        if(!copy)
            return this.notFoundCopyMessage();

        // Verificar que sea el owner del ejemplar
        if(!copy.owner._id.equals(ownerId))
            return this.badRequestCopyMessage("El usuario no es el dueño del ejemplar");

        // Verificar que la copia tenga un currentLoan
        if(!copy.currentLoan)
            return this.badRequestCopyMessage("No existe un pedido de prestamo del ejemplar");

        // Verificar que el Prestamo se encuentré en estado solicitado
        if (copy.currentLoan && copy.currentLoan.status !== currentLoanStatusEnum.requested)
            return this.badRequestCopyMessage("El estado del presatamo no es Solicitado");

        copy.currentLoan.status = currentLoanStatusEnum.accepted;
        copy.currentLoan.dateTimeAccepted = Date.now();
        copy.dateTimeUpdated = Date.now();

        // Guardar copia marcada como prestamos aceptado
        await copy.save();

        // Crear notificación
        const emailMessage: any = Notification.getAcceptCopyLoan(
            copy.currentLoan.user.nombre,
            copy.currentLoan.user.email,
            `${copy.owner.nombre} ${copy.owner.apellido}`,
            copy.owner.email,
            copy.book.title
        );

        // Enviar Notificacion
        logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
        const sendGrid = new SendGrid();
        await sendGrid.sendSingleEmail(emailMessage);


        const message = `El pedido de prestamo del ejemplar ${ copy.book.title } ha sido aceptado. Se le va a enviar 
        un email con sus datos a ${copy.currentLoan.user.nombre} ${copy.currentLoan.user.apellido } para que pueda
         contactarlo y acordar la entrega.`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                copy
            }
        };

    }


    private static async  setCopyLoanStatusRejected(ownerId: string, copyId: string):  Promise<IServiceResponse> {

        // Buscar la copia
        const copy = await Copy.findOne({_id: copyId, 'isDeleted.value': false});
        if(!copy)
            return this.notFoundCopyMessage();

        // Verificar que sea el owner del ejemplar
        if(!copy.owner._id.equals(ownerId))
            return this.badRequestCopyMessage("El usuario no es el dueño del ejemplar");

        // Verificar que la copia tenga un currentLoan
        if(!copy.currentLoan)
            return this.badRequestCopyMessage("No existe un pedido de prestamo del ejemplar");

        // Verificar que el Prestamo se encuentré en estado solicitado o aceptado
        if (copy.currentLoan
            && (copy.currentLoan.status !== currentLoanStatusEnum.requested
                && copy.currentLoan.status !== currentLoanStatusEnum.accepted)
        )
            return this.badRequestCopyMessage("El estado del presatamo no es valido para ser rechazado");

        // Se guarda los datos del requester para las notificaciones
        const requesterInfo = {
            nombre : copy.currentLoan.user.nombre,
            apellido: copy.currentLoan.user.apellido,
            email: copy.currentLoan.user.email,
        }

        copy.currentLoan = null;
        copy.dateTimeUpdated = Date.now();

        // Guardar copia marcada como prestamos rechazado
        await copy.save();

        // Crear notificación
        const emailMessage: any = Notification.getRejectCopyLoan(
            requesterInfo.nombre,
            requesterInfo.email,
            `${copy.owner.nombre} ${copy.owner.apellido}`,
            copy.owner.email,
            copy.book.title
        );

        // Enviar Notificacion
        logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
        const sendGrid = new SendGrid();
        await sendGrid.sendSingleEmail(emailMessage);

        const message = `El pedido de prestamo del ejemplar ${ copy.book.title } ha sido rechazado. Se le va a enviar 
        un email a ${requesterInfo.nombre} ${requesterInfo.apellido } para informarle su decisión.`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                copy
            }
        };

    }


    private static async  setCopyLoanStatusBorrowed(ownerId: string, copyId: string):  Promise<IServiceResponse> {

        // Buscar la copia
        const copy = await Copy.findOne({_id: copyId, 'isDeleted.value': false});
        if(!copy)
            return this.notFoundCopyMessage();

        // Verificar que sea el owner del ejemplar
        if(!copy.owner._id.equals(ownerId))
            return this.badRequestCopyMessage("El usuario no es el dueño del ejemplar");

        // Verificar que la copia tenga un currentLoan
        if(!copy.currentLoan)
            return this.badRequestCopyMessage("No existe un prestamo activo del ejemplar");

        // Verificar que el Prestamo se encuentré en estado aceptado
        if (copy.currentLoan && (copy.currentLoan.status !== currentLoanStatusEnum.accepted))
            return this.badRequestCopyMessage("El estado del presatamo no es valido para ser prestado");

        copy.currentLoan.status = currentLoanStatusEnum.borrowed;
        copy.currentLoan.dateTimeBorrowed = Date.now();
        copy.dateTimeUpdated = Date.now();

        // Guardar copia marcada como prestada
        await copy.save();

        // Crear notificación
        const emailMessage: any = Notification.getBorrowCopyLoan(
            copy.currentLoan.user.nombre,
            copy.currentLoan.user.email,
            `${copy.owner.nombre} ${copy.owner.apellido}`,
            copy.owner.email,
            copy.book.title
        );

        // Enviar Notificacion
        logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
        const sendGrid = new SendGrid();
        await sendGrid.sendSingleEmail(emailMessage);

        // Respuesta
        const message = `El ejemplar ${ copy.book.title } ha sido prestado a ${ copy.currentLoan.user.nombre }
         ${ copy.currentLoan.user.apellido } `

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                copy
            }
        };

    }

    private static async  setCopyLoanStatusClaimed(ownerId: string, copyId: string):  Promise<IServiceResponse> {
        // Buscar la copia
        const copy = await Copy.findOne({_id: copyId, 'isDeleted.value': false});
        if(!copy)
            return this.notFoundCopyMessage();

        // Verificar que sea el owner del ejemplar
        if(!copy.owner._id.equals(ownerId))
            return this.badRequestCopyMessage("El usuario no es el dueño del ejemplar");

        // Verificar que la copia tenga un currentLoan
        if(!copy.currentLoan)
            return this.badRequestCopyMessage("No existe un prestamo activo del ejemplar");

        // Verificar que el Prestamo se encuentré en estado aceptado
        if (copy.currentLoan && (copy.currentLoan.status !== currentLoanStatusEnum.borrowed))
            return this.badRequestCopyMessage("El estado del presatamo no es valido para ser reclamado");

        copy.currentLoan.status = currentLoanStatusEnum.claimed;
        copy.currentLoan.dateTimeClaimed = Date.now();
        copy.dateTimeUpdated = Date.now();

        // Guardar copia marcada como prestada
        await copy.save();

        // Crear notificación
        const emailMessage: any = Notification.getClaimCopyLoan(
            copy.currentLoan.user.nombre,
            copy.currentLoan.user.email,
            `${copy.owner.nombre} ${copy.owner.apellido}`,
            copy.owner.email,
            copy.book.title
        );

        // Enviar Notificacion
        logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
        const sendGrid = new SendGrid();
        await sendGrid.sendSingleEmail(emailMessage);


        const message = `Se solicito la devolución del ejemplar ${ copy.book.title }. Se le va a enviar 
        un email a    ${copy.currentLoan.user.nombre } ${copy.currentLoan.user.apellido } para informarle que debe devolver el 
        ejemplar que le has prestado.`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                copy
            }
        };
    }


    private static async  setCopyLoanStatusReturned(requesterUserId: string, copyId: string):  Promise<IServiceResponse> {
        // Buscar la copia
        const copy = await Copy.findOne({_id: copyId, 'isDeleted.value': false});
        if (!copy) return this.notFoundCopyMessage();

        // Verificar que la copia se encuentre prestada
        if (!copy.currentLoan)
            return this.badRequestCopyMessage("El ejemplar no ha sido prestado");

        // Verificar que se le haya prestado el ejemplar al requester
        if (!copy.currentLoan.user._id.equals(requesterUserId))
            return this.badRequestCopyMessage("No te han prestamo el ejemplar");

        // Verificar que el Prestamo se encuentré en estado borrowed
        if (copy.currentLoan.status !== currentLoanStatusEnum.borrowed && copy.currentLoan.status !== currentLoanStatusEnum.claimed)
            return this.badRequestCopyMessage("El estado del presatamo no es valido para ser devuelto");

        copy.currentLoan.dateTimeReturned = Date.now();
        copy.dateTimeUpdated = Date.now();
        copy.currentLoan.status = currentLoanStatusEnum.returned;

        // Guardar copia marcada como devuelta
        await copy.save();

        // Crear notificación
        const emailMessage: any = Notification.getReturnCopyLoan(
            `${copy.currentLoan.user.nombre} ${copy.currentLoan.user.apellido}`,
            copy.currentLoan.user.email,
            copy.owner.nombre,
            copy.owner.email,
            copy.book.title
        );

        // Enviar Notificacion
        logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
        const sendGrid = new SendGrid();
        await sendGrid.sendSingleEmail(emailMessage);

        // Respuesta
        const message = `Se ha devuelto el ejemplar ${copy.book.title}. Se le va a enviar 
        un email a  ${copy.owner.nombre} ${copy.owner.apellido} para informarle que debe confirmar 
        la devolución.`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                copy
            }
        };
    }




    private static async  setCopyLoanStatusReturnedConfirmation(ownerUserId: string, copyId: string):  Promise<IServiceResponse> {

        // Buscar la copia
        const copy = await Copy.findOne({_id: copyId, 'isDeleted.value': false});
        if (!copy) return this.notFoundCopyMessage();

        // Verificar que la copia se encuentre prestada
        if (!copy.currentLoan)
            return this.badRequestCopyMessage("El ejemplar no ha sido prestado");

        // Verificar que sea el dueño del ejemplar al requester
        if (!copy.owner._id.equals(ownerUserId))
            return this.badRequestCopyMessage("No eres el dueño del ejemplar");

        // Verificar que el Prestamo se encuentré en estado regresado
        if (copy.currentLoan.status !== currentLoanStatusEnum.returned)
            return this.badRequestCopyMessage("El estado del presatamo no es valido para confirmar la devolución");


        const loan = {
            _id: copy.currentLoan._id,
            user: copy.currentLoan.user,
            status:  currentLoanStatusEnum.returnedConfirmation,
            dateTimeRequested: copy.currentLoan.dateTimeRequested,
            dateTimeAccepted: copy.currentLoan.dateTimeAccepted,
            dateTimeRejected: copy.currentLoan.dateTimeRejected,
            dateTimeBorrowed: copy.currentLoan.dateTimeBorrowed,
            dateTimeClaimed: copy.currentLoan.dateTimeClaimed,
            dateTimeReturned: copy.currentLoan.dateTimeReturned,
            dateTimeReturnedConfirmation: Date.now(),
            copyId: copy._id,
            ownerId: copy.owner._id
        }

        // Setear el nuevo loanHistory
        const loanHistory = new LoanHistory(loan);

        // Borrar el current loan de la copia
        copy.currentLoan = null;
        copy.dateTimeUpdated = Date.now();

        const session = await Copy.startSession();
        session.startTransaction();

        try {

            const opts = {session};
            await copy.save(opts);
            await loanHistory.save(opts);

            // Confirmo la transaccion
            await session.commitTransaction();
            session.endSession();


            // Crear notificación
            const emailMessage: any = Notification.getReturnedConfirmationCopyLoan(
                loan.user.nombre,
                loan.user.email,
                `${copy.owner.nombre} ${copy.owner.apellido}`,
                copy.owner.email,
                copy.book.title
            );

            // Enviar Notificacion
            logger.debug(`Enviando Nofificacion a SendGrid: ${JSON.stringify(emailMessage)}`);
            const sendGrid = new SendGrid();
            await sendGrid.sendSingleEmail(emailMessage);


            // @ts-ignore
            const nombre= loanHistory.user.nombre;
            // @ts-ignore
            const apellido = loanHistory.user.apellido;

            const message = `Se ha confirmado la devolución del ejemplar ${copy.book.title}. Se le va a enviar 
            un email a  ${nombre} ${apellido} para informar que 
            se confirmó la devolución.`

            return {
                status: 200,
                response: {
                    ok: true,
                    mensaje: message,
                    copy
                }
            };



        } catch (e) {
            console.log('Copy: salio por aca')
            await session.abortTransaction();
            session.endSession();
            throw e;

        }

    }

    public static async getTotalCopiesByCommunity(communityId: string){
        return Copy.countDocuments({'owner.comunidad._id': communityId});
    }


    public static async getTotalCopiesByUserId(userId: string, isDeleted: boolean){
        return Copy.countDocuments({'owner._id': userId, 'isDeleted.value': isDeleted});
    }


    public static async getQtyCopiesByGenreAndCommunity(communityId: string) {
        const aggregatorOpts = [
            {
                $match: {'owner.comunidad._id': communityId}
            },
            {
                $group: { _id: "$book.genre.name" , totalCopies: {$sum: 1}}
            },
            {
                $sort: {totalCopies: -1}
            }
        ]
        return await Copy.aggregate(aggregatorOpts).exec();
    }

    public static async getQtyCopiesByAuthorAndCommunity(communityId: string) {
        const aggregatorOpts = [
            {
                $match: {'owner.comunidad._id': communityId}
            },
            {
                $group: { _id: { $concat: ["$book.author.name", " ", "$book.author.lastName"] } , totalCopies: {$sum: 1}}
            },
            {
                $sort: {totalCopies: -1}
            }
        ]
        return await Copy.aggregate(aggregatorOpts).exec();
    }


    public static async getQtyCopiesByGenreAndUserEmail(email: string) {
        const aggregatorOpts = [
            {
                $match: {'owner.email': email}
            },
            {
                $group: { _id: "$book.genre.name" , totalCopies: {$sum: 1}}
            },
            {
                $sort: {totalCopies: -1}
            }
        ]
        return await Copy.aggregate(aggregatorOpts).exec();
    }


    public static async getQtyCopiesByLoanStatusAndUserEmail(email: string) {
        const aggregatorOpts = [
            {
                $match: {'owner.email': email}
            },
            {
                $group: { _id: "$currentLoan.status" , totalCopies: {$sum: 1}}
            },
            {
                $sort: {totalCopies: -1}
            }
        ]
        return await Copy.aggregate(aggregatorOpts).exec();
    }


    public static async getQtyCopiesByAuthorAndUserEmail(email: string) {
        const aggregatorOpts = [
            {
                $match: {'owner.email': email}
            },
            {
                $group: { _id: { $concat: ["$book.author.name", " ", "$book.author.lastName"] } , totalCopies: {$sum: 1}}
            },
            {
                $sort: {totalCopies: -1}
            }
        ]
        return await Copy.aggregate(aggregatorOpts).exec();
    }


    public static async getQtyCopiesByLoanStatusAndRequesterId(requesterEmail: string) {
        const aggregatorOpts = [
            {
                $match: {'currentLoan.user.email': requesterEmail}
            },
            {
                $group: { _id: "$currentLoan.status" , totalCopies: {$sum: 1}}
            },
            {
                $sort: {totalCopies: -1}
            }
        ]

        return await Copy.aggregate(aggregatorOpts).exec();
    }










    public static async getCopiesByUserIdStatisticsInfo(userId: string, email: string){
        const deletedCopies = await this.getTotalCopiesByUserId(userId, true);
        const activeCopies =  await this.getTotalCopiesByUserId(userId, false);
        const total = activeCopies + deletedCopies;
        const copiesByGenre = await this.getQtyCopiesByGenreAndUserEmail(email);
        const copiesByAuthor = await this.getQtyCopiesByAuthorAndUserEmail(email)
        const copiesByCurrentLoanStatus = await this.getQtyCopiesByLoanStatusAndUserEmail(email);
        const totalLoanHistory = await LoanHistoryService.getTotalLoanHistoryByOwner(userId);


        return {
            totalCopies: {
                total,
                deletedCopies,
                activeCopies,
            },
            copies: {
                genres: {
                    total: copiesByGenre.length,
                    copiesByGenre
                },
                authors: {
                    total: copiesByAuthor.length,
                    copiesByAuthor
                },
                loans: {
                    totalLoanHistory,
                    currentLoans: {
                        total: copiesByCurrentLoanStatus.length,
                        copiesByCurrentLoanStatus
                    }
                }

            }

        }

    }

}
