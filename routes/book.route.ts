import {Request, Response, Router} from "express";
import {validateNewBook} from "../middlewares/body_request_validation/book.body.validations.middleware";
import {BookService} from "../services/book.service";

const router = Router();

router.get('/', [], async (req: Request, res: Response) => {
    return res.status(200).json({ok: true, mensaje: 'Todos los libros' });
});

router.post('/', [validateNewBook], async (req:Request, res: Response)=>{
    // return res.status(201).json({ok: true, mensaje: 'Nuevo  libro' });
    const returnedResponse = await BookService.newBook(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});



export default router;
