import {Request, Response, Router} from "express";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";
import {FollowService} from "../services/follow.service";

const router = Router();


// Trae todos los usuarios que me estan siguiendo (following: me._id)
router.get('/', [], async (req:Request, res: Response)=>{
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }
    // @ts-ignore
    const returnedResponse = await FollowService.getAllMyFollowers(req.user._id,  pagination);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});



router.get('/:id',[], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await FollowService.getMySingleFollower(req.user._id, req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});



// Confirmar un seguidor
router.put('/:id/confirm',[], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await FollowService.confirmMyFollower(req.user._id, req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


// Borrar un seguidor
router.delete('/:id',[], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await FollowService.deleteMyFollower(req.user._id, req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
