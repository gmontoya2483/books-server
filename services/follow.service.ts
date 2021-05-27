import {IServiceResponse} from "../interfaces/me.follow.interfaces";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {UserService} from "./user.service";
import {Follow} from "../models/follow.models";
import {Pagination} from "../classes/pagination.class";

export abstract class FollowService{

    public static async getAllMyFollowers(meId: string,{pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination): Promise<IServiceResponse> {

        const me: any = await UserService.findUser(meId);
        if (!me) return UserService.notFoundUserMessage();

        // Generar criterio de busqueda
        let criteria = {
            'following': me._id
        };

        // Calcular total de registrios y paginar el resultado
        const totalFollowers = await Follow.countDocuments(criteria);
        const pagination = await new Pagination(totalFollowers,pageNumber, pageSize).getPagination();

        // Actualiza page number de acuerdo a la paginación
        pageNumber = pagination.currentPage;

        // Buscar ususario que siguen a 'me'
        const followers = await Follow.find(criteria)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .select({following: 0})
            .populate('follower', {password: 0});


        const followerArray = await this.getIfMeFollowsUsers(followers, me._id);


        return {
            status: 200,
            response: {
                ok: true,
                followers: {
                    pagination: pagination,
                    followers: followerArray
                }
            }
        };


    }


    public static async getMySingleFollower(meId: string, followerId: string): Promise<IServiceResponse> {

        const me = await UserService.findUser(meId);
        if (!me) return UserService.notFoundUserMessage();

        const follower: any = await UserService.findUser(followerId);
        if (!follower) return UserService.notFoundUserMessage("Seguidor no encontrado");

        const filter = {following: meId, follower: followerId}

        const follow: any = await Follow.findOne(filter)
            .select({following: 0})
            .populate('follower', {password: 0});

        if(!follow) return this.notFoundFollowerMessage(`El usuario ${follower.nombre} ${follower.apellido} no te esta siguiendo`);

        return {
            status: 200,
            response: {
                ok: true,
                follower: follow
            }
        };

    }


    public static async confirmMyFollower(meId: string, followerId: string): Promise<IServiceResponse> {

        const me = await UserService.findUser(meId);
        if (!me) return UserService.notFoundUserMessage();

        const follower: any = await UserService.findUser(followerId);
        if (!follower) return UserService.notFoundUserMessage("Seguidor no encontrado");

        const filter = {following: meId, follower: followerId}

        const follow: any = await Follow.findOneAndUpdate(filter, {
            $set: {
                isConfirmed: {
                    value: true,
                    validatedDateTime: Date.now()
                }
            }
        }, {new: true})
            .select({following: 0})
            .populate('follower', {password: 0});

        if(!follow) return this.notFoundFollowerMessage(`El usuario ${follower.nombre} ${follower.apellido} no te esta siguiendo`);

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `Se ha confirmado la solicitud de seguimiento de ${follower.nombre} ${follower.apellido}.`,
                follower: follow
            }
        };

    }



    public static async deleteMyFollower(meId: string, followerId: string): Promise<IServiceResponse> {

        const me = await UserService.findUser(meId);
        if (!me) return UserService.notFoundUserMessage();

        const follower: any = await UserService.findUser(followerId);
        if (!follower) return UserService.notFoundUserMessage("Seguidor no encontrado");

        const filter = {following: meId, follower: followerId}

        const follow: any = await Follow.findOneAndDelete(filter)
            .select({following: 0})
            .populate('follower', {password: 0});

        if(!follow) return this.notFoundFollowerMessage(`El usuario ${follower.nombre} ${follower.apellido} no te esta siguiendo`);

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `Se ha eliminado al usuario ${follower.nombre} ${follower.apellido} de tus seguidores.`,
                follower: follow
            }
        };


    }



    public static async requestFollowUser(meId: string, followingId: string): Promise<IServiceResponse> {

        // Verifica que exista el usuario actual
        const me: any = await UserService.findUser(meId);
        if (!me)
            return UserService.notFoundUserMessage();

        // Verifica que exista el usuario a seguir
        const following: any = await UserService.findUser(followingId);
        if (!following)
            return UserService.notFoundUserMessage("Usuario a seguir no encontrado");

        // Verificar que no se solicite seguir a si mismo
        if (me._id.equals(following._id))
            return this.badRequestFollowMessage("El usuario no se puede seguir a si mismo");

        // Verifica que el ususario este registrado en alguna comunidad
        if (!me.comunidad)
            return UserService.badRequestUserMessage(`El ususario no esta registrado en ninguna comunidad.`)

        // Verifica que el ususario a seguir este registrado en alguna comunidad
        if (!following.comunidad)
            return UserService.badRequestUserMessage(`El ususario a seguir no esta registrado en ninguna comunidad.`)

        // verificar si el usuario a seguir pertenece a tu comunidad
        if (!me.comunidad._id.equals(following.comunidad._id))
            return this.badRequestFollowMessage(`El usuario ${following.nombre} ${following.apellido} no esta suscripto en tu comunidad.`);

        // Verificar si el usuario ya esta siguiendo al following
        if(await this.existsFollow(meId, followingId))
            return this.badRequestFollowMessage(`Ya estas siguiendo al usuario ${following.nombre} ${following.apellido}.`)

        const follow: any = new Follow({
            follower: me._id,
            following: following._id
        });

        await follow.save();

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `La solicitud para seguir al usuario ${following.nombre} ${following.apellido} fue agregada`,
                follow
            }
        };

    }

    public static async getAllFollowedByMe(meId: string,{pageNumber = 1, pageSize = DEFAULT_PAGE_SIZE}: IPagination): Promise<IServiceResponse> {

        // Verifica que exista el usuario actual
        const me: any = await UserService.findUser(meId);
        if (!me)
            return UserService.notFoundUserMessage();


        // Generar criterio de busqueda
        let criteria = {
            'follower': me._id
        };

        // Calcular total de registrios y paginar el resultado
        const totalFollowing = await Follow.countDocuments(criteria);
        const pagination = await new Pagination(totalFollowing,pageNumber, pageSize).getPagination();

        // Actualiza page number de acuerdo a la paginación
        pageNumber = pagination.currentPage;

        // Buscar usuarios que 'me' esta siguiendo
        const followings: any = await Follow.find(criteria)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .select({follower: 0})
            .populate({
                path: 'following',
                select: {password: 0}
            });

        // Vaerificar si lo usuarios que sigo tambien me siguen
        const followingArray = await this.getIfUsersFollowMe(followings, meId);

        return {
            status: 200,
            response: {
                ok: true,
                followings: {
                    pagination: pagination,
                    followings: followingArray
                }
            }
        };

    }

    public static async getSingleFollowedByMe(meId: string, followingId: string): Promise<IServiceResponse> {

        const me: any = await UserService.findUser(meId);
        if (!me)
            return UserService.notFoundUserMessage();

        const following: any = await UserService.findUser(followingId);
        if (!following)
            return UserService.notFoundUserMessage("Usuario seguido no encontrado");

        const filter = {'follower': me._id, 'following': following._id};

        // Verificar si el usuario esta siguiendo al following
        const follow: any = await Follow.findOne(filter)
            .select({follower: 0}).populate('following', {password: 0});

        if(!follow)
            return this.notFoundFollowingMessage(`No estas siguiendo al usuario ${following.nombre} ${following.apellido}.`);

        return {
            status: 200,
            response: {
                ok: true,
                following: follow
            }
        };

    }


    public static async deleteFollowedByMe(meId: string, followingId: string): Promise<IServiceResponse> {

        const me = await UserService.findUser(meId);
        if (!me) return UserService.notFoundUserMessage();

        const following: any = await UserService.findUser(followingId);
        if (!following) return UserService.notFoundUserMessage("Usuario seguido no encontrado");

        const filter = {following: followingId, follower: meId}

        const follow: any = await Follow.findOneAndDelete(filter)
            .select({follower: 0})
            .populate('following', {password: 0});

        if(!follow) return this.notFoundFollowingMessage(`No estas siguiendo al usuario ${following.nombre} ${following.apellido}.`);

        return {
            status: 200,
            response: {
                ok: true,
                mensaje: `Dejaste de seguir al usuario ${following.nombre} ${following.apellido}.`,
                following: follow
            }
        };

    }

    public static async getIfUserAFollowsUserB(userA: string, userB: string, isConfirmed = true): Promise<boolean>{
        const criteria = {
            follower: userA,
            following: userB,
            'isConfirmed.value': isConfirmed
        }

        const follow: any = await Follow.findOne(criteria);
        return !!(follow);

    }





    /*********************************************************
     * Función para obtener información si 'me' también sigue al
     * usuario que lo esta siguiendo.
     * *******************************************************/

    private static async getIfMeFollowsUsers(followers:any, meId: string) : Promise<any[]> {
        const usersArray = [];
        for (let i = 0; i < followers.length; i ++){

            //Buscar si el usuario esta siguiendo a "me" (follower = userID, following = me.id)
            const following: any = await Follow.findOne({'follower': meId, 'following': followers[i].follower._id})
                .select({following: 0, follower: 0});

            usersArray.push({... followers[i]._doc, following});

        }
        return usersArray;
    }

    /*********************************************************
     * Función para obtener información si el usuario que sigue 'me'
     *  tambien esta siguiendo a 'me'.
     * *******************************************************/

    private static async getIfUsersFollowMe(followings:any, meId: string) : Promise<any[]> {
        const usersArray = [];
        for (let i = 0; i < followings.length; i ++){

            //Buscar si el usuario esta siguiendo a "me" (follower = userID, following = me.id)
            const follower: any = await Follow.findOne({'following': meId, 'follower': followings[i].following._id})
                .select({following: 0, follower: 0});

            usersArray.push({... followings[i]._doc, follower});

        }
        return usersArray;
    }


    public static notFoundFollowerMessage(mensaje: string = "El usuario no te esta siguiendo"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    public static notFoundFollowingMessage(mensaje: string = "No estas siguiendo al usuario"): IServiceResponse {
        return {
            status: 404,
            response: {
                ok: false,
                mensaje
            }
        };
    }

    public static badRequestFollowMessage(mensaje: string): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }


    private static async existsFollow(follower: string, following: string): Promise<boolean>{
        return !!(await Follow.findOne({follower, following}));
    }

}
