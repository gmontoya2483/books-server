import {Request, Response, Router} from "express";
import {
    validateDeleteCopy,
    validateNewCopy
} from "../middlewares/body_request_validation/copy.body.validatios.middleware";
import {CopyService} from "../services/copy.service";
import {IPagination} from "../interfaces/pagination.interfaces";
import {ICriteria} from "../interfaces/copy.interfaces";
import {GenreService} from "../services/genre.service";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";


const router = Router();

router.post('/', [validateNewCopy], async (req:Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await CopyService.newCopy(req.user._id,req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);

});

router.get('/', [], async (req:Request, res: Response)=>{
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const showOnlyBorrowed = req.query.showOnlyBorrowed === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    };

    const criteria: ICriteria = {
        // @ts-ignore
        userId: req.user._id
    };

    const returnedResponse = await CopyService.getAllCopiesByUser(search, pagination, showDeleted, criteria, showOnlyBorrowed);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/following', [], async (req:Request, res: Response) => {

    // @ts-ignore
    const userId = req.user._id
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const showOnlyBorrowedToMe  = req.query.showOnlyBorrowedToMe === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    };

    const returnedResponse = await CopyService.getAllCopiesByUserIsFollowing(userId, search, pagination, showDeleted, showOnlyBorrowedToMe);
    return res.status(returnedResponse.status).json(returnedResponse.response);

});


router.put('/:id/delete', [validateDeleteCopy], async (req:Request, res: Response)=>{
    // @ts-ignore
    const userId = req.user._id;
    const returnedResponse = await CopyService.setDeleted(req.params.id, req.body, userId);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});




export default router;
