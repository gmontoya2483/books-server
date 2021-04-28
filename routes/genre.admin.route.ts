import {Request, Response, Router} from "express";
import {
    validateDeleteGenre,
    validateNewGenre,
    validateUpdateGenre
} from "../middlewares/body_request_validation/genre.body.validations.middleware";
import {GenreService} from "../services/genre.service";
const router = Router();

router.post('/', [validateNewGenre], async (req:Request, res: Response)=>{
    const returnedResponse = await GenreService.newGenre(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id', [validateUpdateGenre], async (req:Request, res: Response)=>{
    const returnedResponse = await GenreService.updateGenre(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id/delete', [validateDeleteGenre], async (req:Request, res: Response)=>{
    const returnedResponse = await GenreService.setDeleted(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.delete('/:id', [], async (req:Request, res: Response)=>{
    const returnedResponse = await GenreService.deleteGenre(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
