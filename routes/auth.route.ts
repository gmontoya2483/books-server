import {Request, Response, Router} from "express";
import {validateAuthenticationBody} from "../middlewares/body_request_validation/auth.body.validations.middleware";
import {AuthService} from "../services/authentication.service";

const router = Router();

router.post('/',[validateAuthenticationBody], async (req: Request, res: Response) => {
    const returnedResponse = await AuthService.authenticateUser(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
