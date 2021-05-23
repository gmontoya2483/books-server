import {Request, Response, Router} from "express";
import {validateNewCopy} from "../middlewares/body_request_validation/copy.body.validatios.middleware";
import {BookService} from "../services/book.service";
import {CopyService} from "../services/copy.service";


const router = Router();

router.post('/', [validateNewCopy], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await CopyService.newCopy(req.user._id,req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);

});

router.get('/', [], async (req:Request, res: Response)=>{

    return res.status(200).json({result: 'ok'})

    // const pagination: IPagination = {
    //     pageNumber: Number(req.query.page) || 1,
    //     pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    // }
    // // @ts-ignore
    // const returnedResponse = await FollowService.getAllMyFollowers(req.user._id,  pagination);
    // return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
