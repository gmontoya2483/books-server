import {Request, Response, Router} from "express";
import {isAdmin} from "../middlewares/admin.middleware"
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {
    validateDeleteCommunity,
    validateNewCommunity, validateUpdateCommunity
} from "../middlewares/body_request_validation/community.body.validations.middleware";
import {CommunityService} from "../services/community.service";
import {IPagination} from "../interfaces/pagination.interfaces";

const router = Router();

router.get('/', [], async (req: Request, res: Response) => {
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const returnedResponse = await CommunityService.getAllCommunities(search, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/:id', [], async(req: Request, res: Response) => {
    const returnedResponse = await CommunityService.getSingleCommunity(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


// router.post('/', [isAdmin, validateNewCommunity], async (req: Request, res: Response) => {
//     const returnedResponse = await CommunityService.NewCommunity(req.body);
//     return res.status(returnedResponse.status).json(returnedResponse.response);
// });
//
//
// router.delete('/:id', [isAdmin], async (req: Request, res: Response) => {
//     const returnedResponse = await CommunityService.deleteCommunity(req.params.id);
//     return res.status(returnedResponse.status).json(returnedResponse.response);
// });
//
//
// router.put('/:id', [isAdmin, validateUpdateCommunity], async(req: Request, res: Response) => {
//     const returnedResponse = await CommunityService.updateCommunity(req.params.id, req.body);
//     return res.status(returnedResponse.status).json(returnedResponse.response);
// });
//
//
// router.put('/:id/delete', [isAdmin, validateDeleteCommunity], async (req:Request, res: Response)=>{
//     const returnedResponse = await CommunityService.setDeleted(req.params.id, req.body);
//     return res.status(returnedResponse.status).json(returnedResponse.response);
// });



router.get('/:id/members', [], async(req: Request, res: Response) => {
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }
    const returnedResponse = await CommunityService.getCommunityMembers(req.params.id, search, pagination, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
