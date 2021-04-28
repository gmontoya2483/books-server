
import {Request, Response, Router} from "express";
import {CountryService} from "../services/country.service";

const router = Router();


router.get('/', [], async (req: Request, res: Response) => {
    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const returnedResponse = await CountryService.getAllCountries(search, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


router.get('/:id', [], async(req: Request, res: Response) => {
    const returnedResponse = await CountryService.getSingleCountry(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});

router.get('/:id/communities', [], async(req: Request, res: Response) => {
    const showDeleted  = req.query.showDeleted === 'true';
    const returnedResponse = await CountryService.getCommunities(req.params.id, showDeleted);
    return res.status(returnedResponse.status).json(returnedResponse.response);

});


export default router;
