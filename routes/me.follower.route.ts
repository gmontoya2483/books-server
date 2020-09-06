import {Request, Response, Router} from "express";
import {User} from "../models/user.model";
const auth = require('../middlewares/auth.middleware');
const log_request = require('../middlewares/log_request.middleware');
const validated = require('../middlewares/validated.middleware');

const router = Router();






export default router;
