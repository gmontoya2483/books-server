import {Request, Response, Router} from "express";
import {validateUpdateMe} from "../middlewares/body_request_validation/me.body.validations.middleware";
import {MeService} from "../services/me.service";
import {validateDeleteUser} from "../middlewares/body_request_validation/user.body.validations.middleware";
import {UserService} from "../services/user.service";

const router = Router();

router.get('/', [], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await MeService.getMe(req.user._id)
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/', [validateUpdateMe], async (req:Request, res: Response)=> {
    // @ts-ignore
    const returnedResponse = await MeService.updateMe(req.user._id, req.body, false)
    return res.status(returnedResponse.status).json(returnedResponse.response);

});

router.put('/delete', [validateDeleteUser], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await UserService.setDeleted(req.user._id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
