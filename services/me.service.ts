import {IServiceResponse, IUpdateMe} from "../interfaces/me.interfaces";
import {UserService} from "./user.service";
import {User} from "../models/user.model";
import logger from "../startup/logger.startup";
import {CountryService} from "./country.service";
import {CommunityService} from "./community.service";


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
        me.paisResidencia = country;

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


}
