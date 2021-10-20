import {BookService} from "./book.service";
import {IShowStatisticsOptions} from "../interfaces/me.statistic.interface";
import {UserService} from "./user.service";
import {IServiceResponse} from "../interfaces/me.statistic.interface";
import {CommunityService} from "./community.service";
import {FollowService} from "./follow.service";
import {CopyService} from "./copy.service";

export abstract class StatisticsService {


    public static async getStatistics(userId: string, {
        showBooksStatistics,
        showCommunityStatistics,
        showFollowStatistics,
        showMyCopiesStatistics
    }: IShowStatisticsOptions) {

        // Obtener el usuario que hizo el request
        const user = await UserService.retrieveUserInfo(userId);
        if(!user) return this.badRequestStatisticsMessage("No se encontró el usuario");


        let response = {};
        response = {...response, ok: true};

        if (showBooksStatistics) {
            const booksStatistics = await BookService.getBookStatisticInfo();
            response = {...response, booksStatistics};
        }

        if (showCommunityStatistics && user.comunidad) {

            const communityStatistics = await CommunityService.getCommunityStatisticInfo(
                user.comunidad._id,
                user.comunidad.name
            );

            response = {...response, communityStatistics};
        }

        if (showFollowStatistics) {
            const followStatistics = await FollowService.getFollowStatisticsInfo(userId, user.email);
            response = {...response, followStatistics};
        }

        if (showMyCopiesStatistics) {
            const myCopiesStatistics = await CopyService.getCopiesByUserIdStatisticsInfo(userId, user.email);
            response = {...response, myCopiesStatistics};
        }


        return {
            status: 200,
            response
        };

    }


    public static badRequestStatisticsMessage(mensaje: string): IServiceResponse {
        return {
            status: 400,
            response: {
                ok: false,
                mensaje
            }
        };
    }


}
