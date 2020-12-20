import {Community} from "../models/community.model";
import {IDeleteCommunity, INewCommunity, IServiceResponse, IUpdateCommunity} from "../interfaces/community.interfaces";
import {Country} from "../models/country.model";
import {User} from "../models/user.model";
import logger from "../startup/logger.startup";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Pagination} from "../classes/pagination.class";


const mongoose = require('mongoose');
const Fawn = require('fawn');

// Init fawn for using transactions
Fawn.init(mongoose, 'trxCommunityUsers');

export abstract class CommunityService {

    public static async getSingleCommunity(communityId: string) : Promise<IServiceResponse> {
        const community = await Community.findById(communityId);
        if (!community) return this.notFoundCommunityMessage();

        return {
            status: 200,
            response: {
                ok: true,
                community
            }
        };
    }

    public static async getAllCommunities(search: any= null, showDeleted: boolean = false): Promise<IServiceResponse> {

        // Generar criterio de búsqueda
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

        const communities = await Community.find(criteria).sort('name');
        const total = communities.length;
        return {
            status: 200,
            response: {
                ok: true,
                total,
                communities
            }
        };

    }

    public static async NewCommunity({name, countryId}: INewCommunity): Promise<IServiceResponse>{

        const country = await Country.findById(countryId).select({__v: 0});
        if (!country) return this.notFoundCommunityMessage("Pais no encontrado");

        const community: any = new Community({
            name,
            country
        });

        await community.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `La comunidad ${ community.name } ha sido agregada`,
                community
            }

        };

    }


    public static async updateCommunity (communityId: string, {name}: IUpdateCommunity): Promise<IServiceResponse>{

        let community: any = await Community.findById(communityId);
        if (!community) return this.notFoundCommunityMessage();

        community.name = name;

        try {
            new Fawn.Task()
                .update('communities', {_id: community._id}, {
                    // @ts-ignore
                    $set: {name: community.name}
                })
                .update('users', {'comunidad._id': community._id}, {
                    // @ts-ignore
                    $set: {'comunidad.name': community.name}
                })
                .options({multi: true})
                .run();

            return {
                status: 200,
                response: {
                    ok: true,
                    mensaje: `La comunidad ${community.name} ha sido modificada`,
                    community
                }
            };

        } catch (e) {
            logger.error(`Error al modificar la comunidad ${community.id}`, e)
            return {
                status: 500,
                response: {
                    ok: false,
                    mensaje: `Internal Server Error.`
                }
            };
        }

    }


    public static async setDeleted (communityId: string, {isDeleted}: IDeleteCommunity): Promise<IServiceResponse>{
        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, validatedDateTime: null};

        const community = await Community.findByIdAndUpdate(communityId, {
            $set: {
                isDeleted: deleted,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if (!community) return this.notFoundCommunityMessage();

        const message = (isDeleted) ? `La comunidad ha sido marcada como eliminado`
            : `La comunidad ha sido desmarcado como eliminada`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                community
            }

        };

    }

    public static async deleteCommunity(communityId: string): Promise<IServiceResponse> {

        const user = await User.findOne({'comunidad._id':communityId})
        if (user) return this.badRequestCommunityMessage();

        const community: any = await Community.findByIdAndDelete(communityId);
        if (!community) return this.notFoundCommunityMessage();


        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `La comunidad ${ community.name } ha sido eliminada`,
                community
            }

        };
    }


    public static async getCommunityMembers(communityId: string, search: any = null, {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination
        , showDeleted: boolean = false): Promise<IServiceResponse> {


        const community: any = await Community.findById(communityId);
        if (!community) return this.notFoundCommunityMessage();

        // Generat criterio de búsqueda
        let criteria = {};
        criteria = {...criteria, 'comunidad._id': communityId};
        if(search) {
            criteria = {
                ...criteria,
                $or: [
                    {nombre: {$regex:  `.*${search}.*`, $options:'i'}},
                    {apellido: {$regex: `.*${search}.*`, $options:'i'}}
                ]

            }
        }

        console.log (criteria);

        // TODO: Agregar esta validacion al criterio de busqueda cuando se habilite el IsDeleted en User Model
        // Verificar si se muestran los marcados como borrados
        // if (!showDeleted){
        //     criteria = {
        //         ... criteria,
        //         'isDeleted.value': false
        //     }
        // }

        // Calcular total de usuarios y páginas
        const totalUsers = await User.countDocuments(criteria);
        const pagination = await new Pagination(totalUsers, pageNumber, pageSize).getPagination();
        pageNumber = pagination.currentPage;


        const users = await User.find(criteria)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort('nombre apellido').select({ password: 0});


        return {
            status: 200,
            response: {
                ok: true,
                community,
                users: {
                    pagination,
                    users
                }
            }

        };


    }


    private static notFoundCommunityMessage(mensaje: string = "Comunidad no encontrada"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

     private static badRequestCommunityMessage(mensaje: string = `La comunidad tiene usuarios asociadas`): IServiceResponse {
         return {
             status: 400,
             response: {
                 ok: false,
                 mensaje
             }
         };
     }

}
