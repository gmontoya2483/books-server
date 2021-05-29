import {Request, Response, Router} from "express";

import {UserService} from "../services/user.service";
import {
    validateAdministratorUser,
    validateDeleteUser, validateValidateUser
} from "../middlewares/body_request_validation/user.body.validations.middleware";


const router = Router();

router.put('/:id/delete', [validateDeleteUser], async (req:Request, res: Response)=>{
    const returnedResponse = await UserService.setDeleted(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id/validate', [validateValidateUser], async (req:Request, res: Response)=>{
    const sendEmail  = req.query.sendEmail === 'true';
    const returnedResponse = await UserService.setValidated(req.params.id, req.body, sendEmail);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id/administrator', [validateAdministratorUser], async (req:Request, res: Response)=>{
    const returnedResponse = await UserService.setAdmin(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});





export default router;
