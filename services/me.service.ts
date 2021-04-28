import {IServiceResponse, ISetMyCommunity, IUpdateMe} from "../interfaces/me.interfaces";
import {UserService} from "./user.service";
import {User} from "../models/user.model";
import logger from "../startup/logger.startup";
import {CountryService} from "./country.service";
import {CommunityService} from "./community.service";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {Follow} from "../models/follow.models";


export abstract class MeService{

    public static async getMe (meId: string): Promise<IServiceResponse> {
        const me: any  = await UserService.findUser(meId);
        if(!me) return UserService.notFoundUserMessage();
        return {
            status: 200,
            response: {
                ok: true,
                me
            }

        };
    }


    public static async updateMe (meId:string, {paisResidenciaId, nombre, apellido}: IUpdateMe): Promise<IServiceResponse> {

        nombre = nombre.trim().toUpperCase();
        apellido = apellido.trim().toUpperCase();

        // Obtener el pais de residencia
        let country: any;
        if( !paisResidenciaId ){
            country = null;
        } else {
            country  = await CountryService.findCountry(paisResidenciaId);
            if (!country) return CountryService.notFoundCountryMessage();
        }

        // Obtener el usuario
        let me: any = await User.findById(meId).select({password: 0});
        if (!me) UserService.notFoundUserMessage();


        // Si no hay pais de residencia, borrar la comunidad del usuario
        if (!country) {
            me.comunidad = null;
        }

        // Si se cambió el pais de residencia,  borrar la comunidad del usuario
        if (me.comunidad){
            const community: any = await CommunityService.findCommunity(me.comunidad._id)
            if(!community){
                logger.warn(`No se encontró la comunidad asignada al usuario  y fue removida del mismo: ${JSON.stringify(me.comunidad)}`);
                me.comunidad = null;
            } else {
                if (country && !community.country._id.equals(country._id)){
                    me.comunidad = null;
                }
            }
        }

        me.nombre = nombre;
        me.apellido = apellido;
        me.paisResidencia = country ;

        const token = await me.generateAuthToken();

        logger.debug(`Guardar Me en Base de Datos: ${JSON.stringify(me)}`);
        await me.save();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `Usuario ${me.email} ha sido modificado`,
                me,
                token

            }

        };

    }

    public static async generateToken (meId: string): Promise<IServiceResponse> {
        const me: any  = await UserService.findUser(meId);
        if( !me ) return UserService.notFoundUserMessage();

        const token = await me.generateAuthToken();

        return {
            status: 200,
            response: {
                ok: true,
                token
            }

        };
    }

    public static async setMyCommunity(meId: string, {comunidadId}:ISetMyCommunity){

        // Obtener la comunidad
        let community: any = null;
        let communityTemp: any = null;

        if( !comunidadId ){
            communityTemp = null;
        } else {
            community = await CommunityService.findCommunity(comunidadId);
            if (!community) return CommunityService.notFoundCommunityMessage();

            communityTemp = {_id: community._id, name: community.name };
        }

        // Obtener el Usuario
        let me: any = await UserService.findUser(meId);
        if (!me) return UserService.notFoundUserMessage();

        // Verificar que la comunidad seleccionada corresponda al pais de residencia del ususario
        if (!me.paisResidencia)
        {
            return UserService.badRequestUserMessage("El usuario no posee un pais de residencia.");
        } else {
            if (community  && !community.country._id.equals(me.paisResidencia._id)){
                return UserService.badRequestUserMessage("La comunidad seleccionada no pertenece al pais de " +
                    "residencia del usuario.");
            }
        }

        me.comunidad = communityTemp

        const token = await me.generateAuthToken();

        logger.debug(`Guardar Me en Base de Datos: ${JSON.stringify(me)}`);
        await me.save();

        // Verificar si el usario no posee comunidad e informar
        // @ts-ignore
        if (!me.comunidad) return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El usuario, ${me.email} no esta suscripto a ningúna comunidad`,
                me,
                token
            }

        };

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El usuario, ${me.email}, se ha suscripto a la comunidad  '${me.comunidad.name}'`,
                me,
                token
            }

        };
    }


    public static async getMyCommunityMembers(meId: string,
                                              comunidadId: string,
                                              search: any = null,
                                              {pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination,
                                              showDeleted: boolean = false):Promise<IServiceResponse>{


        if (!comunidadId) return UserService.badRequestUserMessage("El usuario no esta registrado en ninguna comunidad")

        const community: any = await CommunityService.findCommunity(comunidadId);
        if (!community) return CommunityService.notFoundCommunityMessage();

        const {pagination, users} = await CommunityService.findCommunityMembers(meId, comunidadId, search, {pageNumber, pageSize}, showDeleted)
        const usersArray = await this.getFollowerFollowing(users, meId);


        return {
            status: 200,
            response: {
                ok: true,
                community,
                users: {
                    pagination: pagination,
                    users: usersArray
                }
            }
        };

    }


    /*********************************************************
     * Función para obtener información si 'me' esta siguiendo
     * a que usuario y si estos estan siguiendo a 'me'.
     * *******************************************************/

    public static async  getFollowerFollowing(users:any, meId: string) : Promise<any[]> {
        const usersArray = [];
        for (let i = 0; i < users.length; i ++){

            //Buscar si el usuario esta siguiendo a "me" (follower = userID, following = me.id)
            const follower: any = await Follow.findOne({'following': meId, 'follower': users[i]._id})
                .select({following: 0, follower: 0});

            // Buscar si "me" esta siguiendo al usuario (follower = me.id, following = user.id)
            const following: any = await Follow.findOne({'following': users[i]._id, 'follower': meId})
                .select({following: 0, follower: 0});

            usersArray.push({... users[i]._doc, follower, following});

        }
        return usersArray;
    }


}
