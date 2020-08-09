import ServerClass from "../classes/server.class";
import bodyParser from 'body-parser';
import cors from 'cors'
import helmet from 'helmet';

import error from "../middlewares/error.middleware";

import mensajes from "../routes/example.route";
import users from "../routes/users.route"
import auth from "../routes/auth.route"
import uploads from "../routes/upload.route"
import countries from "../routes/country.route"
import communities from "../routes/community.route"
import me from "../routes/me.route"
import img from "../routes/img.route"


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
    server.app.use('/api/uploads', uploads);
    server.app.use('/api/countries', countries);
    server.app.use('/api/communities', communities);
    server.app.use('/api/me', me);
    server.app.use('/api/img', img);


    // Error Middleware
    server.app.use(error);




}
