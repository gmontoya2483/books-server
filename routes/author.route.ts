import {Request, Response, Router} from "express";
import {isAdmin} from "../middlewares/admin.middleware"
import {
    validateDeleteAuthor,
    validateNewAuthor,
    validateUpdateAuthor
} from "../middlewares/body_request_validation/author.body.validations.middleware"
import {AuthorService} from "../services/author.service";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {IPagination} from "../interfaces/pagination.interfaces";

const router = Router();

router.get('/', [], async (req:Request, res: Response)=>{
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    }

    const returnedResponse = await AuthorService.getAllAuthors(search, pagination, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.getSingleAuthor(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/:id/books', [], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.getBooks(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.post('/', [validateNewAuthor], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.newAuthor(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id', [isAdmin, validateUpdateAuthor], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.updateAuthor(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id/delete', [isAdmin, validateDeleteAuthor], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.setDeleted(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.delete('/:id', [isAdmin], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.deleteAuthor(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
