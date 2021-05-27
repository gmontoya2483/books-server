import {Request, Response, Router} from "express";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {validateSetCommunity} from "../middlewares/body_request_validation/me.body.validations.middleware";
import {MeService} from "../services/me.service";
import {IPagination} from "../interfaces/pagination.interfaces";
import {CopyService} from "../services/copy.service";

const router = Router();

router.put('/', [validateSetCommunity], async (req:Request, res: Response)=> {
    // @ts-ignore
    const returnedResponse = await MeService.setMyCommunity(req.user._id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);

});


router.get('/members', [], async (req:Request, res: Response)=> {

    // @ts-ignore
    const communityId = (req.user.comunidad) ? req.user.comunidad._id : null;
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }

    // @ts-ignore
    const returnedResponse = await MeService.getMyCommunityMembers(req.user._id, communityId, search, pagination, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);


});


router.get('/copies', [], async (req:Request, res: Response)=> {

    // @ts-ignore
    const meId = req.user._id
    // @ts-ignore
    const communityId = (req.user.comunidad) ? req.user.comunidad._id : null;
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }

    // @ts-ignore
    const returnedResponse = await CopyService.getAllCopiesByCommunity(search, pagination, showDeleted, {communityId}, meId);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});



export default router;
