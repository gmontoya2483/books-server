import {Request, Response, Router} from "express";

import {UserService} from "../services/user.service";
import {
    validateChangePassword,
    validateChangePasswordRequest,
    validateNewUser
} from "../middlewares/body_request_validation/user.body.validations.middleware";
import {isAuthorized} from "../middlewares/auth.middleware";
import {isValidated} from "../middlewares/validated.middleware";
import {IPagination} from "../interfaces/pagination.interfaces";
import {DEFAULT_PAGE_SIZE} from "../globals/environment.global";
import {ICriteria} from "../interfaces/copy.interfaces";
import {CopyService} from "../services/copy.service";



const router = Router();


router.get('/:id', [isAuthorized, isValidated], async (req:Request, res: Response)=>{
    const returnedResponse = await UserService.getSingleUser(req.params.id);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


router.get('/:id/copies', [isAuthorized, isValidated], async (req:Request, res: Response)=>{

    const search = req.query.search || null;
    const showDeleted  = req.query.showDeleted === 'true';
    const pagination: IPagination = {
        pageNumber: Number(req.query.page) || 1,
        pageSize : Number(req.query.pageSize) || DEFAULT_PAGE_SIZE
    };

    const criteria: ICriteria = {
        userId: req.params.id
    };

    const returnedResponse = await CopyService.getAllCopiesByUser(search, pagination, showDeleted, criteria);
    return res.status(returnedResponse.status).json(returnedResponse.response);

});


router.get('/', [isAuthorized], (req:Request, res: Response)=>{
    res.json({
        ok: true,
        pagina_actual: 1,
        total_paginas: 1,
        total: 2,
        user: req.body.user,
        mensaje: 'lista de users',
        usuarios: [
            {
                _id: '112223454',
                email: 'blavla@gmail.com',
                nombre: 'nombre',
                apellido: 'apellido',
                isAdmin: false
            },
            {
                _id: '112223454',
                email: 'blavla@gmail.com',
                nombre: 'nombre',
                apellido: 'apellido',
                isAdmin: false
            }
        ]
    });
});



router.post('/', [validateNewUser], async (req:Request, res: Response)=>{
    const returnedResponse = await UserService.newUser(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});



router.put('/validateEmail',[isAuthorized], async (req:Request, res: Response) => {
    // @ts-ignore
    const returnedResponse = await UserService.validateEmail(req.user);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


router.post('/changePassword', [validateChangePasswordRequest], async (req: Request, res: Response)=>{
    const returnedResponse = await UserService.changePasswordRequest(req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


router.put('/changePassword', [isAuthorized, validateChangePassword], async (req: Request, res: Response)=>{
    // @ts-ignore
    const returnedResponse = await UserService.changePassword(req.user._id, req.body);
    return res.status(returnedResponse.status).json(returnedResponse.response);
});


export default router;
