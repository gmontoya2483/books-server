import {Request, Response, Router} from "express";
import {MeService} from "../services/me.service";

const router = Router();

router.post('/', [], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await MeService.generateToken(req.user._id)
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
