import {Request, Response, Router} from "express";
import {LoanHistoryService} from "../services/loanHistory.service";

const router = Router();

router.get('/', [], async (req:Request, res: Response) => {
    // @ts-ignore
    const userId = req.user._id
    const returnedResponse = await LoanHistoryService.getAllLoanHistoryByRequester(userId);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
