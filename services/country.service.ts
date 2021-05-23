import {IDeleteCountry, INewCountry, IServiceResponse, IUpdateCountry} from "../interfaces/country.interfaces";
import {Country} from "../models/country.model";
import {CommunityService} from "./community.service";


const mongoose = require('mongoose');
const Fawn = require('fawn');

// Init fawn for using transactions
Fawn.init(mongoose, 'trxCountryCommunitiesUsers');

export abstract class CountryService {
    public static async getSingleCountry(countryId: string) : Promise<IServiceResponse> {
        const country : any = await Country.findById(countryId);
        if (!country) return this.notFoundCountryMessage();

        return {
            status: 200,
            response: {
                ok: true,
                country
            }
        };
    }

    public static async getAllCountries(search: any= null, showDeleted: boolean = false): Promise<IServiceResponse> {

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

        const countries = await Country.find(criteria).sort({name: 1});
        const total = countries.length;
        return {
            status: 200,
            response: {
                ok: true,
                total,
                countries
            }
        };

    }

    public static async getCommunities(countryId: string, showDeleted: boolean = false): Promise<IServiceResponse> {
        // Generar criterio de búsqueda
        let criteria = {};
        criteria = {
            ...criteria,
            'country._id': countryId,
        }

        // Verificar si se muestran los marcados como borrados
        if (!showDeleted){
            criteria = {
                ... criteria,
                'isDeleted.value': false
            }
        }

        const country: any = await Country.findById(countryId);
        if(!country) return this.notFoundCountryMessage();

        const communities = await CommunityService.getCommunities(criteria);

        const total = communities.length;
        return {
            status: 200,
            response: {
                ok: true,
                total,
                country,
                communities
            }
        };
    }



    public static async newCountry ({name}: INewCountry): Promise<IServiceResponse>{

        name = name.trim().toUpperCase();
        const country: any = new Country({ name });
        await country.save();

        return {
            status: 201,
            response: {
                ok: true,
                mensaje: `El pais ${ country.name } ha sido agregado`,
                country
            }
        }
    }

    public static async deleteCountry(countryId: string): Promise<IServiceResponse> {

        if(await CommunityService.existsCommunity({'country._id': countryId})) return {
            status: 400,
            response: {
                ok: false,
                mensaje: `El Pais tiene comunidades asociadas`
            }
        };

        const country: any = await Country.findByIdAndDelete(countryId);
        if (!country) return this.notFoundCountryMessage();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `El pais ${country.name} ha sido eliminado`,
                country
            }
        };

    }

    public static async updateCountry(countryId: string, {name}:IUpdateCountry): Promise<IServiceResponse>{

        let country: any = await Country.findById(countryId);
        if (!country) return this.notFoundCountryMessage();

        country.name = name.trim().toUpperCase();

        try {
            new Fawn.Task()
                .update('countries', {_id: country._id}, {
                    // @ts-ignore
                    $set: {
                        name: country.name,
                        dateTimeUpdated: Date.now()
                    }
                })
                .update('communities', {'country._id': country._id},{
                    // @ts-ignore
                    $set: {
                        'country.name': country.name,
                        dateTimeUpdated: Date.now()
                    }
                })
                .update('users', {'paisResidencia._id': country._id},{
                    // @ts-ignore
                    $set: {
                        'paisResidencia.name': country.name,
                        updatedDateTime: Date.now()
                    }
                })
                .options({multi: true})
                .run();

            return {
                status: 200,
                response: {
                    ok: true,
                    mensaje: `El pais ${country.name} ha sido modificado`,
                    country
                }
            };


        } catch (e) {

            return {
                status: 500,
                response: {
                    ok: false,
                    mensaje: `Internal Server Error.`
                }
            };

        }

    }

    public static async setDeleted (countryId: string, {isDeleted}: IDeleteCountry): Promise<IServiceResponse>{
        const deleted = (isDeleted) ? {value: true, deletedDateTime: Date.now()}
            : {value: false, deletedDateTime: null};

        const country: any = await Country.findByIdAndUpdate(countryId, {
            $set: {
                isDeleted: deleted,
                dateTimeUpdated: Date.now()
            }
        }, {new: true});

        if (!country) return this.notFoundCountryMessage();

        const message = (isDeleted) ? `El pais ha sido marcada como eliminado`
            : `El pais ha sido desmarcado como eliminado`

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: message,
                country
            }

        };

    }

    public static async findCountry(countryId: string) {
        return  Country.findById(countryId).select({_v: 0 });
    }



    public static notFoundCountryMessage(mensaje: string = "Pais no encontrada"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }




}
