import {Request, Response, Router} from "express";
import {validateNewBook} from "../middlewares/body_request_validation/book.body.validations.middleware";
import {BookService} from "../services/book.service";
import {IPagination} from "../interfaces/pagination.interfaces";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";

const router = Router();

router.get('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await BookService.getSingleBook(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/', [], async (req: Request, res: Response) => {
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }

    const returnedResponse = await BookService.getAllBooks(search, pagination, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.post('/', [validateNewBook], async (req:Request, res: Response)=>{
    const returnedResponse = await BookService.newBook(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});



export default router;
