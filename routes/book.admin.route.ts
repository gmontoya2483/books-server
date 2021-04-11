import {Request, Response, Router} from "express";
import {
    validateDeleteBook,
    validateUpdateBook
} from "../middlewares/body_request_validation/book.body.validations.middleware";
import {BookService} from "../services/book.service";

const router = Router();

router.put( '/:id', [validateUpdateBook], async (req:Request, res: Response)=>{
    const returnedResponse = await BookService.updateBook(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id/delete', [validateDeleteBook], async (req:Request, res: Response)=>{
    const returnedResponse = await BookService.setDeleted(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.delete('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await BookService.deleteBook(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
