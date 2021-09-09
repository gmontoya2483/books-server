import {Request, Response, Router} from "express";
import {validateSetCopyLoanStatus} from "../middlewares/body_request_validation/copy.body.validatios.middleware";
import {CopyService} from "../services/copy.service";


const router = Router();

router.put('/:id', [validateSetCopyLoanStatus], async (req:Request, res: Response)=>{
    // @ts-ignore
    const userId = req.user._id;
    const copyId = req.params.id;

    const returnedResponse = await CopyService.setCopyLoanStatus(userId, copyId, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
