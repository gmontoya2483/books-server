import {Request, Response, Router} from "express";
import {CopyService} from "../services/copy.service";
import {CountryService} from "../services/country.service";
import {LoanHistory} from "../models/loan.model";
import {LoanHistoryService} from "../services/loanHistory.service";


const router = Router();

router.get('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await CopyService.getSingleCopy(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/:id/loanhistory', [], async (req:Request, res: Response)=>{
     const returnedResponse = await LoanHistoryService.getAllLoanHistoryByCopy(req.params.id);
     return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
