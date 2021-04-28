import {Request, Response, Router} from "express";
import {
    validateDeleteAuthor,
    validateUpdateAuthor
} from "../middlewares/body_request_validation/author.body.validations.middleware"
import {AuthorService} from "../services/author.service";


const router = Router();

router.put('/:id', [validateUpdateAuthor], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.updateAuthor(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id/delete', [validateDeleteAuthor], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.setDeleted(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.delete('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await AuthorService.deleteAuthor(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

export default router;
