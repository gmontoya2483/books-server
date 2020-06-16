import ServerClass from "../classes/server.class";
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet';

import error from "../middlewares/error.middleware";

import mensajes from "../routes/example.route";
import users from "../routes/users.route"
import auth from "../routes/auth.route"


module.exports = function(server: ServerClass){

    // Helmet
    server.app.use(helmet());

    // BodyParser
    server.app.use( bodyParser.urlencoded({ extended: true}));
    server.app.use(bodyParser.json());

    // CORS
    server.app.use( cors({origin: true, credentials: true }));

    // Routes
    server.app.use('/api/example', mensajes);
    server.app.use('/api/users', users);
    server.app.use('/api/auth', auth);


    // Error Middleware
    server.app.use(error);




}
