import {Request, Response, Router} from "express";


const router = Router();

router.get('/', [], (req:Request, res: Response)=>{
    res.json({
        ok: true,
        mensaje: 'GET - Todo esta bien!!!'
    });
});

router.post('/:id', [], (req:Request, res: Response)=>{
    const sort = req.query.sort;
    const id = req.params.id;
    const cuerpo  = req.body.cuerpo;
    const de = req.body.de;

    res.json({
        ok: true,
        sort,
        id,
        de,
        cuerpo,
        mensaje: 'POST - Todo esta bien!!!'
    });
});

router.post('/', [], (req:Request, res: Response)=>{

    const cuerpo  = req.body.cuerpo;
    const de = req.body.de;

    res.json({
        ok: true,
        de,
        cuerpo,
        mensaje: 'POST - Todo esta bien!!!'
    });
});


export default router;

