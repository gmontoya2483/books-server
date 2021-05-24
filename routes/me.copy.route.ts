import {Request, Response, Router} from "express";
import {validateNewCopy} from "../middlewares/body_request_validation/copy.body.validatios.middleware";
import {BookService} from "../services/book.service";
import {CopyService} from "../services/copy.service";
import {IPagination} from "../interfaces/pagination.interfaces";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {ICriteria} from "../interfaces/copy.interfaces";


const router = Router();

router.post('/', [validateNewCopy], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await CopyService.newCopy(req.user._id,req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);

});

router.get('/', [], async (req:Request, res: Response)=>{

    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    };

    const criteria: ICriteria = {
        // @ts-ignore
        userId: req.user._id
    };

    const returnedResponse = await CopyService.getAllCopies(search, pagination, showDeleted, criteria);
    return res.status(returnedResponse.status).json(returnedResponse.response);

});

export default router;
