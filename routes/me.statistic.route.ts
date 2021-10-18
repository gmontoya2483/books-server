import {Request, Response, Router} from "express";
import {validateDeleteCopy} from "../middlewares/body_request_validation/copy.body.validatios.middleware";
import {BookService} from "../services/book.service";
import {StatisticsService} from "../services/statistics.service";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";

const router = Router();

router.get('/', [], async (req:Request, res: Response)=>{
    // @ts-ignore
    const userId = req.user._id;

    // Obtener los query params
    const showBooksStatistics  = req.query.showBooksStatistics === 'true';
    const showCommunityStatistics = req.query.showCommunityStatistics === 'true';
    const showFollowStatistics = req.query.showFollowStatistics === 'true';
    const showMyCopiesStatistics = req.query.showMyCopiesStatistics === 'true';
    const showMyFriendsCopiesStatistics = req.query.showMyFriendsCopiesStatistics === 'true';

    const returnedResponse = await StatisticsService.getStatistics(
        userId,
        {
            showBooksStatistics,
            showCommunityStatistics,
            showFollowStatistics,
            showMyCopiesStatistics,
            showMyFriendsCopiesStatistics
        });
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
