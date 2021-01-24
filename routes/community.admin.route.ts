import {Request, Response, Router} from "express";
import {CommunityService} from "../services/community.service";
import {
    validateDeleteCommunity, validateNewCommunity,
    validateUpdateCommunity
} from "../middlewares/body_request_validation/community.body.validations.middleware";


const router = Router();

router.post('/', [validateNewCommunity], async (req: Request, res: Response) => {
    const returnedResponse = await CommunityService.NewCommunity(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


router.delete('/:id', [], async (req: Request, res: Response) => {
    const returnedResponse = await CommunityService.deleteCommunity(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


router.put('/:id', [validateUpdateCommunity], async(req: Request, res: Response) => {
    const returnedResponse = await CommunityService.updateCommunity(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


router.put('/:id/delete', [validateDeleteCommunity], async (req:Request, res: Response)=>{
    const returnedResponse = await CommunityService.setDeleted(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
