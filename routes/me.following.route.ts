import {Request, Response, Router} from "express";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {validateFollowing} from "../middlewares/body_request_validation/me.body.validations.middleware";
import {FollowService} from "../services/follow.service";
import {IPagination} from "../interfaces/pagination.interfaces";

const router = Router();


router.post('/', [validateFollowing], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await FollowService.requestFollowUser(req.user._id, req.body.followingUserId);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


// Trae todos los usuarios que estoy siguiendo (follower: me._id)
router.get('/', [], async (req:Request, res: Response)=>{
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }
    // @ts-ignore
    const returnedResponse = await FollowService.getAllFollowedByMe(req.user._id,  pagination);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


// trae un usuario al que estoy siguiendo (follower: me._id, following: :id)
router.get('/:id', [], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await FollowService.getSingleFollowedByMe(req.user._id, req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

// dejar de seguir a alguien (follower: me._id, folloing: :id)
router.delete('/:id', [], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await FollowService.deleteFollowedByMe(req.user._id, req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
