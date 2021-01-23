import {Request, Response, Router} from "express";
import {
    validateDeleteCountry,
    validateNewCountry,
    validateUpdateCountry
} from "../middlewares/body_request_validation/country.body.validations.middleware";
import {CountryService} from "../services/country.service";


const router = Router();


router.post('/', [validateNewCountry], async (req:Request, res: Response) => {
    const returnedResponse = await CountryService.newCountry(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


router.delete('/:id', [], async (req:Request, res: Response) => {
    const returnedResponse = await CountryService.deleteCountry(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id', [validateUpdateCountry],async(req: Request, res: Response) => {
    const returnedResponse = await CountryService.updateCountry(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.put('/:id/delete', [validateDeleteCountry], async (req:Request, res: Response)=>{
    const returnedResponse = await CountryService.setDeleted(req.params.id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
